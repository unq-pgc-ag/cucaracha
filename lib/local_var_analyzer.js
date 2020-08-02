const CountingFunctions = {
  // TODO implementar para el resto de los nodos del AST
  // TODO arreglar que cuenta parametros también - arreglado en el compilador
  StmtAssign(ast, seen) {
    if (seen[ast.id]) {
      seen[ast.id] = seen[ast.id] + 1;
    } else {
      seen[ast.id] = 1;
    }
    return seen;
  },
  Block(ast, seen) {
    ast.instructions.forEach(function(instruction) {
      countLocalVariables(instruction, seen);
    });
    return seen;
  },
  StmtCall(ast, seen) {
    return seen;
  },
  StmtReturn(ast, seen) {
    return seen;
  },
  StmtIf(ast, seen) {
    countLocalVariables(ast.block, seen);
    return seen;
  },
  StmtIfElse(ast, seen) {
    countLocalVariables(ast.block1, seen);
    countLocalVariables(ast.block2, seen);
    return seen;
  },
};

function countLocalVariables(ast, seen) {
  return allVarNames(ast, seen).length;
}

function allVarNames(ast, seen) {
  const countingFunction = CountingFunctions[ast.node];
  if (!countingFunction) { console.log(`La función de conteo de variables no está definida para el nodo ${ast.node}`); }
  return Object.keys(countingFunction(ast, seen || {}));
}

module.exports = {
  count: countLocalVariables,
  allVarNames: allVarNames,
};
