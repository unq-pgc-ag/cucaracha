const { suite, test, assert } = require('@pmoo/testy');

const astBuilder = require('../../lib/ast_builder');
const localVarAnalyzer = require('../../lib/local_var_analyzer');

const numberAssignment = astBuilder.assign('x', astBuilder.num('42'));
const booleanAssignment = astBuilder.assign('y', astBuilder.true());

suite('Cucaracha - Análisis de Variables Locales - Contador', () => {
  test('cuenta una asignación de variable', () => {
    const resultado = localVarAnalyzer.count(numberAssignment);

    assert.that(resultado).isEqualTo(1);
  });

  test('no cuenta una asignación de variable si la variable ya fue vista', () => {
    const resultado = localVarAnalyzer.count(numberAssignment, { x : 2 });

    assert.that(resultado).isEqualTo(1);
  });

  test('cuenta un bloque con muchas asignaciones de variables', () => {
    const ast = astBuilder.block([numberAssignment, booleanAssignment]);
    const resultado = localVarAnalyzer.count(ast);

    assert.that(resultado).isEqualTo(2);
  });
});