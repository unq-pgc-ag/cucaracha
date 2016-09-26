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

  var expresionInvalida = { node: 'ExprAdd', expr1: elOcho, expr2: elTrue };

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
      var main = { node: 'Function', id: 'main', tipo: 'Int', params: [], block: emptyBlock };
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
      it(op + ' no es valida si alguno de sus argumentos no es de tipo Int', function () {
        var ast = { node: op, expr1: elSiete, expr2: elTrue };
        expect(chequear(ast)).toBe(false);
      });

      it(op + ' es valida si sus dos argumentos son de tipo Int', function () {
        var ast = { node: op, expr1: elSiete, expr2: elOcho };
        expect(chequear(ast)).toBe(true);
      });
    });
  });

  describe('llamado a procedimiento', function () {
    var miFuncion = { node: 'StmtCall', id: 'miFuncion', expressions: [] };

    it('es valido cuando la funcion existe, y retorna Unit', function () {
      var context = { locals: {}, functions: { 'miFuncion' : { node: 'Function', tipo: 'Unit' } }};
      expect(chequear(miFuncion, context)).toBe(true);
    });

    it('no es valido cuando la funcion no existe', function () {
      expect(chequear(miFuncion)).toBe(false);
    });

    it('no es valido cuando la funcion existe pero no devuelve Unit', function () {
      var context = { locals: {}, functions: { 'miFuncion' : { node: 'Function', tipo: 'Bool' } }};
      expect(chequear(miFuncion, context)).toBe(false);
    });
  });

  describe('return', function () {
    it('no es válido cuando su expresión no es válida', function () {
      var ret = { node: 'StmtReturn', expr: expresionInvalida };
      expect(chequear(ret)).toBe(false);
    });

    it('no es valido cuando el tipo de la expresión no coincide con el tipo de retorno de la función', function () {
      var context = { locals: {}, tipoFuncionActual: 'Bool' };
      var ret = { node: 'StmtReturn', expr: elOcho };
      expect(chequear(ret, context)).toBe(false);
    });

    it('es valido cuando el tipo de la expresión coincide con el tipo de retorno de la función', function () {
      var context = { locals: {}, tipoFuncionActual: 'Int' };
      var ret = { node: 'StmtReturn', expr: elOcho };
      expect(chequear(ret, context)).toBe(true);
    });
  });

  describe('armado de vector', function () {
    it('no es valida si alguna de sus expresiones no devuelve Int', function () {
      var vecMake = { node: 'ExprVecMake', exprs: [elOcho, elTrue] };
      expect(chequear(vecMake)).toBe(false);
    });

    it('es valida si todas sus expresiones devuelven Int', function () {
      var vecMake = { node: 'ExprVecMake', exprs: [elOcho, elSiete] };
      expect(chequear(vecMake)).toBe(true);
    });
  });

  describe('longitud de un vector', function () {
    it('no es valida si la variable no esta definida', function () {
      var vecLength = { node: 'ExprVecLength', id: 'x' };
      expect(chequear(vecLength)).toBe(false);
    });

    it('no es valida si la variable esta definida pero no es de tipo Vec', function () {
      var vecLength = { node: 'ExprVecLength', id: 'x' };
      var context = { locals: { 'x' : 'Bool' } };
      expect(chequear(vecLength, context)).toBe(false);
    });

    it('es valida si la variable es de tipo Vec', function () {
      var vecLength = { node: 'ExprVecLength', id: 'x' };
      var context = { locals: { 'x' : 'Vec' } };
      expect(chequear(vecLength, context)).toBe(true);
    });
  });

  describe('acceso a un vector', function () {
    it('no es valida si el indice no es de tipo Int', function () {
      var vecDeref = { node: 'ExprVecDeref', id: 'x', expr: elTrue };
      var context = { locals: { 'x' : 'Vec' } };
      expect(chequear(vecDeref, context)).toBe(false);
    });

    it('no es valida si el vector no es de tipo Vec', function () {
      var vecDeref = { node: 'ExprVecDeref', id: 'x', expr: elOcho };
      var context = { locals: { 'x' : 'Int' } };
      expect(chequear(vecDeref, context)).toBe(false);
    });

    it('es valida si el indice es de tipo Int, y el vector de tipo Vec', function () {
      var vecDeref = { node: 'ExprVecDeref', id: 'x', expr: elOcho };
      var context = { locals: { 'x' : 'Vec' } };
      expect(chequear(vecDeref, context)).toBe(true);
    });
  });

  describe('asignación a vector', function () {
    it('no es valida si la variable no es de tipo Vec', function () {
      var vecAssign = { node: 'StmtVecAssign', id: 'x', expr1: elSiete, expr2: elOcho };
      var context = { locals: { 'x' : 'Bool' } };
      expect(chequear(vecAssign, context)).toBe(false);
    });

    it('no es valida si el indice no es de tipo Int', function () {
      var vecAssign = { node: 'StmtVecAssign', id: 'x', expr1: elTrue, expr2: elOcho };
      var context = { locals: { 'x' : 'Vec' } };
      expect(chequear(vecAssign, context)).toBe(false);
    });

    it('no es valida si la expresión no es de tipo Int', function () {
      var vecAssign = { node: 'StmtVecAssign', id: 'x', expr1: elSiete, expr2: elFalse };
      var context = { locals: { 'x' : 'Vec' } };
      expect(chequear(vecAssign, context)).toBe(false);
    });

    it('es valida si cumple los tres requisitos', function () {
      var vecAssign = { node: 'StmtVecAssign', id: 'x', expr1: elSiete, expr2: elOcho };
      var context = { locals: { 'x' : 'Vec' } };
      expect(chequear(vecAssign, context)).toBe(true);
    });
  });

  describe('if', function () {
    it('no es valido si la condicion no es booleana', function () {
      var elIf = { node: 'StmtIf', }
    });
  });

  describe('determinar el tipo de expresiones', function () {
    operadoresBooleanos.forEach(function (op) {
      it('el tipo de un ' + op + ' es Bool', function () {
        expect(TypeChecker.determineTypeOf({ node: op })).toBe('Bool');
      });
    });

    describe('llamado a función', function () {
      var miFuncion = { node: 'ExprCall', id: 'miFuncion' };

      it('retorna el tipo de retorno de la función que ya está en la tabla de funciones', function () {
        var context = { locals: {}, functions: { 'miFuncion' : { node: 'Function', tipo: 'Bool' } } };
        expect(TypeChecker.determineTypeOf(miFuncion, context)).toBe('Bool');
      });

      it('retorna undefined si la función no está en la tabla de funciones', function () {
        expect(TypeChecker.determineTypeOf(miFuncion, {})).toBe(undefined);
      });
    })
  });
});
