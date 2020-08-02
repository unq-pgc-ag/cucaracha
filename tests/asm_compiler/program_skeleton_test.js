const { suite, test, assert } = require('@pmoo/testy');

const compiler = require('../../lib/asm_compiler');
const astBuilder = require('../../lib/ast_builder');
const asmBuilder = require('../../lib/asm_builder');

suite('Cucaracha - Compilador ASM - Esqueleto de un programa', () => {
  test('compila usando el main como rutina principal', () => {
    const ast = astBuilder.emptyProgram();
    const resultado = compiler.compile(ast);

    assert.that(resultado).isEqualTo([
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