var compiler = require('../lib/asm_compiler');
var astBuilder = require('../lib/ast_builder');
describe('Cucaracha - Compilador Assembler', function () {

  describe('Constantes numéricas', function () {
    it('escribe un ', function () {
      var ast = astBuilder.num(8);
      var resultado = compiler.compile(ast);

      expect(resultado).toBe('mov rdi, 8');
    });
  });
});
