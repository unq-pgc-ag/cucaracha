CountingFunctions = {
  // TODO implementar para el resto de los nodos del AST
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
  },
  "StmtCall" : function (ast, seen) { return seen; },
};

function countLocalVariables(ast, seen) {
  return allVarNames(ast, seen).length;
}

function allVarNames(ast, seen) {
  return Object.keys(CountingFunctions[ast.node](ast, seen || {}))
}

module.exports = {
  count: countLocalVariables,
  allVarNames: allVarNames,
}
