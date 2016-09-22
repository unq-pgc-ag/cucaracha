function startIdent(ast, ident) {
  return ident + "(" + ast.node + "\n";
}

function identId(ast, newIdent, lastIdent) {
  return newIdent + ast.id + "\n" + lastIdent;
}

function lastIdent(ident) {
  return ident + ")\n";
}

function serializeList(list, ident) {
  return list.map(function(e) { return serialize(e, ident); }).join('');
}

function serializeValue(ast, ident) {
  var newIdent = ident + "  ";
  return startIdent(ast, ident)
    + newIdent + ast.value + "\n"
    + lastIdent(ident);
}

function serializeBinaryExpr(ast, ident) {
  var newIdent = ident + "  ";
  return startIdent(ast, ident)
    + serialize(ast.expr1, newIdent)
    + serialize(ast.expr2, newIdent)
    + ident + ")\n";
}

SerializationFunctionNodes = {
  "Program" : function (ast, ident) {
    return startIdent(ast, ident)
      + serializeList(ast.functions, "  ")
      + ")\n";
  },

  "Function" : function(ast, ident) {
    var newIdent = ident + "  ";
    return startIdent(ast, ident)
      + identId(ast, newIdent, newIdent)
      + ast.tipo + "\n"
      + serializeList(ast.params, newIdent)
      + serialize(ast.block, newIdent)
      + lastIdent(ident);
  },

  "Parameter" : function(ast, ident) {
    var newIdent = ident + "  ";
    return startIdent(ast, ident)
      + identId(ast, newIdent, newIdent)
      + ast.type + "\n"
      + lastIdent(ident);
  },

  "Block" : function(ast, ident) {
    var newIdent = ident + "  ";
    return startIdent(ast, ident)
      + serializeList(ast.instructions, newIdent)
      + lastIdent(ident);
  },

  "StmtAssign" : function(ast, ident) {
    var newIdent = ident + "  ";
    return startIdent(ast, ident)
      + identId(ast, newIdent, "")
      + serialize(ast.expr, newIdent)
      + lastIdent(ident);
  },

  "StmtVecAssign" : function(ast, ident) {
    var newIdent = ident + "  ";
    return startIdent(ast, ident)
      + identId(ast, newIdent, "")
      + serialize(ast.expr1, newIdent)
      + serialize(ast.expr2, newIdent)
      + lastIdent(ident);
  },

  "StmtIf" : function(ast, ident) {
    var newIdent = ident + "  ";
    return startIdent(ast, ident)
      + serialize(ast.expr, newIdent)
      + serialize(ast.block, newIdent)
      + lastIdent(ident);
  },

  "StmtIfElse" : function(ast, ident) {
    var newIdent = ident + "  ";
    return startIdent(ast, ident)
      + serialize(ast.expr, newIdent)
      + serialize(ast.block1, newIdent)
      + serialize(ast.block2, newIdent)
      + lastIdent(ident);
  },

  "StmtWhile" : function(ast, ident) {
    var newIdent = ident + "  ";
    return startIdent(ast, ident)
      + serialize(ast.expr, newIdent)
      + serialize(ast.block, newIdent)
      + lastIdent(ident);
  },

  "StmtReturn" : function(ast, ident) {
    var newIdent = ident + "  ";
    return startIdent(ast, ident)
      + serialize(ast.expr, newIdent)
      + lastIdent(ident);
  },

  "StmtCall" : function(ast, ident) {
    var newIdent = ident + "  ";
    return startIdent(ast, ident)
      + identId(ast, newIdent, "")
      + serializeList(ast.expressions, newIdent)
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
    return startIdent(ast, ident)
      + serialize(ast.expr, newIdent)
      + lastIdent(ident);
  },

  "ExprVecMake" : function(ast, ident) {
    var newIdent = ident + "  ";
    return startIdent(ast, ident)
      + serializeList(ast.exprs, newIdent)
      + lastIdent(ident);
  },

  "ExprVecLength" : function(ast, ident) {
    var newIdent = ident + "  ";
    return startIdent(ast, ident)
      + identId(ast, newIdent, "")
      + lastIdent(ident);
  },

  "ExprCall" : function(ast, ident) {
    var newIdent = ident + "  ";
    return startIdent(ast, ident)
      + identId(ast, newIdent, "")
      + serializeList(ast.exprList, newIdent)
      + lastIdent(ident);
  },

  "ExprVecDeref" : function(ast, ident) {
    var newIdent = ident + "  ";
    return startIdent(ast, ident)
      + identId(ast, newIdent, "")
      + serialize(ast.expr, newIdent)
      + lastIdent(ident);
  },

  "ExprConstNum" : serializeValue,
  "ExprConstBool" : serializeValue,
  "ExprVar" : serializeValue
};

function serialize(ast, ident) {
  return SerializationFunctionNodes[ast.node](ast, ident || '');
}

module.exports = { serialize: serialize };
