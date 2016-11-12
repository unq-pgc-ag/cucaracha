var compiler = require('../lib/asm_compiler');
var astBuilder = require('../lib/ast_builder');
describe('Cucaracha - Compilador Assembler', function () {

  describe('Constantes numéricas / booleanas', function () {
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

  describe('Esqueleto de un programa', function () {
    it('compila usando el main como rutina principal', function () {
      var ast = astBuilder.emptyProgram();
      var resultado = compiler.compile(ast);

      expect(resultado).toEqual([
        compiler.section('.text'),
        compiler.global('main'),
        compiler.extern(['exit', 'putchar']),
        compiler.subroutine('cuca_main', [ compiler.ret() ]),
        compiler.subroutine('main', [
          compiler.call('cuca_main'),
          compiler.mov('rdi', '0'),
          compiler.call('exit')
        ]),
      ]);
    });
  });

  describe('putChar', function () {
    it('compila haciendo un mov + llamada a subrutina', function () {
      var ast = astBuilder.putChar(astBuilder.num('72'));
      var resultado = compiler.compile(ast);

      expect(resultado).toEqual([
        compiler.mov('rdi', '72'),
        compiler.call('putchar'),
      ]);
    });
  });
});
