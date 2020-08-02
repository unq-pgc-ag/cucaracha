const { suite, test, assert } = require('@pmoo/testy');

const astBuilder = require('../../lib/ast_builder');
const localVarAnalyzer = require('../../lib/local_var_analyzer');

const numberAssignment = astBuilder.assign('x', astBuilder.num('42'));
const booleanAssignment = astBuilder.assign('y', astBuilder.true());

suite('Cucaracha - Análisis de Variables Locales - Listado', () => {
  test('lista una asignación de variable', () => {
    const resultado = localVarAnalyzer.allVarNames(numberAssignment);

    assert.that(resultado).includesExactly('x');
  });

  test('lista sólo una vez una asignación', () => {
    const resultado = localVarAnalyzer.allVarNames(numberAssignment, { x : 2 });

    assert.that(resultado).includesExactly('x');
  });

  test('lista varias asignaciones de variables', () => {
    const ast = astBuilder.block([numberAssignment, booleanAssignment]);
    const resultado = localVarAnalyzer.allVarNames(ast);

    assert.that(resultado).includesExactly('x', 'y');
  });
});