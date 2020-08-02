const { suite, test, assert } = require('@pmoo/testy');

const compiler = require('../../lib/asm_compiler');
const astBuilder = require('../../lib/ast_builder');
const asmBuilder = require('../../lib/asm_builder');

suite('Cucaracha - Compilador ASM - Constantes numéricas / booleanas', () => {
  test('compila un número como un mov', () => {
    const ast = astBuilder.num('16');
    const resultado = compiler.compile(ast);

    assert.that(resultado).includesExactly(asmBuilder.mov('rdi', '16'));
  });

  test('compila un true como un mov con valor -1', () => {
    const ast = astBuilder.true();
    const resultado = compiler.compile(ast);

    assert.that(resultado).includesExactly(asmBuilder.mov('rdi', '-1'));
  });

  test('compila un false como un mov con valor 0', () => {
    const ast = astBuilder.false();
    const resultado = compiler.compile(ast);

    assert.that(resultado).includesExactly(asmBuilder.mov('rdi', '0'));
  });
});