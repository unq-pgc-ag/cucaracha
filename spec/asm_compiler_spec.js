var compiler = require('../lib/asm_compiler');
var astBuilder = require('../lib/ast_builder');
describe('Cucaracha - Compilador Assembler', function () {

  describe('Constantes numéricas', function () {
    it('compila un número como un mov', function () {
      var ast = astBuilder.num(8);
      var resultado = compiler.compile(ast);

      expect(resultado).toEqual([compiler.mov('rdi', '8')]);
    });

    it('compila un true como un mov con valor -1', function () {
      var ast = astBuilder.true();
      var resultado = compiler.compile(ast);

      expect(resultado).toEqual([compiler.mov('rdi', '-1')]);
    });

    it('compila un false como un mov con valor 0', function () {
      var ast = astBuilder.false();
      var resultado = compiler.compile(ast);

      expect(resultado).toEqual([compiler.mov('rdi', '0')]);
    });
  });
});
