require('jasmine-collection-matchers');

var compiler = require('../lib/asm_compiler');
var astBuilder = require('../lib/ast_builder');
var asmBuilder = require('../lib/asm_builder');

describe('Cucaracha - Compilador Assembler', function () {

  describe('Constantes numéricas / booleanas', function () {
    it('compila un número como un mov', function () {
      var ast = astBuilder.num('16');
      var resultado = compiler.compile(ast);

      expect(resultado).toHaveSameItems([asmBuilder.mov('rdi', '16')]);
    });

    it('compila un true como un mov con valor -1', function () {
      var ast = astBuilder.true();
      var resultado = compiler.compile(ast);

      expect(resultado).toHaveSameItems([asmBuilder.mov('rdi', '-1')]);
    });

    it('compila un false como un mov con valor 0', function () {
      var ast = astBuilder.false();
      var resultado = compiler.compile(ast);

      expect(resultado).toHaveSameItems([asmBuilder.mov('rdi', '0')]);
    });
  });

  describe('Esqueleto de un programa', function () {
    it('compila usando el main como rutina principal', function () {
      var ast = astBuilder.emptyProgram();
      var resultado = compiler.compile(ast);

      expect(resultado).toHaveSameItems([
        asmBuilder.section('.data'),
        asmBuilder.database('lli_format_string', '"%lli"'),
        asmBuilder.section('.text'),
        asmBuilder.global('main'),
        asmBuilder.extern(['exit', 'putchar', 'printf']),
        asmBuilder.subroutine('cuca_main', [
          asmBuilder.push('rbp'),
          asmBuilder.mov('rbp', 'rsp'),
          asmBuilder.mov('rsp', 'rbp'),
          asmBuilder.pop('rbp'),
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

      expect(resultado).toHaveSameItems([
        asmBuilder.mov('rdi', '72'),
        asmBuilder.call('putchar'),
      ]);
    });
  });

  describe('putNum', function () {
    it('compila haciendo 3 movs + llamada a printf', function () {
      var ast = astBuilder.putNum(astBuilder.num('123'));
      var resultado = compiler.compile(ast);

      expect(resultado).toHaveSameItems([
        asmBuilder.mov('rsi', '123'),
        asmBuilder.mov('rdi', 'lli_format_string'),
        asmBuilder.mov('rax', 0),
        asmBuilder.call('printf'),
      ]);
    });
  });

  describe('Definición de funciones', function () {
    it('compila con nombre cuca_nombre', function () {
      var ast = astBuilder.emptyUnitFunction('miFuncion', []);
      var resultado = compiler.compile(ast);

      expect(resultado).toHaveSameItems([
        asmBuilder.subroutine('cuca_miFuncion', [
          asmBuilder.push('rbp'),
          asmBuilder.mov('rbp', 'rsp'),
          // cuerpo de la función
          asmBuilder.mov('rsp', 'rbp'),
          asmBuilder.pop('rbp'),
          asmBuilder.ret(),
        ])
      ]);
    });

    it('con x cantidad de variables locales, actualiza rsp con esa cantidad y lo restaura al final', function () {
      var block = astBuilder.block([
        astBuilder.assign('x', astBuilder.num('42')),
        astBuilder.assign('y', astBuilder.true()),
      ]);
      var ast = astBuilder.unitFunction('miFuncion', [], block);
      var resultado = compiler.compile(ast);

      var prefix = [
        asmBuilder.push('rbp'),
        asmBuilder.mov('rbp', 'rsp'),
        asmBuilder.sub('rsp', '16'), // 2 variables locales * 8 que es el espacio que ocupa cada una
      ]
      var compiledBlock = [
        // asignación de x
        asmBuilder.mov('rdi', '42'),
        asmBuilder.mov('[rbp - 8]', 'rdi'),
        // asignación de y
        asmBuilder.mov('rdi', '-1'),
        asmBuilder.mov('[rbp - 16]', 'rdi'),
      ]
      var suffix = [
        asmBuilder.mov('rsp', 'rbp'),
        asmBuilder.pop('rbp'),
        asmBuilder.ret(),
      ]
      expect(resultado).toHaveSameItems([
        asmBuilder.subroutine(
          'cuca_miFuncion',
          prefix.concat(compiledBlock).concat(suffix)
        ),
      ]);
    });
  });

  describe('Llamado a funciones', function () {
    it('compila un llamado a una funcion sin parámetros', function () {
      var miFuncion = astBuilder.emptyUnitFunction('miFuncion', []);
      var mainBlock = astBuilder.block([astBuilder.funcCall('miFuncion')]);
      var ast = astBuilder.programWith(miFuncion, mainBlock);
      var resultado = compiler.compile(ast);

      expect(resultado).toHaveSameItems([
        asmBuilder.section('.data'),
        asmBuilder.database('lli_format_string', '"%lli"'),
        asmBuilder.section('.text'),
        asmBuilder.global('main'),
        asmBuilder.extern(['exit', 'putchar', 'printf']),
        asmBuilder.subroutine('cuca_main', [
          asmBuilder.push('rbp'),
          asmBuilder.mov('rbp', 'rsp'),
          asmBuilder.call('cuca_miFuncion'),
          asmBuilder.mov('rsp', 'rbp'),
          asmBuilder.pop('rbp'),
          asmBuilder.ret(),
        ]),
        asmBuilder.subroutine('cuca_miFuncion', [
          asmBuilder.push('rbp'),
          asmBuilder.mov('rbp', 'rsp'),
          asmBuilder.mov('rsp', 'rbp'),
          asmBuilder.pop('rbp'),
          asmBuilder.ret(),
        ]),
        asmBuilder.subroutine('main', [
          asmBuilder.call('cuca_main'),
          asmBuilder.mov('rdi', '0'),
          asmBuilder.call('exit'),
        ]),
      ]);
    });

    it('compila un llamado a una función con parámetros', function () {
      var miFuncionParams = [astBuilder.param('Int', 'x')];
      var varX = astBuilder.var('x');
      var miFuncionBlock = astBuilder.block([astBuilder.putChar(varX)]);
      var miFuncion = astBuilder.unitFunction('miFuncion', miFuncionParams, miFuncionBlock);
      var mainBlock = astBuilder.block([astBuilder.funcCall('miFuncion', [astBuilder.num('65')])]);
      var ast = astBuilder.programWith(miFuncion, mainBlock);
      var resultado = compiler.compile(ast);

      expect(resultado).toHaveSameItems([
        asmBuilder.section('.data'),
        asmBuilder.database('lli_format_string', '"%lli"'),
        asmBuilder.section('.text'),
        asmBuilder.global('main'),
        asmBuilder.extern(['exit', 'putchar', 'printf']),
        asmBuilder.subroutine('cuca_main', [
          asmBuilder.push('rbp'),
          asmBuilder.mov('rbp', 'rsp'),
          asmBuilder.sub('rsp', '8'), // guardo lugar para 1 parámetro
          asmBuilder.mov('rdi', '65'),
          asmBuilder.mov('[rsp + 0]', 'rdi'),
          asmBuilder.call('cuca_miFuncion'),
          asmBuilder.add('rsp', '8'), // libero el lugar
          asmBuilder.mov('rsp', 'rbp'),
          asmBuilder.pop('rbp'),
          asmBuilder.ret(),
        ]),
        asmBuilder.subroutine('cuca_miFuncion', [
          asmBuilder.push('rbp'),
          asmBuilder.mov('rbp', 'rsp'),
          asmBuilder.mov('rdi', '[rbp + 16]'),
          asmBuilder.call('putchar'),
          asmBuilder.mov('rsp', 'rbp'),
          asmBuilder.pop('rbp'),
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

  describe('Asignaciones', function () {
    it('compila una asignación compilando primero la expresión y después haciendo un mov a la posición de memoria asignada', function () {
      var context = { localVarNames: ['x'], params: [], availableRegisters: ['rdi'] };
      var ast = astBuilder.assign('x', astBuilder.num('66'));
      var resultado = compiler.compile(ast, context);

      expect(resultado).toHaveSameItems([
        asmBuilder.mov('rdi', '66'),
        asmBuilder.mov('[rbp - 8]', 'rdi'),
      ]);
    });
  });
});
