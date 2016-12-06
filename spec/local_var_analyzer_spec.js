var localVarAnalyzer = require('../lib/local_var_analyzer');
var astBuilder = require('../lib/ast_builder');

describe('Cucaracha - analizador de variables locales', function () {
  describe('conteo de variables', function () {
    it('cuenta una asignación de variable', function () {
      var ast = astBuilder.assign('x', astBuilder.num('42'));
      var resultado = localVarAnalyzer.count(ast);

      expect(resultado).toEqual(1);
    });

    it('no cuenta una asignación de variable si la variable ya fue vista', function () {
      var ast = astBuilder.assign('x', astBuilder.num('42'));
      var resultado = localVarAnalyzer.count(ast, { x : 2 });

      expect(resultado).toEqual(1);
    });

    it('cuenta un bloque con muchas asignaciones de variables', function () {
      var ast = astBuilder.block([
        astBuilder.assign('x', astBuilder.num('42')),
        astBuilder.assign('y', astBuilder.true()),
      ]);
      var resultado = localVarAnalyzer.count(ast);

      expect(resultado).toEqual(2);
    });
  });

  describe('listado de todas las variables locales', function () {
    it('lista una asignación de variable', function () {
      var ast = astBuilder.assign('x', astBuilder.num('42'));
      var resultado = localVarAnalyzer.allVarNames(ast);

      expect(resultado).toHaveSameItems(['x']);
    });

    it('lista sólo una vez una asignación', function () {
      var ast = astBuilder.assign('x', astBuilder.num('42'));
      var resultado = localVarAnalyzer.allVarNames(ast, { x : 2 });

      expect(resultado).toHaveSameItems(['x']);
    });

    it('lista varias asignaciones de variables', function () {
      var ast = astBuilder.block([
        astBuilder.assign('x', astBuilder.num('42')),
        astBuilder.assign('y', astBuilder.true()),
      ]);
      var resultado = localVarAnalyzer.allVarNames(ast);

      expect(resultado).toHaveSameItems(['x', 'y']);
    });
  });
});
