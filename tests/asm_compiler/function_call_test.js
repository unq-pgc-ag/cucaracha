const { suite, test, assert } = require('@pmoo/testy');

const compiler = require('../../lib/asm_compiler');
const astBuilder = require('../../lib/ast_builder');
const asmBuilder = require('../../lib/asm_builder');

suite('Cucaracha - Compilador ASM - Llamado a funciones', () => {
  test('compila un llamado a una función sin parámetros', () => {
    const miFuncion = astBuilder.emptyUnitFunction('miFuncion', []);
    const mainBlock = astBuilder.block([astBuilder.funcCall('miFuncion')]);
    const ast = astBuilder.programWith(miFuncion, mainBlock);
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

  test('compila un llamado a una función con parámetros', () => {
    const miFuncionParams = [astBuilder.param('Int', 'x')];
    const varX = astBuilder.var('x');
    const miFuncionBlock = astBuilder.block([astBuilder.putChar(varX)]);
    const miFuncion = astBuilder.unitFunction('miFuncion', miFuncionParams, miFuncionBlock);
    const mainBlock = astBuilder.block([astBuilder.funcCall('miFuncion', [astBuilder.num('65')])]);
    const ast = astBuilder.programWith(miFuncion, mainBlock);
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