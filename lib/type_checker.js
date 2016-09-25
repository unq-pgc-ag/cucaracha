function evaluateToNum() { return "Num"; }
function evaluateToBool() { return "Bool"; }
function evaluateToVec() { return "Vec"; }

function checkBooleanExpr(ast, context) {
  return determineTypeOf(ast.expr1, context) == 'Bool' && determineTypeOf(ast.expr2, context) == 'Bool';
}

function checkNumericExpr(ast, context) {
  return determineTypeOf(ast.expr1, context) == 'Num' && determineTypeOf(ast.expr2, context) == 'Num';
}

TypeResults = {
  // boolean expressions
  "ExprConstBool" : evaluateToBool,
  "ExprAnd" : evaluateToBool,
  "ExprOr" : evaluateToBool,
  "ExprNot" : evaluateToBool,
  "ExprLe" : evaluateToBool,
  "ExprGe" : evaluateToBool,
  "ExprLt" : evaluateToBool,
  "ExprGt" : evaluateToBool,
  "ExprEq" : evaluateToBool,
  "ExprNe" : evaluateToBool,
  // vector expressions
  "ExprVecMake" : evaluateToVec,
  // numeric expressions
  "ExprConstNum" : evaluateToNum,
  "ExprAdd" : evaluateToNum,
  "ExprSub" : evaluateToNum,
  "ExprMul" : evaluateToNum,
  "ExprVecLength" : evaluateToNum,
  "ExprVecDeref" : evaluateToNum,
  // rest
  "ExprVar" : function(ast, context) { return context.locals[ast.value]; },
  "ExprCall" : function(ast, context) { return context.functions[ast.id]; },
};

TypeCheckFunctions = {
  "Program" : function(ast, context) {
    var funcionesBienFormadas = ast.functions.reduce(function(res, f){ return res && validate(f, context) }, true);
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

  "Function" : function(ast, context) {
    ast.params.forEach(function (p) { context.locals[p.id] = p.type; });
    return ast.tipo != "Vec" && validate(ast.block, context);
  },

  "Parameter" : function() { return true; },

  "Block" : function(ast, context) {
    return ast.instructions.reduce(function (res, i) { return res && validate(i, context)}, true);
  },

  "StmtAssign" : function(ast, context) {
    if (context.locals[ast.id] && context.locals[ast.id] != determineTypeOf(ast.expr, context)) {
      return false; // variable ya asignada a expresion de otro tipo
    }
    context.locals[ast.id] = determineTypeOf(ast.expr, context);
    return validate(ast.expr, context);
  },

  "StmtVecAssign" : function(ast, context) {
    return true;
  },

  "StmtIf" : function(ast, context) {
    return true;
  },

  "StmtIfElse" : function(ast, context) {
    return true;
  },

  "StmtWhile" : function(ast, context) {
    return true;
  },

  "StmtReturn" : function(ast, context) {
    return true;
  },

  "StmtCall" : function(ast, context) {
    // TODO validar que coincidan los tipos de cada parametro de la funcion
    var funcionBienDefinida = context.functions[ast.id] == 'Unit';
    var expresionesValidas = ast.expressions.reduce(function (res, e) { return res && validate(e, context) }, true);
    return funcionBienDefinida && expresionesValidas;
  },

  "ExprAnd" : checkBooleanExpr,
  "ExprOr" : checkBooleanExpr,
  "ExprAdd" : checkNumericExpr,
  "ExprSub" : checkNumericExpr,
  "ExprMul" : checkNumericExpr,
  "ExprLe" : checkNumericExpr,
  "ExprGe" : checkNumericExpr,
  "ExprLt" : checkNumericExpr,
  "ExprGt" : checkNumericExpr,
  "ExprEq" : checkNumericExpr,
  "ExprNe" : checkNumericExpr,

  "ExprNot" : function(ast, context) {
    return determineTypeOf(ast.expr, context) == 'Bool';
  },

  "ExprVecMake" : function(ast, context) {
    return true;
  },

  "ExprVecLength" : function(ast, context) {
    return true;
  },

  "ExprCall" : function(ast, context) {
    return true;
  },

  "ExprVecDeref" : function(ast, context) {
    return true;
  },

  "ExprConstNum" : function(ast, context) {
    return true;
  },
  "ExprConstBool" : function(ast, context) {
    return true;
  },
  "ExprVar" : function(ast, context) {
    return !!context.locals[ast.value];
  }
};

function validate(ast, context) {
  if (!context) { context = {} };
  if (!context.locals) { context.locals = {}; }
  if (!context.functions) { context.functions = {}; }
  return TypeCheckFunctions[ast.node](ast, context);
}

function determineTypeOf(expression, context) {
  if (!context) { context = {} };
  if (!context.locals) { context.locals = {}; }
  if (!context.functions) { context.functions = {}; }
  return TypeResults[expression.node](expression, context);
}

module.exports = {
  validate: validate,
  determineTypeOf: determineTypeOf,
};
