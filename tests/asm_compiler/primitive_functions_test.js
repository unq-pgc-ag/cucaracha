const { suite, test, assert } = require('@pmoo/testy');

const compiler = require('../../lib/asm_compiler');
const astBuilder = require('../../lib/ast_builder');
const asmBuilder = require('../../lib/asm_builder');

suite('Cucaracha - Compilador ASM - funciones primitivas', () => {
  test('putChar() compila haciendo un mov + llamada a subrutina', () => {
    const ast = astBuilder.putChar(astBuilder.num('72'));
    const resultado = compiler.compile(ast);

    assert.that(resultado).isEqualTo([
      asmBuilder.mov('rdi', '72'),
      asmBuilder.call('putchar'),
    ]);
  });

  test('putNum() compila haciendo 3 movs + llamada a printf', () => {
    const ast = astBuilder.putNum(astBuilder.num('123'));
    const resultado = compiler.compile(ast);

    assert.that(resultado).isEqualTo([
      asmBuilder.mov('rsi', '123'),
      asmBuilder.mov('rdi', 'lli_format_string'),
      asmBuilder.mov('rax', 0),
      asmBuilder.call('printf'),
    ]);
  });
});