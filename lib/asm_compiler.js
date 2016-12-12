var asmBuilder = require('./asm_builder');
var localVarAnalyzer = require('../lib/local_var_analyzer');

var registers = ['rdi', 'rsi', 'rax', 'rbx', 'rcx', 'rdx', 'r8', 'r9', 'r10', 'r11', 'r12', 'r13', 'r14', 'r15' ];
var labelCounter = 0;

function compileStmtCallExpression (expression, context, register) {
  var originalRegisters = context.availableRegisters.slice();
  var index = context.availableRegisters.indexOf(register);
  context.availableRegisters = context.availableRegisters.slice(index);
  var result = compile(expression, context);
  context.availableRegisters = originalRegisters;
  return result;
}

function cucaCall (id) {
  return asmBuilder.call('cuca_' + id);
}

function compileBinaryExpression (ast, context, operator) {
  var originalRegisters = context.availableRegisters.slice();
  var first = compile(ast.expr1, context);
  context.availableRegisters.shift();
  var second = compile(ast.expr2, context);
  context.availableRegisters = originalRegisters;
  var end = [ asmBuilder[operator](originalRegisters[0], originalRegisters[1]) ];
  return first.concat(second).concat(end);
}

function compileRelationalExpression (ast, context, jump) {
  var originalRegisters = context.availableRegisters.slice();
  var first = compile(ast.expr1, context);
  context.availableRegisters.shift();
  var second = compile(ast.expr2, context);
  context.availableRegisters = originalRegisters;
  var labelCmp1 = labelCounter;
  var labelCmp2 = labelCmp1 + 1;
  labelCounter = labelCounter + 2;
  var end = [
    asmBuilder.cmp(originalRegisters[0], originalRegisters[1]),
    asmBuilder[jump]('.label_cmp_' + labelCmp1.toString()),
    asmBuilder.mov('rdi', '0'),
    asmBuilder.jmp('.label_cmp_' + labelCmp2.toString()),
    asmBuilder.label('.label_cmp_' + labelCmp1.toString()),
    asmBuilder.mov('rdi', '-1'), // -1 es True ;)
    asmBuilder.label('.label_cmp_' + labelCmp2.toString()),
  ];
  return first.concat(second).concat(end);
}

// TODO mover a otro lado
Array.prototype.diff = function(a) {
    return this.filter(function(i) { return a.indexOf(i) < 0; });
};

CompileNodesFunctions = {
  // DEFINICIONES PRINCIPALES
  "Program" : function (ast, context) {
    var header = [
      asmBuilder.section('.data'),
      asmBuilder.database('lli_format_string', '"%lli"'),
      asmBuilder.section('.text'),
      asmBuilder.global('main'),
      asmBuilder.extern(['exit', 'putchar', 'printf']),
    ];
    var definitions = ast.functions.reduce(function (acc, def) {
      return acc.concat(compile(def));
    }, []);
    var mainSubroutine = [
      asmBuilder.subroutine('main', [
        cucaCall('main'),
        asmBuilder.mov('rdi', '0'),
        asmBuilder.call('exit'),
      ]),
    ];
    return header.concat(definitions).concat(mainSubroutine);
  },

  "Function" : function (ast) {
    var paramNames = ast.params.map(function (param) { return param.id; });
    var context = {
      localVarNames: localVarAnalyzer.allVarNames(ast.block).diff(paramNames),
      params: paramNames,
      availableRegisters: registers.slice(),
    };
    var restoreRbp = asmBuilder.mov('rbp', 'rsp');
    var localVars = localVarAnalyzer.count(ast.block);
    var space = asmBuilder.sub('rsp', (8 * localVars).toString());
    var spaceForLocalVariables = localVars == 0 ? [] : [space];
    var funcBlock = compile(ast.block, context);
    var funcBody = [ asmBuilder.push('rbp'), restoreRbp ]
    .concat(spaceForLocalVariables)
    .concat(funcBlock)
    .concat([ asmBuilder.mov('rsp', 'rbp'), asmBuilder.pop('rbp'), asmBuilder.ret() ]);
    return [ asmBuilder.subroutine('cuca_' + ast.id, funcBody) ];
  },

  // COMANDOS
  "StmtCall" : function (ast, context) {
    // TODO estoy asumiendo que la expresion es atomica en todos los casos
    if (ast.id == 'putChar') {
      return compileStmtCallExpression(ast.expressions[0], context, 'rdi')
        .concat([asmBuilder.call('putchar')]);
    } else if (ast.id == 'putNum') {
      return compileStmtCallExpression(ast.expressions[0], context, 'rsi')
        .concat([
          asmBuilder.mov('rdi', 'lli_format_string'),
          asmBuilder.mov('rax', 0),
          asmBuilder.call('printf'),
        ]);
    } else if (ast.expressions.length > 0) { // tiene parámetros
      var params = [];
      var space = (ast.expressions.length * 8).toString();
      for (i = 0; i < ast.expressions.length; i++) {
        params = params
          .concat(compileStmtCallExpression(ast.expressions[i], context, 'rdi'))
          .concat([asmBuilder.mov('[rsp + ' + (8 * i).toString() + ']', 'rdi')]);
      }
      return [asmBuilder.sub('rsp', space)]
        .concat(params)
        .concat([ cucaCall(ast.id), asmBuilder.add('rsp', space) ]);
    } else {
      return [ cucaCall(ast.id) ];
    }
  },

  "Block" : function (ast, context) {
    return ast.instructions.reduce(function (acc, current) {
      return acc.concat(compile(current, context));
    }, []);
  },

  "StmtAssign" : function (ast, context) {
    var memPosition, memMov;
    var index = context.localVarNames.indexOf(ast.id);
    if (index == -1) { // si no esta en las variables locales, entonces es un parámetro
      index = context.params.indexOf(ast.id);
      memPosition = ((index + 2) * 8).toString();
      memMov = asmBuilder.mov('[rbp + ' + memPosition + ']', 'rdi');
    } else {
      memPosition = ((index + 1) * 8).toString();
      memMov = asmBuilder.mov('[rbp - ' + memPosition + ']', 'rdi');
    }
    return compile(ast.expr, context).concat([memMov]);
  },

  "StmtIf" : function (ast, context) {
    var condicion = compile(ast.expr, context);
    var bloque = compile(ast.block, context);
    var labelNumber = labelCounter;
    var endLabel = '.label_end_' + labelNumber.toString();
    labelCounter++;
    return condicion.concat(
      [ asmBuilder.cmp('rdi', '0'), asmBuilder.je(endLabel) ]
    ).concat(bloque).concat(
      [ asmBuilder.label(endLabel) ]
    );
  },

  "StmtIfElse" : function (ast, context) {
    var condicion = compile(ast.expr, context);
    var bloque1 = compile(ast.block1, context);
    var bloque2 = compile(ast.block2, context);
    var labelNumber = labelCounter;
    var elseLabel = '.label_else_' + labelNumber.toString();
    var endLabel = '.label_end_' + labelNumber.toString();
    labelCounter++;
    return condicion.concat(
      [ asmBuilder.cmp('rdi', '0'), asmBuilder.je(elseLabel) ]
    ).concat(bloque1).concat(
      [ asmBuilder.jmp(endLabel), asmBuilder.label(elseLabel) ]
    ).concat(bloque2).concat(
      [ asmBuilder.label(endLabel) ]
    );
  },

  "StmtReturn" : function (ast, context) {
    return compile(ast.expr, context)
      .concat([ asmBuilder.mov('rax', context.availableRegisters[0]) ]);
  },

  // EXPRESIONES
  "ExprConstNum" : function (ast, context) {
    return [ asmBuilder.mov(context.availableRegisters[0], ast.value) ];
  },

  "ExprConstBool" : function (ast, context) {
    return [ asmBuilder.mov(context.availableRegisters[0], ast.value == 'True' ? '-1' : '0') ];
  },

  "ExprAdd" : function (ast, context) {
    return compileBinaryExpression(ast, context, 'add');
  },

  "ExprSub" : function (ast, context) {
    return compileBinaryExpression(ast, context, 'sub');
  },

  "ExprMul" : function (ast, context) {
    return compileBinaryExpression(ast, context, 'mul');
  },

  "ExprAnd" : function (ast, context) {
    return compileBinaryExpression(ast, context, 'and');
  },

  "ExprOr" : function (ast, context) {
    return compileBinaryExpression(ast, context, 'or');
  },

  "ExprNot" : function (ast, context) {
    return compile(ast.expr, context)
      .concat([ asmBuilder.not(context.availableRegisters[0]) ]);
  },

  "ExprVar" : function (ast, context) {
    var paramPosition = context.params.indexOf(ast.value);
    var register = context.availableRegisters[0];
    if (paramPosition != -1) { // es un parametro
      return [asmBuilder.mov(register, '[rbp + ' + (8 * (paramPosition + 2)).toString() + ']')];
    } else { // es una variable local
      var varIndex = context.localVarNames.indexOf(ast.value);
      return [asmBuilder.mov(register, '[rbp - ' + (8 * (varIndex + 1)).toString() + ']')];
    }
  },

  "ExprCall" : function (ast, context) {
    var usedRegisters = registers.diff(context.availableRegisters);
    var pushedRegisters = usedRegisters.map(function (register) {
      return asmBuilder.push(register);
    });
    var poppedRegisters = usedRegisters.map(function (register) {
      return asmBuilder.pop(register);
    });
    var call;
    if (ast.exprList.length > 0) { // tiene parámetros
      var params = [];
      var space = (ast.exprList.length * 8).toString();
      for (i = 0; i < ast.exprList.length; i++) {
        params = params
          .concat(compileStmtCallExpression(ast.exprList[i], context, 'rdi'))
          .concat([asmBuilder.mov('[rsp + ' + (8 * i).toString() + ']', 'rdi')]);
      }
      call = [ asmBuilder.sub('rsp', space) ]
        .concat(params)
        .concat([ cucaCall(ast.id), asmBuilder.add('rsp', space) ]);
    } else {
      call = [ cucaCall(ast.id) ];
    }
    return pushedRegisters.concat(call).concat(poppedRegisters);
  },

  "ExprEq" : function (ast, context) {
    return compileRelationalExpression(ast, context, 'je');
  },

  "ExprGe" : function (ast, context) {
    return compileRelationalExpression(ast, context, 'jge');
  },

  "ExprLe" : function (ast, context) {
    return compileRelationalExpression(ast, context, 'jle');
  },

  "ExprLt" : function (ast, context) {
    return compileRelationalExpression(ast, context, 'jl');
  },

  "ExprGt" : function (ast, context) {
    return compileRelationalExpression(ast, context, 'jg');
  },

  "ExprNe" : function (ast, context) {
    return compileRelationalExpression(ast, context, 'jne');
  },
};

function compile(ast, context) {
  var compileFunc = CompileNodesFunctions[ast.node];
  if (!compileFunc) { console.log('La funcion de compilación no está definida para el nodo ' + ast.node); }
  if (!context || (!context.localVarNames && !context.params && !context.availableRegisters)) {
    context = { localVarNames: [], params: [], availableRegisters: registers }
  };
  return compileFunc(ast, context);
}

InstructionPrintFunctions = {
  "section" : function (section) { return 'section ' + section.name; },
  "database" : function (database) { return database.name + ' db ' + database.value; },
  "global" : function (globalInst) { return 'global ' + globalInst.name; },
  "extern" : function (extern) { return 'extern ' + extern.routineNames.join(', '); },
  "subroutine" : function (subroutine) {
    return subroutine.label + ':\n' + generateOutput(subroutine.instructions);
  },
  "mov"   : function (mov) { return 'mov ' + mov.register + ', ' + mov.value; },
  "call"  : function (call) { return 'call ' + call.name; },
  "ret"   : function (ret) { return 'ret'; },
  "push"  : function (push) { return 'push ' + push.value },
  "pop"   : function (pop) { return 'pop ' + pop.value },
  "add"   : function (add) { return 'add ' + add.register + ', ' + add.value; },
  "sub"   : function (sub) { return 'sub ' + sub.register + ', ' + sub.value; },
  "imul"  : function (mul) { return 'imul ' + mul.register + ', ' + mul.value; },
  "and"   : function (and) { return 'and ' + and.reg1 + ', ' + and.reg2; },
  "or"    : function (or) { return 'or ' + or.reg1 + ', ' + or.reg2; },
  "not"   : function (not) { return 'not ' + not.register; },
  "cmp"   : function (cmp) { return 'cmp ' + cmp.value1 + ', ' + cmp.value2; },
  "je"    : function (je) { return 'je ' + je.label; },
  "jne"   : function (jne) { return 'jne ' + jne.label; },
  "jg"    : function (jg) { return 'jg ' + jg.label; },
  "jge"   : function (jge) { return 'jge ' + jge.label; },
  "jl"    : function (jl) { return 'jl ' + jl.label; },
  "jle"   : function (jle) { return 'jle ' + jle.label; },
  "jmp"   : function (jmp) { return 'jmp ' + jmp.label; },
  "label" : function (label) { return label.label + ':'; },
};

function generateOutput(instructions) {
  return instructions.reduce(function (acc, current) {
    var printFunction = InstructionPrintFunctions[current.instruction];
    if (!printFunction) { console.log('No hay función para imprimir la instrucción ' + current.instruction); };
    return acc + printFunction(current) + '\n';
  }, '');
}

module.exports = {
  compile: compile,
  generateOutput: generateOutput
};
