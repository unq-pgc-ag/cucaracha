function evaluateToInt() { return 'Int'; }
function evaluateToBool() { return 'Bool'; }
function evaluateToVec() { return 'Vec'; }

function shouldBeBool(expr, context) {
  return determineTypeOf(expr, context) == 'Bool';
}

function shouldBeInt(expr, context) {
  return determineTypeOf(expr, context) == 'Int';
}

function checkBooleanExpr(ast, context) {
  return shouldBeBool(ast.expr1, context) && shouldBeBool(ast.expr2, context);
}

function checkNumericExpr(ast, context) {
  return shouldBeInt(ast.expr1, context) && shouldBeInt(ast.expr2, context);
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
  "ExprConstNum" : evaluateToInt,
  "ExprAdd" : evaluateToInt,
  "ExprSub" : evaluateToInt,
  "ExprMul" : evaluateToInt,
  "ExprVecLength" : evaluateToInt,
  "ExprVecDeref" : evaluateToInt,
  // rest
  "ExprVar" : function(ast, context) { return context.locals[ast.value]; },
  "ExprCall" : function(ast, context) { return context.functions[ast.id] ? context.functions[ast.id].tipo : undefined; },
};

TypeCheckFunctions = {
  "Program" : function(ast, context) {
    ast.functions.forEach(function (f) { context.functions[f.id] = f; });
    ast.functions['putChar'] = { node: 'Function', tipo: 'Unit', params: [{ node: "Parameter", id: 'n', type: 'Int' }]};
    ast.functions['putNum'] = { node: 'Function', tipo: 'Unit', params: [{ node: "Parameter", id: 'n', type: 'Int' }]};
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
    var verificarMain = listaDeMains.length == 1 && main && main.tipo == "Unit" && main.params.length == 0;
    return funcionesNoRepetidas && funcionesBienFormadas && verificarMain && !redefinePutChar && !redefinePutNum;
  },

  "Function" : function(ast, context) {
    // TODO validar que haya un solo return si el tipo es Int o Bool
    // TODO validar que el return sea la ultima instrucción
    // TODO validar que no haya return si el tipo es Unit
    if (ast.tipo == 'Vec') { return false; }
    context.tipoFuncionActual = ast.tipo;
    ast.params.forEach(function (p) { context.locals[p.id] = p.type; });
    return validate(ast.block, context);
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
    return context.locals[ast.id] == 'Vec' && shouldBeInt(ast.expr1, context) && shouldBeInt(ast.expr2, context);
  },

  "StmtIf" : function(ast, context) {
    return shouldBeBool(ast.expr, context);
  },

  "StmtIfElse" : function(ast, context) {
    return true;
  },

  "StmtWhile" : function(ast, context) {
    return true;
  },

  "StmtReturn" : function(ast, context) {
    var tipoCoincide = context.tipoFuncionActual == determineTypeOf(ast.expr, context);
    return validate(ast.expr, context) && tipoCoincide;
  },

  "StmtCall" : function(ast, context) {
    // TODO validar que coincidan los tipos de cada parametro de la funcion
    var funcionBienDefinida = !!context.functions[ast.id] && context.functions[ast.id].tipo == 'Unit';
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
    return shouldBeBool(ast.expr, context);
  },

  "ExprVecMake" : function(ast, context) {
    var expresionesValidas = ast.exprs.reduce(function (res, e) { return res && validate(e, context); }, true);
    var expresionesDevuelvenInt = ast.exprs.reduce(function (res, e) { return res && shouldBeInt(e, context); }, true);
    return expresionesValidas && expresionesDevuelvenInt;
  },

  "ExprVecLength" : function(ast, context) {
    return context.locals[ast.id] == 'Vec';
  },

  "ExprCall" : function(ast, context) {
    // TODO hacer algo parecido para StmtCall
    var func = context.functions[ast.id];
    if (!func) { return false; }
    if (func.tipo == 'Unit') { return false; }
    if (func.params.length != ast.exprList.length) { return false; }
    var expresionesValidas = ast.exprList.reduce(function (res, e) { return res && validate(e, context); }, true);
    if (!expresionesValidas) { return false; }
    for (var i = 0; i < func.params.length; i++) {
      if (func.params[i].type != determineTypeOf(ast.exprList[i], context)) { return false; }
    }
    return true;
  },

  "ExprVecDeref" : function(ast, context) {
    return context.locals[ast.id] == 'Vec' && determineTypeOf(ast.expr, context) == 'Int';
  },

  "ExprConstNum" : function() { return true; },
  "ExprConstBool" : function() { return true; },
  "ExprVar" : function(ast, context) {
    return !!context.locals[ast.value];
  }
};

function validate(ast, context) {
  if (!context) { context = {} }
  if (!context.locals) { context.locals = {}; }
  if (!context.functions) { context.functions = {}; }
  return TypeCheckFunctions[ast.node](ast, context);
}

function determineTypeOf(expression, context) {
  if (!context) { context = {} }
  if (!context.locals) { context.locals = {}; }
  if (!context.functions) { context.functions = {}; }
  return TypeResults[expression.node](expression, context);
}

module.exports = {
  validate: validate,
  determineTypeOf: determineTypeOf,
};
