const { suite, test, assert } = require('@pmoo/testy');

const astBuilder = require('../../lib/ast_builder');
const localVarAnalyzer = require('../../lib/local_var_analyzer');

suite('Cucaracha - Análisis de Variables Locales - Contador', () => {
  test('cuenta una asignación de variable', () => {
    const ast = astBuilder.assign('x', astBuilder.num('42'));
    const resultado = localVarAnalyzer.count(ast);

    assert.that(resultado).isEqualTo(1);
  });

  test('no cuenta una asignación de variable si la variable ya fue vista', () => {
    const ast = astBuilder.assign('x', astBuilder.num('42'));
    const resultado = localVarAnalyzer.count(ast, { x : 2 });

    assert.that(resultado).isEqualTo(1);
  });

  test('cuenta un bloque con muchas asignaciones de variables', () => {
    const ast = astBuilder.block([
      astBuilder.assign('x', astBuilder.num('42')),
      astBuilder.assign('y', astBuilder.true()),
    ]);
    const resultado = localVarAnalyzer.count(ast);

    assert.that(resultado).isEqualTo(2);
  });
});