function mov(register, value) {
  return { instruction: 'mov', register: register, value: value };
}

CompileNodesFunctions = {
  "ExprConstNum" : function (ast) {
    return [ mov('rdi', '8') ];
  },

  "ExprConstBool" : function (ast) {
    return [ mov('rdi', ast.value == 'True' ? '-1' : '0') ];
  }
};

function compile(ast) {
  return CompileNodesFunctions[ast.node](ast);
}

InstructionPrintFunctions = {
  "mov" : function (mov) {
    return 'mov ' + mov.register + ', ' + mov.value;
  }
};

function generateOutput(instructions) {
  return instructions.reduce(function (acc, current) {
    return acc + InstructionPrintFunctions[current.instruction](current) + '\n';
  });
}

module.exports = {
  mov: mov,
  compile: compile,
  generateOutput: function (instructions) {
    ;
  }
};
