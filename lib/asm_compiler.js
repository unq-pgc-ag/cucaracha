var asmBuilder = require('./asm_builder');
var varCounter = require('../lib/var_counter');

CompileNodesFunctions = {
  "ExprConstNum" : function (ast) {
    return [ asmBuilder.mov('rdi', '8') ];
  },

  "ExprConstBool" : function (ast) {
    return [ asmBuilder.mov('rdi', ast.value == 'True' ? '-1' : '0') ];
  },

  "Program" : function (ast) {
    return [
      asmBuilder.section('.data'),
      asmBuilder.database('lli_format_string', '"%lli"'),
      asmBuilder.section('.text'),
      asmBuilder.global('main'),
      asmBuilder.extern(['exit', 'putchar']),
      asmBuilder.subroutine('cuca_main', [
        asmBuilder.ret(),
      ]),
      asmBuilder.subroutine('main', [
        asmBuilder.call('cuca_main'),
        asmBuilder.mov('rdi', '0'),
        asmBuilder.call('exit'),
      ])
    ];
  },

  "StmtCall" : function (ast) {
    // Importante: tratar putChar y putNum diferente del resto de las funciones
    // TODO estoy asumiendo que la expresion es atomica
    if (ast.id == 'putChar') {
      return [
        asmBuilder.mov('rdi', ast.expressions[0].value),
        asmBuilder.call('putchar')
      ];
    } else if (ast.id == 'putNum') {
      return [
        asmBuilder.mov('rsi', ast.expressions[0].value),
        asmBuilder.mov('rdi', 'lli_format_string'),
        asmBuilder.mov('rax', 0),
        asmBuilder.call('printf'),
      ];
    } else {
      // TODO: hacer invocación a función
      return [];
    }
  },

  "Function" : function (ast) {
    return [
      asmBuilder.subroutine('cuca_' + ast.id, [
        asmBuilder.push('rbp'),
        asmBuilder.mov('rbp', 'rsp'),
        asmBuilder.sub('rsp', (8 * varCounter.count(ast.block)).toString()),
        asmBuilder.mov('rbp', 'rsp'),
        asmBuilder.pop('rbp'),
        asmBuilder.ret(),
      ])
    ];
  }
};

function compile(ast) {
  return CompileNodesFunctions[ast.node](ast);
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
  "pop" : function (pop) { return 'push ' + pop.value },
  "sub" : function (sub) {
    return 'sub ' + sub.register + ', ' + sub.value;
  }
};

function generateOutput(instructions) {
  return instructions.reduce(function (acc, current) {
    return acc + InstructionPrintFunctions[current.instruction](current) + '\n';
  });
}

module.exports = {
  compile: compile,
  generateOutput: generateOutput
};
