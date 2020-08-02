const { suite, test, assert } = require('@pmoo/testy');

const serializer = require('../lib/serializer');

suite('Cucaracha - Serializador', () => {
  test('serializa un programa vacío', () => {
    const ast = { node: 'Program', functions: [] };
    const resultado = serializer.serialize(ast);

    assert.that(resultado).isEqualTo('(Program\n)\n');
  });
});