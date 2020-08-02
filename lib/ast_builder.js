module.exports = {
  num(number) {
    return { node: 'ExprConstNum', value: number };
  },

  true() {
    return { node: 'ExprConstBool', value: 'True' };
  },

  false() {
    return { node: 'ExprConstBool', value: 'False' };
  },

  var(id) {
    return { node: 'ExprVar', value: id };
  },

  param(type, id) {
    return { node: 'Parameter', id: id, type: type };
  },

  add(expr1, expr2) {
    return { node: 'ExprAdd', expr1: expr1, expr2: expr2 };
  },

  putChar(charExpr) {
    return { node: 'StmtCall', id: 'putChar', expressions: [charExpr] };
  },

  putNum(numExpr) {
    return { node: 'StmtCall', id: 'putNum', expressions: [numExpr] };
  },

  assign(id, expr) {
    return { node: 'StmtAssign', id: id, expr: expr };
  },

  unitFunction(name, params, block) {
    return {
      node: 'Function',
      id: name,
      params: params,
      tipo: 'Unit',
      block: block,
    };
  },

  emptyUnitFunction(name, params) {
    return {
      node: 'Function',
      id: name,
      params: params,
      tipo: 'Unit',
      block: { node: 'Block', instructions: [] },
    };
  },

  block(instructions) {
    return {
      node: 'Block',
      instructions: instructions,
    };
  },

  funcCall(id, expressions) {
    return { node: 'StmtCall', id: id, expressions: expressions || [] };
  },

  emptyProgram() {
    const emptyBlock = { node: 'Block', instructions: [] };
    const main = { node: 'Function', id: 'main', tipo: 'Unit', params: [], block: emptyBlock };
    return { node: 'Program', functions: [main] };
  },

  programWith(defs, mainBlock) {
    const main = { node: 'Function', id: 'main', tipo: 'Unit', params: [], block: mainBlock };
    return { node: 'Program', functions: [main].concat(defs) };
  },
};
