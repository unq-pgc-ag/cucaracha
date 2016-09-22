var serializer = require('../lib/serializer');

describe('Cucaracha - Serializer', function () {
  describe('Programa', function () {
    it('serializa un programa vacio', function () {
      var ast = { node: 'Program', functions: [] };
      var resultado = serializer.serialize(ast);
      expect(resultado).toBe('(Program\n)\n');
    });
  });
});
