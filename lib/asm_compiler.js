function mov(register, value) {
  return { instruction: 'mov', register: register, value: value };
}

function section(name) {
  return { instruction: 'section', name: name };
}

function globalInst(name) {
  return { instruction: 'global', name: name };
}

function extern(routineNames) {
  return { instruction: 'extern', routineNames: routineNames };
}

function subroutine(label, instructions) {
  return { instruction: 'subroutine', label: label, instructions: instructions };
}

function call(subroutineName) {
  return { instruction: 'call', name: subroutineName };
}

function ret() {
  return { instruction: 'ret' };
}

CompileNodesFunctions = {
  "ExprConstNum" : function (ast) {
    return [ mov('rdi', '8') ];
  },

  "ExprConstBool" : function (ast) {
    return [ mov('rdi', ast.value == 'True' ? '-1' : '0') ];
  },

  "Program" : function (ast) {
    return [
      section('.text'),
      globalInst('main'),
      extern(['exit', 'putchar']),
      subroutine('cuca_main', [ ret() ]),
      subroutine('main', [
        call('cuca_main'),
        mov('rdi', '0'),
        call('exit')
      ])
    ];
  },

  "StmtCall" : function (ast) {
    // Importante: tratar putChar y putNum diferente del resto de las funciones
    if (ast.id == 'putChar') {
      // TODO estoy asumiendo que la expresion es atomica
      return [
        mov('rdi', ast.expressions[0].value),
        call('putchar')
      ];
    }
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
  "ret" : function (ret) { return 'ret'; }
};

function generateOutput(instructions) {
  return instructions.reduce(function (acc, current) {
    return acc + InstructionPrintFunctions[current.instruction](current) + '\n';
  });
}

module.exports = {
  mov: mov,
  section: section,
  global: globalInst,
  extern: extern,
  subroutine: subroutine,
  call: call,
  ret: ret,
  compile: compile,
  generateOutput: generateOutput
};
