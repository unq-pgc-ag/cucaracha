TypeCheckFunctions = {
  "Program" : function(ast) {
    var funcionesBienFormadas = ast.functions.reduce(function(res, f){ return res && validate(f) }, true);
    var nombresDeFunciones = ast.functions.map(function(f) { return f.id; });
    var redefinePutChar = nombresDeFunciones.indexOf("putChar") != -1;
    var redefinePutNum = nombresDeFunciones.indexOf("putNum") != -1;
    var funcionesNoRepetidas = ast.functions.reduce(function(res, f){
      var index = nombresDeFunciones.indexOf(f.id);
      nombresDeFunciones.splice(index, 1);
      return res && nombresDeFunciones.indexOf(f.id) == -1
    }, true);
    var listaDeMains = ast.functions.filter(function(f) { return f.id == "main" });
    var main = listaDeMains[0];
    var verificarMain = listaDeMains.length == 1 && main && main.tipo == "Unit";
    return funcionesNoRepetidas && funcionesBienFormadas && verificarMain && !redefinePutChar && !redefinePutNum;
  },

  "Function" : function(ast) {
    return ast.tipo != "Vec";
  },

  "Parameter" : function(ast) {
    return true;
  },

  "Block" : function(ast) {
    return true;
  },

  "StmtAssign" : function(ast) {
    return true;
  },

  "StmtVecAssign" : function(ast) {
    return true;
  },

  "StmtIf" : function(ast) {
    return true;
  },

  "StmtIfElse" : function(ast) {
    return true;
  },

  "StmtWhile" : function(ast) {
    return true;
  },

  "StmtReturn" : function(ast) {
    return true;
  },

  "StmtCall" : function(ast) {
    return true;
  },

  "ExprAnd" : function(ast) {
    return true;
  },
  "ExprOr" : function(ast) {
    return true;
  },
  "ExprAdd" : function(ast) {
    return true;
  },
  "ExprSub" : function(ast) {
    return true;
  },
  "ExprMul" : function(ast) {
    return true;
  },
  "ExprLe" : function(ast) {
    return true;
  },
  "ExprGe" : function(ast) {
    return true;
  },
  "ExprLt" : function(ast) {
    return true;
  },
  "ExprGt" : function(ast) {
    return true;
  },
  "ExprEq" : function(ast) {
    return true;
  },
  "ExprNe" : function(ast) {
    return true;
  },

  "ExprNot" : function(ast) {
    return true;
  },

  "ExprVecMake" : function(ast) {
    return true;
  },

  "ExprVecLength" : function(ast) {
    return true;
  },

  "ExprCall" : function(ast) {
    return true;
  },

  "ExprVecDeref" : function(ast) {
    return true;
  },

  "ExprConstNum" : function(ast) {
    return true;
  },
  "ExprConstBool" : function(ast) {
    return true;
  },
  "ExprVar" : function(ast) {
    return true;
  }
};

function validate(ast) {
  return TypeCheckFunctions[ast.node](ast);
}

module.exports = { validate: validate };
