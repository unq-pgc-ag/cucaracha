var varCounter = require('../lib/var_counter');
var astBuilder = require('../lib/ast_builder');

describe('Cucaracha - contador de variables', function () {
  it('cuenta una asignación de variable', function () {
    var ast = astBuilder.assign('x', astBuilder.num('42'));
    var resultado = varCounter.count(ast);

    expect(resultado).toEqual(1);
  });

  it('no cuenta una asignación de variable si la variable ya fue vista', function () {
    var ast = astBuilder.assign('x', astBuilder.num('42'));
    var resultado = varCounter.count(ast, { x : 2 });

    expect(resultado).toEqual(1);
  });

  xit('cuenta un bloque con muchas asignaciones de variables', function () {

  });
});
