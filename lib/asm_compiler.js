var asmBuilder = require('./asm_builder');
var localVarAnalyzer = require('../lib/local_var_analyzer');

var registers = ['rdi', 'rsi', 'rax', 'rbx', 'rcx', 'rdx', 'r8', 'r9', 'r10', 'r11', 'r12', 'r13', 'r14', 'r15' ];

function compileStmtCallExpression(expression, context, register) {
  if (expression.node == 'ExprVar') {
    var paramPosition = context.params.indexOf(expression.value);
    if (paramPosition != -1) { // es un parametro
      return [asmBuilder.mov(register, '[rbp + ' + (8 * (paramPosition + 2)).toString() + ']')];
    } else { // es una variable local
      var varIndex = context.localVarNames.indexOf(expression.value);
      return [asmBuilder.mov(register, '[rbp - ' + (8 * (varIndex + 1)).toString() + ']')];
    }
  } else {
    // la expresion es una constante numerica
    return [asmBuilder.mov(register, expression.value)];
  }
}

CompileNodesFunctions = {
  "ExprConstNum" : function (ast, context) {
    return [ asmBuilder.mov('rdi', ast.value) ];
  },

  "ExprConstBool" : function (ast, context) {
    return [ asmBuilder.mov('rdi', ast.value == 'True' ? '-1' : '0') ];
  },

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
        asmBuilder.call('cuca_main'),
        asmBuilder.mov('rdi', '0'),
        asmBuilder.call('exit'),
      ]),
    ];
    return header.concat(definitions).concat(mainSubroutine);
  },

  "StmtCall" : function (ast, context) {
    // Importante: tratar putChar y putNum diferente del resto de las funciones
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
    } else {
      if (ast.expressions.length > 0) { // tiene parámetros
        var params = [];
        var space = (ast.expressions.length * 8).toString();
        for (i = 0; i < ast.expressions.length; i++) {
          params = params
            .concat(compileStmtCallExpression(ast.expressions[i], context, 'rdi'))
            .concat([asmBuilder.mov('[rsp + ' + (8 * i).toString() + ']', 'rdi')]);
        }

        return [asmBuilder.sub('rsp', space)]
          .concat(params)
          .concat([
            asmBuilder.call('cuca_' + ast.id),
            asmBuilder.add('rsp', space),
          ]);
      } else {
        return [asmBuilder.call('cuca_' + ast.id)];
      }
    }
  },

  "Function" : function (ast, context) {
    var context = {
      localVarNames: localVarAnalyzer.allVarNames(ast.block),
      params: ast.params.map(function (param) { return param.id; }),
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

  "Block" : function (ast, context) {
    return ast.instructions.reduce(function (acc, current) {
      return acc.concat(compile(current, context));
    }, []);
  },

  "StmtAssign" : function (ast, context) {
    // TODO: implementar correctamente
    var index = context.localVarNames.indexOf(ast.id);
    var memPosition = ((index + 1) * 8).toString();
    return compile(ast.expr, context)
      .concat([asmBuilder.mov('[rbp - ' + memPosition + ']', 'rdi')]);
  }
};

function compile(ast, context) {
  var compileFunc = CompileNodesFunctions[ast.node];
  if (!compileFunc) { console.log('La funcion de compilación no está definida para el nodo ' + ast.node); }
  if (!context || (!context.localVarNames && !context.params)) { context = { localVarNames: [], params: [] } };
  return compileFunc(ast, context);
}

InstructionPrintFunctions = {
  "mov" : function (mov) {
    return 'mov ' + mov.register + ', ' + mov.value;
  },

  "section" : function (section) {
    return 'section ' + section.name;
  },

  "database" : function (database) {
    return database.name + ' db ' + database.value;
  },

  "global" : function (globalInst) {
    return 'global ' + globalInst.name;
  },

  "extern" : function (extern) {
    return 'extern ' + extern.routineNames.join(', ');
  },

  "subroutine" : function (subroutine) {
    return subroutine.label + ':\n' + generateOutput(subroutine.instructions);
  },

  "call" : function (call) { return 'call ' + call.name; },
  "ret" : function (ret) { return 'ret'; },
  "push" : function (push) { return 'push ' + push.value },
  "pop" : function (pop) { return 'pop ' + pop.value },
  "add" : function (sub) {
    return 'add ' + sub.register + ', ' + sub.value;
  },
  "sub" : function (sub) {
    return 'sub ' + sub.register + ', ' + sub.value;
  },
};

function generateOutput(instructions) {
  return instructions.reduce(function (acc, current) {
    return acc + InstructionPrintFunctions[current.instruction](current) + '\n';
  }, '');
}

module.exports = {
  compile: compile,
  generateOutput: generateOutput
};
