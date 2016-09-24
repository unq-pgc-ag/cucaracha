function evaluateToNum() { return "Num"; }
function evaluateToBool() { return "Bool"; }
function evaluateToVec() { return "Vec"; }

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
  "ExprVar" : function(ast, context) { return context[ast.value]; },
  "ExprCall" : function(ast, context) {
    return 'Num'; // TODO poner el tipo correcto (que sale de buscar el tipo de la funcion con nombre ast.id)
  },
};

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
    var variables = {};
    ast.params.forEach(function (p) { variables[p.id] = p.type; });
    return ast.tipo != "Vec" && validate(ast.block, variables);
  },

  "Parameter" : function() { return true; },

  "Block" : function(ast, context) {
    return ast.instructions.reduce(function (res, i) { return res && validate(i, context)}, true);
  },

  "StmtAssign" : function(ast, context) {
    if (context[ast.id] && context[ast.id] != determineTypeOf(ast.expr, context)) {
      return false; // variable ya asignada a expresion de otro tipo
    }
    context[ast.id] = determineTypeOf(ast.expr, context);
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
    // TODO validar que la funcion exista
    // TODO validar que el tipo de retorno de la funcion sea Unit
    // TODO validar que coincidan los tipos de cada parametro de la funcion
    return ast.expressions.reduce(function (res, e) { return res && validate(e, context) }, true);
  },

  "ExprAnd" : function(ast, context) {
    return determineTypeOf(ast.expr1, context) == 'Bool' && determineTypeOf(ast.expr2, context) == 'Bool';
  },
  "ExprOr" : function(ast, context) {
    return determineTypeOf(ast.expr1, context) == 'Bool' && determineTypeOf(ast.expr2, context) == 'Bool';
  },
  "ExprAdd" : function(ast, context) {
    return true;
  },
  "ExprSub" : function(ast, context) {
    return true;
  },
  "ExprMul" : function(ast, context) {
    return true;
  },
  "ExprLe" : function(ast, context) {
    return true;
  },
  "ExprGe" : function(ast, context) {
    return true;
  },
  "ExprLt" : function(ast, context) {
    return true;
  },
  "ExprGt" : function(ast, context) {
    return true;
  },
  "ExprEq" : function(ast, context) {
    return true;
  },
  "ExprNe" : function(ast, context) {
    return true;
  },

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
    // console.log("Validating " + ast.value + " in context " + JSON.stringify(context));
    return !!context[ast.value];
  }
};

function validate(ast, context) {
  return TypeCheckFunctions[ast.node](ast, context);
}

function determineTypeOf(expression, context) {
  return TypeResults[expression.node](expression, context);
}

module.exports = {
  validate: validate,
  determineTypeOf: determineTypeOf,
};
