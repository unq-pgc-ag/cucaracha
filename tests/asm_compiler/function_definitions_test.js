const { suite, test, assert } = require('@pmoo/testy');

const compiler = require('../../lib/asm_compiler');
const astBuilder = require('../../lib/ast_builder');
const asmBuilder = require('../../lib/asm_builder');

suite('Cucaracha - Compilador ASM - Definición de funciones', () => {
  test('compila con nombre cuca_nombre', () => {
    const ast = astBuilder.emptyUnitFunction('miFuncion', []);
    const resultado = compiler.compile(ast);

    assert.that(resultado).isEqualTo([
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

  test('con x cantidad de variables locales, actualiza rsp con esa cantidad y lo restaura al final', () => {
    const block = astBuilder.block([
      astBuilder.assign('x', astBuilder.num('42')),
      astBuilder.assign('y', astBuilder.true()),
    ]);
    const ast = astBuilder.unitFunction('miFuncion', [], block);
    const resultado = compiler.compile(ast);

    const prefix = [
      asmBuilder.push('rbp'),
      asmBuilder.mov('rbp', 'rsp'),
      asmBuilder.sub('rsp', '16'), // 2 variables locales * 8 que es el espacio que ocupa cada una
    ];
    const compiledBlock = [
      // asignación de x
      asmBuilder.mov('rdi', '42'),
      asmBuilder.mov('[rbp - 8]', 'rdi'),
      // asignación de y
      asmBuilder.mov('rdi', '-1'),
      asmBuilder.mov('[rbp - 16]', 'rdi'),
    ];
    const suffix = [
      asmBuilder.mov('rsp', 'rbp'),
      asmBuilder.pop('rbp'),
      asmBuilder.ret(),
    ];
    assert.that(resultado).isEqualTo([
      asmBuilder.subroutine(
        'cuca_miFuncion',
        prefix.concat(compiledBlock).concat(suffix)
      ),
    ]);
  });
});