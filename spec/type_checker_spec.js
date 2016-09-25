var TypeChecker = require('../lib/type_checker');

describe('Cucaracha - Chequeo estático', function () {
  function chequear(ast, context) { return TypeChecker.validate(ast, context); }

  var operadoresBooleanos = ['ExprAnd', 'ExprOr', 'ExprNot', 'ExprLe', 'ExprGe', 'ExprLt', 'ExprGt', 'ExprEq', 'ExprNe'];
  var operadoresNumericos = ['ExprAdd', 'ExprSub', 'ExprMul', 'ExprLe', 'ExprGe', 'ExprLt', 'ExprGt', 'ExprEq', 'ExprNe'];

  var emptyBlock = { node: 'Block', instructions: [] };
  var elTrue = { node: 'ExprConstBool', value: 'True' };
  var elFalse = { node: 'ExprConstBool', value: 'False' };
  var elSiete = { node: 'ExprConstNum', value: '7' };
  var elOcho = { node: 'ExprConstNum', value: '8' };

  describe('Programa', function () {
    it('es correcto cuando hay una funcion main() de tipo Unit', function () {
      var main = { node: 'Function', id: 'main', tipo: 'Unit', params: [], block: emptyBlock };
      var ast = { node: 'Program', functions: [main] };
      expect(chequear(ast)).toBe(true);
    });

    it('no es correcto cuando no hay funcion main()', function () {
      var ast = { node: 'Program', functions: [] };
      expect(chequear(ast)).toBe(false);
    });

    it('no es correcto cuando hay main() pero su tipo de retorno no es Unit', function () {
      var main = { node: 'Function', id: 'main', tipo: 'Num', params: [], block: emptyBlock };
      var ast = { node: 'Program', functions: [main] };
      expect(chequear(ast)).toBe(false);
    });
  });

  describe('Function', function () {
    it('no es valida cuando el tipo de retorno es Vec', function () {
      var ast = { node: 'Function', tipo: 'Vec', params: [], block: emptyBlock };
      expect(chequear(ast)).toBe(false);
    });
  });

  describe('Expresiones Booleanas', function () {
    ['ExprAnd', 'ExprOr'].forEach(function (op) {
      it(op + ' no es valida si alguno de sus argumentos no es de tipo Bool', function () {
        var ast = { node: op, expr1: elTrue, expr2: elOcho };
        expect(chequear(ast)).toBe(false);
      });

      it(op + ' es valida si sus dos argumentos son de tipo Bool', function () {
        var ast = { node: op, expr1: elTrue, expr2: elFalse };
        expect(chequear(ast)).toBe(true);
      });
    });

    it('ExprNot no es valida si su argumento no es de tipo Bool', function () {
      var ast = { node: 'ExprNot', expr: elOcho };
      expect(chequear(ast)).toBe(false);
    });

    it('ExprNot es valida si su argumento es de tipo Bool', function () {
      var ast = { node: 'ExprNot', expr: elTrue };
      expect(chequear(ast)).toBe(true);
    });

    operadoresNumericos.forEach(function (op) {
      it(op + ' no es valida si alguno de sus argumentos no es de tipo Num', function () {
        var ast = { node: op, expr1: elSiete, expr2: elTrue };
        expect(chequear(ast)).toBe(false);
      });

      it(op + ' es valida si sus dos argumentos son de tipo Num', function () {
        var ast = { node: op, expr1: elSiete, expr2: elOcho };
        expect(chequear(ast)).toBe(true);
      });
    });
  });

  describe('llamado a procedimiento', function () {
    it('es valido cuando la funcion existe, y retorna Unit', function () {
      var ast = { node: 'StmtCall', id: 'miFuncion', expressions: [] };
      var context = { locals: {}, functions: { 'miFuncion' : 'Unit' }};
      expect(chequear(ast, context)).toBe(true);
    });

    it('no es valido cuando la funcion no existe', function () {
      var ast = { node: 'StmtCall', id: 'miFuncion', expressions: [] };
      expect(chequear(ast)).toBe(false);
    });

    it('no es valido cuando la funcion existe pero no devuelve Unit', function () {
      var ast = { node: 'StmtCall', id: 'miFuncion', expressions: [] };
      var context = { locals: {}, functions: { 'miFuncion' : 'Bool' }};
      expect(chequear(ast, context)).toBe(false);
    });
  });

  describe('determinar el tipo de expresiones', function () {
    operadoresBooleanos.forEach(function (op) {
      it('el tipo de un ' + op + ' es Bool', function () {
        expect(TypeChecker.determineTypeOf({ node: op })).toBe('Bool');
      });
    });

    describe('llamado a funcion', function () {
      it('retorna el tipo de retorno de la funcion que ya esta en la tabla de funciones', function () {
        var ast = { node: 'ExprCall', id: 'miFuncion' };
        var context = { locals: {}, functions: { 'miFuncion' : 'Bool' }};
        expect(TypeChecker.determineTypeOf(ast, context)).toBe('Bool');
      });

      it('retorna undefined si la funcion no está en la tabla de funciones', function () {
        var ast = { node: 'ExprCall', id: 'miFuncion' };
        expect(TypeChecker.determineTypeOf(ast, {})).toBe(undefined);
      });
    })
  });
});
