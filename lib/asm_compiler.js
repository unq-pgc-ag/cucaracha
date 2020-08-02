const asmBuilder = require('./asm_builder');
const localVarAnalyzer = require('../lib/local_var_analyzer');

const registers = ['rdi', 'rsi', 'rax', 'rbx', 'rcx', 'rdx', 'r8', 'r9', 'r10', 'r11', 'r12', 'r13', 'r14', 'r15' ];
let labelCounter = 0;

function compileStmtCallExpression(expression, context, register) {
  const originalRegisters = context.availableRegisters.slice();
  const index = context.availableRegisters.indexOf(register);
  context.availableRegisters = context.availableRegisters.slice(index);
  const result = compile(expression, context);
  context.availableRegisters = originalRegisters;
  return result;
}

function cucaCall(id) {
  return asmBuilder.call(`cuca_${ id}`);
}

function compileBinaryExpression(ast, context, operator) {
  const originalRegisters = context.availableRegisters.slice();
  const first = compile(ast.expr1, context);
  context.availableRegisters.shift();
  const second = compile(ast.expr2, context);
  context.availableRegisters = originalRegisters;
  const end = [ asmBuilder[operator](originalRegisters[0], originalRegisters[1]) ];
  return first.concat(second).concat(end);
}

function compileRelationalExpression(ast, context, jump) {
  const originalRegisters = context.availableRegisters.slice();
  const first = compile(ast.expr1, context);
  context.availableRegisters.shift();
  const second = compile(ast.expr2, context);
  context.availableRegisters = originalRegisters;
  const labelCmp1 = labelCounter;
  const labelCmp2 = labelCmp1 + 1;
  labelCounter = labelCounter + 2;
  const end = [
    asmBuilder.cmp(originalRegisters[0], originalRegisters[1]),
    asmBuilder[jump](`.label_cmp_${ labelCmp1.toString()}`),
    asmBuilder.mov('rdi', '0'),
    asmBuilder.jmp(`.label_cmp_${ labelCmp2.toString()}`),
    asmBuilder.label(`.label_cmp_${ labelCmp1.toString()}`),
    asmBuilder.mov('rdi', '-1'), // -1 es True ;)
    asmBuilder.label(`.label_cmp_${ labelCmp2.toString()}`),
  ];
  return first.concat(second).concat(end);
}

// TODO mover a otro lado
Array.prototype.diff = function(a) {
    return this.filter(function(i) { return a.indexOf(i) < 0; });
};

const CompileNodesFunctions = {
  // DEFINICIONES PRINCIPALES
  Program(ast, _context) {
    const header = [
      asmBuilder.section('.data'),
      asmBuilder.database('lli_format_string', '"%lli"'),
      asmBuilder.section('.text'),
      asmBuilder.global('main'),
      asmBuilder.extern(['exit', 'putchar', 'printf']),
    ];
    const definitions = ast.functions.reduce(function(acc, def) {
      return acc.concat(compile(def));
    }, []);
    const mainSubroutine = [
      asmBuilder.subroutine('main', [
        cucaCall('main'),
        asmBuilder.mov('rdi', '0'),
        asmBuilder.call('exit'),
      ]),
    ];
    return header.concat(definitions).concat(mainSubroutine);
  },

  Function(ast) {
    const paramNames = ast.params.map(function(param) {
      return param.id;
    });
    const context = {
      localVarNames: localVarAnalyzer.allVarNames(ast.block).diff(paramNames),
      params: paramNames,
      availableRegisters: registers.slice(),
    };
    const restoreRbp = asmBuilder.mov('rbp', 'rsp');
    const localVars = localVarAnalyzer.count(ast.block);
    const space = asmBuilder.sub('rsp', (8 * localVars).toString());
    const spaceForLocalVariables = localVars === 0 ? [] : [space];
    const funcBlock = compile(ast.block, context);
    const funcBody = [asmBuilder.push('rbp'), restoreRbp]
      .concat(spaceForLocalVariables)
      .concat(funcBlock)
      .concat([asmBuilder.mov('rsp', 'rbp'), asmBuilder.pop('rbp'), asmBuilder.ret()]);
    return [asmBuilder.subroutine(`cuca_${ast.id}`, funcBody)];
  },

  // COMANDOS
  StmtCall(ast, context) {
    // TODO estoy asumiendo que la expresion es atomica en todos los casos
    if (ast.id === 'putChar') {
      return compileStmtCallExpression(ast.expressions[0], context, 'rdi')
        .concat([asmBuilder.call('putchar')]);
    } else if (ast.id === 'putNum') {
      return compileStmtCallExpression(ast.expressions[0], context, 'rsi')
        .concat([
          asmBuilder.mov('rdi', 'lli_format_string'),
          asmBuilder.mov('rax', 0),
          asmBuilder.call('printf'),
        ]);
    } else if (ast.expressions.length > 0) { // tiene parámetros
      let params = [];
      const space = (ast.expressions.length * 8).toString();
      for (let i = 0; i < ast.expressions.length; i++) {
        params = params
          .concat(compileStmtCallExpression(ast.expressions[i], context, 'rdi'))
          .concat([asmBuilder.mov(`[rsp + ${(8 * i).toString()}]`, 'rdi')]);
      }
      return [asmBuilder.sub('rsp', space)]
        .concat(params)
        .concat([cucaCall(ast.id), asmBuilder.add('rsp', space)]);
    } else {
      return [cucaCall(ast.id)];
    }
  },

  Block(ast, context) {
    return ast.instructions.reduce(function(acc, current) {
      return acc.concat(compile(current, context));
    }, []);
  },

  StmtAssign(ast, context) {
    let memPosition, memMov;
    let index = context.localVarNames.indexOf(ast.id);
    if (index === -1) { // si no esta en las variables locales, entonces es un parámetro
      index = context.params.indexOf(ast.id);
      memPosition = ((index + 2) * 8).toString();
      memMov = asmBuilder.mov(`[rbp + ${memPosition}]`, 'rdi');
    } else {
      memPosition = ((index + 1) * 8).toString();
      memMov = asmBuilder.mov(`[rbp - ${memPosition}]`, 'rdi');
    }
    return compile(ast.expr, context).concat([memMov]);
  },

  StmtIf(ast, context) {
    const condicion = compile(ast.expr, context);
    const bloque = compile(ast.block, context);
    const labelNumber = labelCounter;
    const endLabel = `.label_end_${labelNumber.toString()}`;
    labelCounter++;
    return condicion.concat(
      [asmBuilder.cmp('rdi', '0'), asmBuilder.je(endLabel)]
    ).concat(bloque).concat(
      [asmBuilder.label(endLabel)]
    );
  },

  StmtIfElse(ast, context) {
    const condicion = compile(ast.expr, context);
    const bloque1 = compile(ast.block1, context);
    const bloque2 = compile(ast.block2, context);
    const labelNumber = labelCounter;
    const elseLabel = `.label_else_${labelNumber.toString()}`;
    const endLabel = `.label_end_${labelNumber.toString()}`;
    labelCounter++;
    return condicion.concat(
      [asmBuilder.cmp('rdi', '0'), asmBuilder.je(elseLabel)]
    ).concat(bloque1).concat(
      [asmBuilder.jmp(endLabel), asmBuilder.label(elseLabel)]
    ).concat(bloque2).concat(
      [asmBuilder.label(endLabel)]
    );
  },

  StmtReturn(ast, context) {
    return compile(ast.expr, context)
      .concat([asmBuilder.mov('rax', context.availableRegisters[0])]);
  },

  // EXPRESIONES
  ExprConstNum(ast, context) {
    return [asmBuilder.mov(context.availableRegisters[0], ast.value)];
  },

  ExprConstBool(ast, context) {
    return [asmBuilder.mov(context.availableRegisters[0], ast.value === 'True' ? '-1' : '0')];
  },

  ExprAdd(ast, context) {
    return compileBinaryExpression(ast, context, 'add');
  },

  ExprSub(ast, context) {
    return compileBinaryExpression(ast, context, 'sub');
  },

  ExprMul(ast, context) {
    return compileBinaryExpression(ast, context, 'mul');
  },

  ExprAnd(ast, context) {
    return compileBinaryExpression(ast, context, 'and');
  },

  ExprOr(ast, context) {
    return compileBinaryExpression(ast, context, 'or');
  },

  ExprNot(ast, context) {
    return compile(ast.expr, context)
      .concat([asmBuilder.not(context.availableRegisters[0])]);
  },

  ExprVar(ast, context) {
    const paramPosition = context.params.indexOf(ast.value);
    const register = context.availableRegisters[0];
    if (paramPosition !== -1) { // es un parametro
      return [asmBuilder.mov(register, `[rbp + ${(8 * (paramPosition + 2)).toString()}]`)];
    } else { // es una variable local
      const varIndex = context.localVarNames.indexOf(ast.value);
      return [asmBuilder.mov(register, `[rbp - ${(8 * (varIndex + 1)).toString()}]`)];
    }
  },

  ExprCall(ast, context) {
    const usedRegisters = registers.diff(context.availableRegisters);
    const pushedRegisters = usedRegisters.map(function(register) {
      return asmBuilder.push(register);
    });
    const poppedRegisters = usedRegisters.map(function(register) {
      return asmBuilder.pop(register);
    });
    let call;
    if (ast.exprList.length > 0) { // tiene parámetros
      let params = [];
      const space = (ast.exprList.length * 8).toString();
      for (let i = 0; i < ast.exprList.length; i++) {
        params = params
          .concat(compileStmtCallExpression(ast.exprList[i], context, 'rdi'))
          .concat([asmBuilder.mov(`[rsp + ${(8 * i).toString()}]`, 'rdi')]);
      }
      call = [asmBuilder.sub('rsp', space)]
        .concat(params)
        .concat([cucaCall(ast.id), asmBuilder.add('rsp', space)]);
    } else {
      call = [cucaCall(ast.id)];
    }
    return pushedRegisters.concat(call).concat(poppedRegisters);
  },

  ExprEq(ast, context) {
    return compileRelationalExpression(ast, context, 'je');
  },

  ExprGe(ast, context) {
    return compileRelationalExpression(ast, context, 'jge');
  },

  ExprLe(ast, context) {
    return compileRelationalExpression(ast, context, 'jle');
  },

  ExprLt(ast, context) {
    return compileRelationalExpression(ast, context, 'jl');
  },

  ExprGt(ast, context) {
    return compileRelationalExpression(ast, context, 'jg');
  },

  ExprNe(ast, context) {
    return compileRelationalExpression(ast, context, 'jne');
  },
};

function compile(ast, context) {
  const compileFunc = CompileNodesFunctions[ast.node];
  if (!compileFunc) { console.log(`La función de compilación no está definida para el nodo ${ast.node}`); }
  let contextToUse = context || {};
  if (!contextToUse.localVarNames && !contextToUse.params && !contextToUse.availableRegisters) {
    contextToUse = { localVarNames: [], params: [], availableRegisters: registers };
  }
  return compileFunc(ast, contextToUse);
}

const InstructionPrintFunctions = {
  section(section) {
    return `section ${section.name}`;
  },
  database(database) {
    return `${database.name} db ${database.value}`;
  },
  global(globalInst) {
    return `global ${globalInst.name}`;
  },
  extern(extern) {
    return `extern ${extern.routineNames.join(', ')}`;
  },
  subroutine(subroutine) {
    return `${subroutine.label}:\n${generateOutput(subroutine.instructions)}`;
  },
  mov(mov) {
    return `mov ${mov.register}, ${mov.value}`;
  },
  call(call) {
    return `call ${call.name}`;
  },
  ret(_ret) {
    return 'ret';
  },
  push(push) {
    return `push ${push.value}`;
  },
  pop(pop) {
    return `pop ${pop.value}`;
  },
  add(add) {
    return `add ${add.register}, ${add.value}`;
  },
  sub(sub) {
    return `sub ${sub.register}, ${sub.value}`;
  },
  imul(mul) {
    return `imul ${mul.register}, ${mul.value}`;
  },
  and(and) {
    return `and ${and.reg1}, ${and.reg2}`;
  },
  or(or) {
    return `or ${or.reg1}, ${or.reg2}`;
  },
  not(not) {
    return `not ${not.register}`;
  },
  cmp(cmp) {
    return `cmp ${cmp.value1}, ${cmp.value2}`;
  },
  je(je) {
    return `je ${je.label}`;
  },
  jne(jne) {
    return `jne ${jne.label}`;
  },
  jg(jg) {
    return `jg ${jg.label}`;
  },
  jge(jge) {
    return `jge ${jge.label}`;
  },
  jl(jl) {
    return `jl ${jl.label}`;
  },
  jle(jle) {
    return `jle ${jle.label}`;
  },
  jmp(jmp) {
    return `jmp ${jmp.label}`;
  },
  label(label) {
    return `${label.label}:`;
  },
};

function generateOutput(instructions) {
  return instructions.reduce(function(acc, current) {
    const printFunction = InstructionPrintFunctions[current.instruction];
    if (!printFunction) { console.log(`No hay función para imprimir la instrucción ${current.instruction}`); }
    return `${acc + printFunction(current) }\n`;
  }, '');
}

module.exports = {
  compile: compile,
  generateOutput: generateOutput
};
