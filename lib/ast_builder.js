module.exports = {
  num: function (number) { return { node: 'ExprConstNum', value: number }; },
  true: function () { return { node: 'ExprConstBool', value: 'True' }; },
  false: function () { return { node: 'ExprConstBool', value: 'False' }; },
  param: function (type, id) { return { node: 'Parameter', id: id, type: type }; },
  add: function (expr1, expr2) { return { node: 'ExprAdd', expr1: expr1, expr2: expr2 }; }
};
