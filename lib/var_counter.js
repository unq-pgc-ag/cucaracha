CountingFunctions = {
  "StmtAssign" : function (ast, seen) {
    if(seen[ast.id]) {
      seen[ast.id] = seen[ast.id] + 1;
    } else {
      seen[ast.id] = 1;
    }
    return Object.keys(seen).length;
  }
};

function countLocalVariables(ast, seen) {
  return CountingFunctions[ast.node](ast, seen || {});
}

module.exports = { count: countLocalVariables }
