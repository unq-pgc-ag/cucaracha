function startIdent(node, ident) {
  return ident + "(" + node + "\n";
}

function identBinaryExpr(ident, newIdent, ast) {
  return startIdent(ast.node, ident)
    + serialize(ast.expr1, newIdent)
    + serialize(ast.expr2, newIdent)
    + ident + ")\n";
}

function identId(id, newIdent, lastIdent) {
  return newIdent + id + "\n" + lastIdent;
}

function lastIdent(ident) {
  return ident + ")\n";
}

function serializeList(list, ident) {
  return list.map(function(e) { return serialize(e, ident); }).join('');
}

function serializeValue(ast, ident) {
  var newIdent = ident + "  ";
  return startIdent(ast.node, ident)
    + identId(ast.value, newIdent, "")
    + lastIdent(ident);
}

function serializeBinaryExpr(ast, ident) {
  var newIdent = ident + "  ";
  return identBinaryExpr(ident, newIdent, ast);
}

nodes = {
  "Program" : function (ast, ident) {
    var hijos = serializeList(ast.functions, "  ");
    return startIdent(ast.node, ident) + hijos + ")\n";
  },

  "Function" : function(ast, ident) {
    var newIdent = ident + "  ";
    var params = serializeList(ast.params, newIdent);
    return startIdent(ast.node, ident)
      + identId(ast.id, newIdent, newIdent)
      + ast.tipo + "\n"
      + params
      + serialize(ast.block, newIdent)
      + lastIdent(ident);
  },

  "Parameter" : function(ast, ident) {
    var newIdent = ident + "  ";
    return startIdent(ast.node, ident)
      + identId(ast.id, newIdent, newIdent)
      + ast.type + "\n" + lastIdent(ident);
  },

  "Block" : function(ast, ident) {
    var newIdent = ident + "  ";
    var instructions = serializeList(ast.instructions, newIdent);
    return startIdent(ast.node, ident)
      + instructions + lastIdent(ident);
  },

  "StmtAssign" : function(ast, ident) {
    var newIdent = ident + "  ";
    return startIdent(ast.node, ident)
      + identId(ast.id, newIdent, "")
      + serialize(ast.expr, newIdent)
      + lastIdent(ident);
  },

  "StmtVecAssign" : function(ast, ident) {
    var newIdent = ident + "  ";
    return startIdent(ast.node, ident)
      + identId(ast.id, newIdent, "")
      + serialize(ast.expr1, newIdent)
      + serialize(ast.expr2, newIdent)
      + lastIdent(ident);
  },

  "StmtIf" : function(ast, ident) {
    var newIdent = ident + "  ";
    return startIdent(ast.node, ident)
      + serialize(ast.expr, newIdent)
      + serialize(ast.block, newIdent)
      + lastIdent(ident);
  },

  "StmtIfElse" : function(ast, ident) {
    var newIdent = ident + "  ";
    return startIdent(ast.node, ident)
      + serialize(ast.expr, newIdent)
      + serialize(ast.block1, newIdent)
      + serialize(ast.block2, newIdent)
      + lastIdent(ident);
  },

  "StmtWhile" : function(ast, ident) {
    var newIdent = ident + "  ";
    return startIdent(ast.node, ident)
      + serialize(ast.expr, newIdent)
      + serialize(ast.block, newIdent)
      + lastIdent(ident);
  },

  "StmtReturn" : function(ast, ident) {
    var newIdent = ident + "  ";
    return startIdent(ast.node, ident)
      + serialize(ast.expr, newIdent)
      + lastIdent(ident);
  },

  "StmtCall" : function(ast, ident) {
    var newIdent = ident + "  ";
    var params = serializeList(ast.expressions, newIdent);
    return startIdent(ast.node, ident)
      + identId(ast.id, newIdent, "")
      + params
      + lastIdent(ident);
  },

  "ExprAnd" : serializeBinaryExpr,
  "ExprOr" : serializeBinaryExpr,
  "ExprAdd" : serializeBinaryExpr,
  "ExprSub" : serializeBinaryExpr,
  "ExprMul" : serializeBinaryExpr,
  "ExprLe" : serializeBinaryExpr,
  "ExprGe" : serializeBinaryExpr,
  "ExprLt" : serializeBinaryExpr,
  "ExprGt" : serializeBinaryExpr,
  "ExprEq" : serializeBinaryExpr,
  "ExprNe" : serializeBinaryExpr,

  "ExprNot" : function(ast, ident) {
    var newIdent = ident + "  ";
    return startIdent(ast.node, ident)
      + serialize(ast.expr, newIdent)
      + lastIdent(ident);
  },

  "ExprVecMake" : function(ast, ident) {
    var newIdent = ident + "  ";
    var params = serializeList(ast.exprs, newIdent);
    return startIdent(ast.node, ident)
      + params
      + lastIdent(ident);
  },

  "ExprVecLength" : function(ast, ident) {
    var newIdent = ident + "  ";
    return startIdent(ast.node, ident)
      + identId(ast.id, newIdent, "")
      + lastIdent(ident);
  },

  "ExprCall" : function(ast, ident) {
    var newIdent = ident + "  ";
    var params = serializeList(ast.exprList, newIdent);
    return startIdent(ast.node, ident)
      + identId(ast.id, newIdent, "")
      + params
      + lastIdent(ident);
  },

  "ExprVecDeref" : function(ast, ident) {
    var newIdent = ident + "  ";
    return startIdent(ast.node, ident)
      + identId(ast.id, newIdent, "")
      + serialize(ast.expr, newIdent)
      + lastIdent(ident);
  },

  "ExprConstNum" : serializeValue,
  "ExprConstBool" : serializeValue,
  "ExprVar" : serializeValue
};

function serialize(ast, ident) {
  return nodes[ast.node](ast, ident || '');
}

module.exports = { serialize: serialize };
