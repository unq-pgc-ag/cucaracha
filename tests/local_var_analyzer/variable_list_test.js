const { suite, test, assert } = require('@pmoo/testy');

const astBuilder = require('../../lib/ast_builder');
const localVarAnalyzer = require('../../lib/local_var_analyzer');

suite('Cucaracha - Análisis de Variables Locales - Listado', () => {
  test('lista una asignación de variable', () => {
    const ast = astBuilder.assign('x', astBuilder.num('42'));
    const resultado = localVarAnalyzer.allVarNames(ast);

    assert.that(resultado).includesExactly('x');
  });

  test('lista sólo una vez una asignación', () => {
    const ast = astBuilder.assign('x', astBuilder.num('42'));
    const resultado = localVarAnalyzer.allVarNames(ast, { x : 2 });

    assert.that(resultado).includesExactly('x');
  });

  test('lista varias asignaciones de variables', () => {
    const ast = astBuilder.block([
      astBuilder.assign('x', astBuilder.num('42')),
      astBuilder.assign('y', astBuilder.true()),
    ]);
    const resultado = localVarAnalyzer.allVarNames(ast);

    assert.that(resultado).includesExactly('x', 'y');
  });
});