module.exports = {
  num: function (number) { return { node: 'ExprConstNum', value: number }; },
  true: function () { return { node: 'ExprConstBool', value: 'True' }; },
  false: function () { return { node: 'ExprConstBool', value: 'False' }; },
  param: function (type, id) { return { node: 'Parameter', id: id, type: type }; },
  add: function (expr1, expr2) { return { node: 'ExprAdd', expr1: expr1, expr2: expr2 }; },
  putChar: function (charExpr) {
    return { node: 'StmtCall', id: 'putChar', expressions: [charExpr] };
  },
  putNum: function (numExpr) {
    return { node: 'StmtCall', id: 'putNum', expressions: [numExpr] };
  },
  assign: function (id, expr) {
    return { node: "StmtAssign", id: id, expr: expr };
  },
  unitFunction: function(name, params, block) {
    return {
        node: 'Function',
        id: name,
        params: params,
        tipo: 'Unit',
        block: block,
      };
  },
  emptyUnitFunction: function (name, params) {
    return {
        node: 'Function',
        id: name,
        params: params,
        tipo: 'Unit',
        block: { node: 'Block', instructions: [] },
      };
  },
  block: function (instructions) {
    return {
      node: 'Block',
      instructions: instructions,
    };
  },
  funcCall: function (id) {
    return { node: 'StmtCall', id: id, expressions: [] };
  },
  emptyProgram: function () {
    emptyBlock = { node: 'Block', instructions: [] };
    main = { node: 'Function', id: 'main', tipo: 'Unit', params: [], block: emptyBlock };
    return { node: 'Program', functions: [main] };
  },
  programWith: function(defs, mainBlock) {
    main = { node: 'Function', id: 'main', tipo: 'Unit', params: [], block: mainBlock };
    return { node: 'Program', functions: [main].concat(defs) };
  },
};
