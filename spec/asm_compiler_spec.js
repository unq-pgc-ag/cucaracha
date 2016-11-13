var compiler = require('../lib/asm_compiler');
var astBuilder = require('../lib/ast_builder');
var asmBuilder = require('../lib/asm_builder');

describe('Cucaracha - Compilador Assembler', function () {

  describe('Constantes numéricas / booleanas', function () {
    it('compila un número como un mov', function () {
      var ast = astBuilder.num(8);
      var resultado = compiler.compile(ast);

      expect(resultado).toEqual([asmBuilder.mov('rdi', '8')]);
    });

    it('compila un true como un mov con valor -1', function () {
      var ast = astBuilder.true();
      var resultado = compiler.compile(ast);

      expect(resultado).toEqual([asmBuilder.mov('rdi', '-1')]);
    });

    it('compila un false como un mov con valor 0', function () {
      var ast = astBuilder.false();
      var resultado = compiler.compile(ast);

      expect(resultado).toEqual([asmBuilder.mov('rdi', '0')]);
    });
  });

  describe('Esqueleto de un programa', function () {
    it('compila usando el main como rutina principal', function () {
      var ast = astBuilder.emptyProgram();
      var resultado = compiler.compile(ast);

      expect(resultado).toEqual([
        asmBuilder.section('.data'),
        asmBuilder.database('lli_format_string', '"%lli"'),
        asmBuilder.section('.text'),
        asmBuilder.global('main'),
        asmBuilder.extern(['exit', 'putchar']),
        asmBuilder.subroutine('cuca_main', [
          asmBuilder.ret(),
        ]),
        asmBuilder.subroutine('main', [
          asmBuilder.call('cuca_main'),
          asmBuilder.mov('rdi', '0'),
          asmBuilder.call('exit'),
        ]),
      ]);
    });
  });

  describe('putChar', function () {
    it('compila haciendo un mov + llamada a subrutina', function () {
      var ast = astBuilder.putChar(astBuilder.num('72'));
      var resultado = compiler.compile(ast);

      expect(resultado).toEqual([
        asmBuilder.mov('rdi', '72'),
        asmBuilder.call('putchar'),
      ]);
    });
  });

  describe('putNum', function () {
    it('compila haciendo 3 movs + llamada a printf', function () {
      var ast = astBuilder.putNum(astBuilder.num('123'));
      var resultado = compiler.compile(ast);

      expect(resultado).toEqual([
        asmBuilder.mov('rsi', '123'),
        asmBuilder.mov('rdi', 'lli_format_string'),
        asmBuilder.mov('rax', 0),
        asmBuilder.call('printf'),
      ]);
    });
  });

  describe('Definición de funciones', function () {
    it('compila con nombre cuca_nombre, apila parámetros y luego los  desapila al final', function () {
      var ast = astBuilder.emptyUnitFunction('miFuncion', []);
      var resultado = compiler.compile(ast);

      expect(resultado).toEqual([
        asmBuilder.subroutine('cuca_miFuncion', [
          asmBuilder.push('rbp'),
          asmBuilder.mov('rbp', 'rsp'),
          asmBuilder.sub('rsp', '0'),
          asmBuilder.mov('rbp', 'rsp'),
          asmBuilder.pop('rbp'),
          asmBuilder.ret(),
        ])
      ]);
    });

    xit('con x cantidad de variables locales, actualiza rsp con esa cantidad', function () {

    });
  });
});
