function evaluateToInt() { return 'Int'; }
function evaluateToBool() { return 'Bool'; }
function evaluateToVec() { return 'Vec'; }

function shouldBeBool(expr, context) {
  return determineTypeOf(expr, context) === 'Bool';
}

function shouldBeInt(expr, context) {
  return determineTypeOf(expr, context) === 'Int';
}

function checkBooleanExpr(ast, context) {
  return shouldBeBool(ast.expr1, context) && shouldBeBool(ast.expr2, context);
}

function checkNumericExpr(ast, context) {
  return shouldBeInt(ast.expr1, context) && shouldBeInt(ast.expr2, context);
}

const TypeResults = {
  // boolean expressions
  ExprConstBool: evaluateToBool,
  ExprAnd: evaluateToBool,
  ExprOr: evaluateToBool,
  ExprNot: evaluateToBool,
  ExprLe: evaluateToBool,
  ExprGe: evaluateToBool,
  ExprLt: evaluateToBool,
  ExprGt: evaluateToBool,
  ExprEq: evaluateToBool,
  ExprNe: evaluateToBool,
  // vector expressions
  ExprVecMake: evaluateToVec,
  // numeric expressions
  ExprConstNum: evaluateToInt,
  ExprAdd: evaluateToInt,
  ExprSub: evaluateToInt,
  ExprMul: evaluateToInt,
  ExprVecLength: evaluateToInt,
  ExprVecDeref: evaluateToInt,
  // rest
  ExprVar(ast, context) {
    return context.locals[ast.value];
  },
  ExprCall(ast, context) {
    return context.functions[ast.id] ? context.functions[ast.id].tipo : undefined;
  },
};

const TypeCheckFunctions = {
  Program(ast, context) {
    ast.functions.forEach(function(f) {
      context.functions[f.id] = f;
    });
    ast.functions.putChar = { node: 'Function', tipo: 'Unit', params: [{ node: 'Parameter', id: 'n', type: 'Int' }] };
    ast.functions.putNum = { node: 'Function', tipo: 'Unit', params: [{ node: 'Parameter', id: 'n', type: 'Int' }] };
    const funcionesBienFormadas = ast.functions.reduce(function(res, f) {
      return res && validate(f, context);
    }, true);
    const nombresDeFunciones = ast.functions.map(function(f) {
      return f.id;
    });
    const redefinePutChar = nombresDeFunciones.indexOf('putChar') !== -1;
    const redefinePutNum = nombresDeFunciones.indexOf('putNum') !== -1;
    const funcionesNoRepetidas = ast.functions.reduce(function(res, f) {
      const index = nombresDeFunciones.indexOf(f.id);
      nombresDeFunciones.splice(index, 1);
      return res && nombresDeFunciones.indexOf(f.id) === -1;
    }, true);
    const listaDeMains = ast.functions.filter(function(f) {
      return f.id === 'main';
    });
    const main = listaDeMains[0];
    const verificarMain = listaDeMains.length === 1 && main && main.tipo === 'Unit' && main.params.length === 0;
    return funcionesNoRepetidas && funcionesBienFormadas && verificarMain && !redefinePutChar && !redefinePutNum;
  },

  'Function' : function(ast, context) {
    // TODO validar que haya un solo return si el tipo es Int o Bool
    // TODO validar que el return sea la ultima instrucción
    // TODO validar que no haya return si el tipo es Unit
    if (ast.tipo === 'Vec') { return false; }
    context.tipoFuncionActual = ast.tipo;
    ast.params.forEach(function(p) { context.locals[p.id] = p.type; });
    return validate(ast.block, context);
  },

  Parameter() {
    return true;
  },

  Block(ast, context) {
    return ast.instructions.reduce(function(res, i) {
      return res && validate(i, context);
    }, true);
  },

  StmtAssign(ast, context) {
    if (context.locals[ast.id] && context.locals[ast.id] !== determineTypeOf(ast.expr, context)) {
      return false; // variable ya asignada a expresion de otro tipo
    }
    context.locals[ast.id] = determineTypeOf(ast.expr, context);
    return validate(ast.expr, context);
  },

  StmtVecAssign(ast, context) {
    return context.locals[ast.id] === 'Vec' && shouldBeInt(ast.expr1, context) && shouldBeInt(ast.expr2, context);
  },

  StmtIf(ast, context) {
    return shouldBeBool(ast.expr, context);
  },

  StmtIfElse(_ast, _context) {
    return true;
  },

  StmtWhile(_ast, _context) {
    return true;
  },

  StmtReturn(ast, context) {
    const tipoCoincide = context.tipoFuncionActual === determineTypeOf(ast.expr, context);
    return validate(ast.expr, context) && tipoCoincide;
  },

  StmtCall(ast, context) {
    // TODO validar que coincidan los tipos de cada parametro de la funcion
    const funcionBienDefinida = !!context.functions[ast.id] && context.functions[ast.id].tipo === 'Unit';
    const expresionesValidas = ast.expressions.reduce(function(res, e) {
      return res && validate(e, context);
    }, true);
    return funcionBienDefinida && expresionesValidas;
  },

  ExprAnd: checkBooleanExpr,
  ExprOr: checkBooleanExpr,
  ExprAdd: checkNumericExpr,
  ExprSub: checkNumericExpr,
  ExprMul: checkNumericExpr,
  ExprLe: checkNumericExpr,
  ExprGe: checkNumericExpr,
  ExprLt: checkNumericExpr,
  ExprGt: checkNumericExpr,
  ExprEq: checkNumericExpr,
  ExprNe: checkNumericExpr,

  ExprNot(ast, context) {
    return shouldBeBool(ast.expr, context);
  },

  ExprVecMake(ast, context) {
    const expresionesValidas = ast.exprs.reduce(function(res, e) {
      return res && validate(e, context);
    }, true);
    const expresionesDevuelvenInt = ast.exprs.reduce(function(res, e) {
      return res && shouldBeInt(e, context);
    }, true);
    return expresionesValidas && expresionesDevuelvenInt;
  },

  ExprVecLength(ast, context) {
    return context.locals[ast.id] === 'Vec';
  },

  ExprCall(ast, context) {
    // TODO hacer algo parecido para StmtCall
    const func = context.functions[ast.id];
    if (!func) {
      return false;
    }
    if (func.tipo === 'Unit') {
      return false;
    }
    if (func.params.length !== ast.exprList.length) {
      return false;
    }
    const expresionesValidas = ast.exprList.reduce(function(res, e) {
      return res && validate(e, context);
    }, true);
    if (!expresionesValidas) {
      return false;
    }
    for (let i = 0; i < func.params.length; i++) {
      if (func.params[i].type !== determineTypeOf(ast.exprList[i], context)) {
        return false;
      }
    }
    return true;
  },

  ExprVecDeref(ast, context) {
    return context.locals[ast.id] === 'Vec' && determineTypeOf(ast.expr, context) === 'Int';
  },

  ExprConstNum() {
    return true;
  },
  ExprConstBool() {
    return true;
  },
  ExprVar(ast, context) {
    return !!context.locals[ast.value];
  }
};

function validate(ast, context) {
  const contextToUse = context || {};
  if (!contextToUse.locals) { contextToUse.locals = {}; }
  if (!contextToUse.functions) { contextToUse.functions = {}; }
  return TypeCheckFunctions[ast.node](ast, contextToUse);
}

function determineTypeOf(expression, context) {
  const contextToUse = context || {};
  if (!contextToUse.locals) { contextToUse.locals = {}; }
  if (!contextToUse.functions) { contextToUse.functions = {}; }
  return TypeResults[expression.node](expression, contextToUse);
}

module.exports = {
  validate: validate,
  determineTypeOf: determineTypeOf,
};
