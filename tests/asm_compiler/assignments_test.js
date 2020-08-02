const { suite, test, assert } = require('@pmoo/testy');

const compiler = require('../../lib/asm_compiler');
const astBuilder = require('../../lib/ast_builder');
const asmBuilder = require('../../lib/asm_builder');

suite('Cucaracha - Compilador ASM - Asignaciones', () => {
  test('compila una asignación compilando primero la expresión y después haciendo un mov a la posición de memoria asignada', () => {
    const context = { localVarNames: ['x'], params: [], availableRegisters: ['rdi'] };
    const ast = astBuilder.assign('x', astBuilder.num('66'));
    const resultado = compiler.compile(ast, context);

    assert.that(resultado).isEqualTo([
      asmBuilder.mov('rdi', '66'),
      asmBuilder.mov('[rbp - 8]', 'rdi'),
    ]);
  });
});