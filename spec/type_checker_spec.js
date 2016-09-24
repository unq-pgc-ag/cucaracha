var TypeChecker = require('../lib/type_checker');

describe('Cucaracha - Chequeo estático', function () {
  var operadoresBooleanos = ['ExprAnd', 'ExprOr', 'ExprNot', 'ExprLe', 'ExprGe', 'ExprLt', 'ExprGt', 'ExprEq', 'ExprNe'];

  var emptyBlock = { node: 'Block', instructions: [] };
  var elTrue = { node: 'ExprConstBool', value: 'True' };
  var elFalse = { node: 'ExprConstBool', value: 'False' };
  var elOcho = { node: 'ExprConstNum', value: '8' };

  describe('Programa', function () {
    it('es correcto cuando hay una funcion main() de tipo Unit', function () {
      var main = { node: 'Function', id: 'main', tipo: 'Unit', params: [], block: emptyBlock };
      var ast = { node: 'Program', functions: [main] };
      var resultado = TypeChecker.validate(ast, []);
      expect(resultado).toBe(true);
    });
  });

  describe('Function', function () {
    it('no es valida cuando el tipo de retorno es Vec', function () {
      var ast = { node: 'Function', tipo: 'Vec', params: [], block: emptyBlock };
      var resultado = TypeChecker.validate(ast, []);
      expect(resultado).toBe(false);
    });
  });

  describe('Expresiones Booleanas', function () {
    ['ExprAnd', 'ExprOr'].forEach(function (op) {
      it(op + ' no es valida si alguno de sus argumentos no es de tipo Bool', function () {
        var ast = { node: op, expr1: elTrue, expr2: elOcho };
        var resultado = TypeChecker.validate(ast, []);
        expect(resultado).toBe(false);
      });

      it(op + ' es valida si sus dos argumentos son de tipo Bool', function () {
        var ast = { node: op, expr1: elTrue, expr2: elFalse };
        var resultado = TypeChecker.validate(ast, []);
        expect(resultado).toBe(true);
      });
    });

    it('ExprNot no es valida si su argumento no es de tipo Bool', function () {
      var ast = { node: 'ExprNot', expr: elOcho };
      var resultado = TypeChecker.validate(ast, []);
      expect(resultado).toBe(false);
    });

    it('ExprNot es valida si su argumento es de tipo Bool', function () {
      var ast = { node: 'ExprNot', expr: elTrue };
      var resultado = TypeChecker.validate(ast, []);
      expect(resultado).toBe(true);
    });
  });

  describe('determinar el tipo de expresiones', function () {
    operadoresBooleanos.forEach(function (op) {
      it('el tipo de un ' + op + ' es Bool', function () {
        expect(TypeChecker.determineTypeOf({ node: op })).toBe('Bool')
      });
    });
  });
});
