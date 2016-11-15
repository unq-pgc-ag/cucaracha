CountingFunctions = {
  "StmtAssign" : function (ast, seen) {
    if(seen[ast.id]) {
      seen[ast.id] = seen[ast.id] + 1;
    } else {
      seen[ast.id] = 1;
    }
    return seen;
  },
  "Block" : function (ast, seen) {
    ast.instructions.forEach(function (instruction) {
      countLocalVariables(instruction, seen);
    });
    return seen;
  }
};

function countLocalVariables(ast, seen) {
  return Object.keys(CountingFunctions[ast.node](ast, seen || {})).length;
}

module.exports = { count: countLocalVariables }
