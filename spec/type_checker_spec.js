var typeChecker = require('../lib/type_checker');
var astBuilder = require('../lib/ast_builder');

describe('Cucaracha - Chequeo estático', function () {
  function chequear(ast, context) { return typeChecker.validate(ast, context); }

  var operadoresBooleanos = ['ExprAnd', 'ExprOr', 'ExprNot', 'ExprLe', 'ExprGe', 'ExprLt', 'ExprGt', 'ExprEq', 'ExprNe'];
  var operadoresNumericos = ['ExprAdd', 'ExprSub', 'ExprMul', 'ExprLe', 'ExprGe', 'ExprLt', 'ExprGt', 'ExprEq', 'ExprNe'];

  var emptyBlock = { node: 'Block', instructions: [] };
  var elTrue = astBuilder.true();
  var elFalse = astBuilder.false();
  var elSiete = astBuilder.num(7);
  var elOcho = astBuilder.num(8);

  var expresionInvalida = astBuilder.add(elOcho, elTrue);

  var intParam = astBuilder.param('Int', 'n');

  describe('Programa', function () {
    it('es correcto cuando hay una función main() de tipo Unit', function () {
      var ast = astBuilder.emptyProgram();
      expect(chequear(ast)).toBe(true);
    });

    it('no es correcto cuando no hay función main()', function () {
      var ast = { node: 'Program', functions: [] };
      expect(chequear(ast)).toBe(false);
    });

    it('no es correcto cuando hay main() pero su tipo de retorno no es Unit', function () {
      var main = { node: 'Function', id: 'main', tipo: 'Int', params: [], block: emptyBlock };
      var ast = { node: 'Program', functions: [main] };
      expect(chequear(ast)).toBe(false);
    });

    it('no es correcto cuando el main() tiene parámetros en su definición', function () {
      var main = { node: 'Function', id: 'main', tipo: 'Unit', params: [intParam], block: emptyBlock };
      var ast = { node: 'Program', functions: [main] };

      expect(chequear(ast)).toBe(false);
    });
  });

  describe('llamado a función', function () {
    var miFuncion = { node: 'ExprCall', id: 'miFuncion', exprList: [elTrue, elOcho] };

    it('no es válido cuando la función no existe', function () {
      var context = { locals: {}, functions: {} };
      expect(chequear(miFuncion, context)).toBe(false);
    });

    it('no es válido cuando la función existe, pero devuelve Unit', function () {
      var miFuncionDef = { node: 'Function', tipo: 'Unit', params: [intParam] };
      var context = { locals: {}, functions: { miFuncion: miFuncionDef } };
      expect(chequear(miFuncion, context)).toBe(false);
    });

    it('no es válido cuando la función existe, pero alguna de sus expresiones está mal formada', function () {
      var miFuncion = { node: 'ExprCall', id: 'miFuncion', exprList: [elTrue, expresionInvalida] };
      var miFuncionDef = { node: 'Function', tipo: 'Int', params: [intParam] };
      var context = { locals: {}, functions: { miFuncion: miFuncionDef } };
      expect(chequear(miFuncion, context)).toBe(false);
    });

    it('no es válido cuando la función existe, pero alguno de sus parámetros no coincide', function () {
      var miFuncionDef = { node: 'Function', tipo: 'Int', params: [
        { node: 'Parameter', id: 'b1', type: 'Bool' },
        { node: 'Parameter', id: 'b2', type: 'Bool' }
      ] };
      var context = { locals: {}, functions: { miFuncion: miFuncionDef } };
      expect(chequear(miFuncion, context)).toBe(false);
    });

    it('no es válido cuando la cantidad de parámetros pasada es menor', function () {
      var miFuncionDef = { node: 'Function', tipo: 'Int', params: [
        { node: 'Parameter', id: 'b1', type: 'Bool' },
        { node: 'Parameter', id: 'b2', type: 'Bool' }
      ] };
      var context = { locals: {}, functions: { miFuncion: miFuncionDef } };
      var miFuncion = { node: 'ExprCall', id: 'miFuncion', exprList: [elTrue] };
      expect(chequear(miFuncion, context)).toBe(false);
    });

    it('no es válido cuando la cantidad de parámetros pasada es mayor', function () {
      var miFuncionDef = { node: 'Function', tipo: 'Int', params: [
        { node: 'Parameter', id: 'b1', type: 'Bool' }
      ] };
      var context = { locals: {}, functions: { miFuncion: miFuncionDef } };
      expect(chequear(miFuncion, context)).toBe(false);
    });

    it('es válido cuando se cumplen todas las condiciones anteriores', function () {
      var miFuncionDef = { node: 'Function', tipo: 'Int', params: [
        { node: 'Parameter', id: 'n', type: 'Bool' },
        intParam,
      ] };
      var context = { locals: {}, functions: { miFuncion: miFuncionDef } };
      expect(chequear(miFuncion, context)).toBe(true);
    });
  });

  describe('Function', function () {
    it('no es válida cuando el tipo de retorno es Vec', function () {
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

    it('es válido cuando la función existe, y retorna Unit', function () {
      var context = { locals: {}, functions: { 'miFuncion' : { node: 'Function', tipo: 'Unit' } }};
      expect(chequear(miFuncion, context)).toBe(true);
    });

    it('no es válido cuando la función no existe', function () {
      expect(chequear(miFuncion)).toBe(false);
    });

    it('no es válido cuando la función existe pero no devuelve Unit', function () {
      var context = { locals: {}, functions: { 'miFuncion' : { node: 'Function', tipo: 'Bool' } }};
      expect(chequear(miFuncion, context)).toBe(false);
    });

    describe('funciones predefinidas', function () {
      describe('putChar()', function () {
        var putCharDef = { node: 'Function', tipo: 'Unit', params: [{ node: 'Parameter', id: 'n', type: 'Int' }] };
        var context = { locals: '', functions: { putChar: putCharDef } };

        xit('no es válida cuando el parámetro no es Int', function () {
          var ast = astBuilder.putChar(elTrue);
          expect(chequear(ast, context)).toBe(false);
        });

        it('es válida cuando el parámetro es Int', function () {
          var ast = astBuilder.putChar(elOcho);
          expect(chequear(ast, context)).toBe(true);
        });
      });

      describe('putNum()', function () {
        var putNumDef = { node: 'Function', tipo: 'Unit', params: [{ node: 'Parameter', id: 'n', type: 'Int' }] };
        var context = { locals: '', functions: { putNum: putNumDef } };

        xit('no es válida cuando el parámetro no es Int', function () {
          var ast = { node: 'StmtCall', id: 'putNum', expressions: [elTrue] };
          expect(chequear(ast, context)).toBe(false);
        });

        it('es válida cuando el parámetro es Int', function () {
          var ast = { node: 'StmtCall', id: 'putNum', expressions: [elOcho] };
          expect(chequear(ast, context)).toBe(true);
        });
      });
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
    it('no es válida si alguna de sus expresiones no devuelve Int', function () {
      var vecMake = { node: 'ExprVecMake', exprs: [elOcho, elTrue] };
      expect(chequear(vecMake)).toBe(false);
    });

    it('es válida si todas sus expresiones devuelven Int', function () {
      var vecMake = { node: 'ExprVecMake', exprs: [elOcho, elSiete] };
      expect(chequear(vecMake)).toBe(true);
    });
  });

  describe('longitud de un vector', function () {
    it('no es válida si la variable no está definida', function () {
      var vecLength = { node: 'ExprVecLength', id: 'x' };
      expect(chequear(vecLength)).toBe(false);
    });

    it('no es válida si la variable está definida pero no es de tipo Vec', function () {
      var vecLength = { node: 'ExprVecLength', id: 'x' };
      var context = { locals: { 'x' : 'Bool' } };
      expect(chequear(vecLength, context)).toBe(false);
    });

    it('es válida si la variable es de tipo Vec', function () {
      var vecLength = { node: 'ExprVecLength', id: 'x' };
      var context = { locals: { 'x' : 'Vec' } };
      expect(chequear(vecLength, context)).toBe(true);
    });
  });

  describe('acceso a un vector', function () {
    it('no es válida si el índice no es de tipo Int', function () {
      var vecDeref = { node: 'ExprVecDeref', id: 'x', expr: elTrue };
      var context = { locals: { 'x' : 'Vec' } };
      expect(chequear(vecDeref, context)).toBe(false);
    });

    it('no es válida si el vector no es de tipo Vec', function () {
      var vecDeref = { node: 'ExprVecDeref', id: 'x', expr: elOcho };
      var context = { locals: { 'x' : 'Int' } };
      expect(chequear(vecDeref, context)).toBe(false);
    });

    it('es válida si el índice es de tipo Int, y el vector de tipo Vec', function () {
      var vecDeref = { node: 'ExprVecDeref', id: 'x', expr: elOcho };
      var context = { locals: { 'x' : 'Vec' } };
      expect(chequear(vecDeref, context)).toBe(true);
    });
  });

  describe('asignación a vector', function () {
    it('no es válida si la variable no es de tipo Vec', function () {
      var vecAssign = { node: 'StmtVecAssign', id: 'x', expr1: elSiete, expr2: elOcho };
      var context = { locals: { 'x' : 'Bool' } };
      expect(chequear(vecAssign, context)).toBe(false);
    });

    it('no es válida si el índice no es de tipo Int', function () {
      var vecAssign = { node: 'StmtVecAssign', id: 'x', expr1: elTrue, expr2: elOcho };
      var context = { locals: { 'x' : 'Vec' } };
      expect(chequear(vecAssign, context)).toBe(false);
    });

    it('no es válida si la expresión no es de tipo Int', function () {
      var vecAssign = { node: 'StmtVecAssign', id: 'x', expr1: elSiete, expr2: elFalse };
      var context = { locals: { 'x' : 'Vec' } };
      expect(chequear(vecAssign, context)).toBe(false);
    });

    it('es válida si cumple los tres requisitos', function () {
      var vecAssign = { node: 'StmtVecAssign', id: 'x', expr1: elSiete, expr2: elOcho };
      var context = { locals: { 'x' : 'Vec' } };
      expect(chequear(vecAssign, context)).toBe(true);
    });
  });

  describe('if', function () {
    it('no es válido si la condición no es booleana', function () {
      var elIf = { node: 'StmtIf', expr: elOcho, block: emptyBlock }
      expect(chequear(elIf)).toBe(false);
    });

    it('es válido si la condición es booleana', function () {
      var elIf = { node: 'StmtIf', expr: elFalse, block: emptyBlock }
      expect(chequear(elIf)).toBe(true);
    });
  });

  describe('determinar el tipo de expresiones', function () {
    operadoresBooleanos.forEach(function (op) {
      it('el tipo de un ' + op + ' es Bool', function () {
        expect(typeChecker.determineTypeOf({ node: op })).toBe('Bool');
      });
    });

    describe('llamado a función', function () {
      var miFuncion = { node: 'ExprCall', id: 'miFuncion' };

      it('retorna el tipo de retorno de la función que ya está en la tabla de funciones', function () {
        var context = { locals: {}, functions: { 'miFuncion' : { node: 'Function', tipo: 'Bool' } } };
        expect(typeChecker.determineTypeOf(miFuncion, context)).toBe('Bool');
      });

      it('retorna undefined si la función no está en la tabla de funciones', function () {
        expect(typeChecker.determineTypeOf(miFuncion, {})).toBe(undefined);
      });
    })
  });
});
