const { suite, test, assert, pending } = require('@pmoo/testy');

const typeChecker = require('../lib/type_checker');
const astBuilder = require('../lib/ast_builder');

// TODO: armar diferentes test suites
suite('Cucaracha - Chequeo estático', () => {
  function chequear(ast, context) { return typeChecker.validate(ast, context); }

  const operadoresBooleanos = ['ExprAnd', 'ExprOr', 'ExprNot', 'ExprLe', 'ExprGe', 'ExprLt', 'ExprGt', 'ExprEq', 'ExprNe'];
  const operadoresNumericos = ['ExprAdd', 'ExprSub', 'ExprMul', 'ExprLe', 'ExprGe', 'ExprLt', 'ExprGt', 'ExprEq', 'ExprNe'];

  const emptyBlock = { node: 'Block', instructions: [] };
  const elTrue = astBuilder.true();
  const elFalse = astBuilder.false();
  const elSiete = astBuilder.num(7);
  const elOcho = astBuilder.num(8);

  const expresionInvalida = astBuilder.add(elOcho, elTrue);

  const intParam = astBuilder.param('Int', 'n');

  // programas

  test('un programa es correcto cuando hay una función main() de tipo Unit', () => {
    const ast = astBuilder.emptyProgram();
    assert.that(chequear(ast)).isTrue();
  });

  test('un programa no es correcto cuando no hay función main()', () => {
    const ast = { node: 'Program', functions: [] };
    assert.that(chequear(ast)).isFalse();
  });

  test('un programa no es correcto cuando hay main() pero su tipo de retorno no es Unit', () => {
    const main = { node: 'Function', id: 'main', tipo: 'Int', params: [], block: emptyBlock };
    const ast = { node: 'Program', functions: [main] };
    assert.that(chequear(ast)).isFalse();
  });

  test('un programa no es correcto cuando el main() tiene parámetros en su definición', () => {
    const main = { node: 'Function', id: 'main', tipo: 'Unit', params: [intParam], block: emptyBlock };
    const ast = { node: 'Program', functions: [main] };

    assert.that(chequear(ast)).isFalse();
  });

  // llamados a funciones

  const miFuncion = { node: 'ExprCall', id: 'miFuncion', exprList: [elTrue, elOcho] };

  test('llamado a función no es válido cuando la función no existe', () => {
    const context = { locals: {}, functions: {} };
    assert.that(chequear(miFuncion, context)).isFalse();
  });

  test('llamado a función no es válido cuando la función existe, pero devuelve Unit', () => {
    const miFuncionDef = { node: 'Function', tipo: 'Unit', params: [intParam] };
    const context = { locals: {}, functions: { miFuncion: miFuncionDef } };
    assert.that(chequear(miFuncion, context)).isFalse();
  });

  test('llamado a función no es válido cuando la función existe, pero alguna de sus expresiones está mal formada', () => {
    const miFuncion = { node: 'ExprCall', id: 'miFuncion', exprList: [elTrue, expresionInvalida] };
    const miFuncionDef = { node: 'Function', tipo: 'Int', params: [intParam] };
    const context = { locals: {}, functions: { miFuncion: miFuncionDef } };
    assert.that(chequear(miFuncion, context)).isFalse();
  });

  test('llamado a función no es válido cuando la función existe, pero alguno de sus parámetros no coincide', () => {
    const miFuncionDef = { node: 'Function', tipo: 'Int', params: [
        { node: 'Parameter', id: 'b1', type: 'Bool' },
        { node: 'Parameter', id: 'b2', type: 'Bool' }
      ] };
    const context = { locals: {}, functions: { miFuncion: miFuncionDef } };
    assert.that(chequear(miFuncion, context)).isFalse();
  });

  test('llamado a función no es válido cuando la cantidad de parámetros pasada es menor', () => {
    const miFuncionDef = { node: 'Function', tipo: 'Int', params: [
        { node: 'Parameter', id: 'b1', type: 'Bool' },
        { node: 'Parameter', id: 'b2', type: 'Bool' }
      ] };
    const context = { locals: {}, functions: { miFuncion: miFuncionDef } };
    const miFuncion = { node: 'ExprCall', id: 'miFuncion', exprList: [elTrue] };
    assert.that(chequear(miFuncion, context)).isFalse();
  });

  test('llamado a función no es válido cuando la cantidad de parámetros pasada es mayor', () => {
    const miFuncionDef = { node: 'Function', tipo: 'Int', params: [
        { node: 'Parameter', id: 'b1', type: 'Bool' }
      ] };
    const context = { locals: {}, functions: { miFuncion: miFuncionDef } };
    assert.that(chequear(miFuncion, context)).isFalse();
  });

  test('llamado a función es válido cuando se cumplen todas las condiciones anteriores', () => {
    const miFuncionDef = { node: 'Function', tipo: 'Int', params: [
        { node: 'Parameter', id: 'n', type: 'Bool' },
        intParam,
      ] };
    const context = { locals: {}, functions: { miFuncion: miFuncionDef } };
    assert.that(chequear(miFuncion, context)).isTrue();
  });

  // definicion de funciones

  test('función no es válida cuando el tipo de retorno es Vec', () => {
    const ast = { node: 'Function', tipo: 'Vec', params: [], block: emptyBlock };
    assert.that(chequear(ast)).isFalse();
  });

  // expresiones booleanas

  ['ExprAnd', 'ExprOr'].forEach(op => {
    test(`expresion booleana ${op} no es valida si alguno de sus argumentos no es de tipo Bool`, () => {
      const ast = { node: op, expr1: elTrue, expr2: elOcho };
      assert.that(chequear(ast)).isFalse();
    });

    test(`expresion booleana ${op} es valida si sus dos argumentos son de tipo Bool`, () => {
      const ast = { node: op, expr1: elTrue, expr2: elFalse };
      assert.that(chequear(ast)).isTrue();
    });
  });

  test('expresion booleana ExprNot no es valida si su argumento no es de tipo Bool', () => {
    const ast = { node: 'ExprNot', expr: elOcho };
    assert.that(chequear(ast)).isFalse();
  });

  test('expresion booleana ExprNot es valida si su argumento es de tipo Bool', () => {
    const ast = { node: 'ExprNot', expr: elTrue };
    assert.that(chequear(ast)).isTrue();
  });

  operadoresNumericos.forEach(op => {
    test(`expresion booleana ${op} no es valida si alguno de sus argumentos no es de tipo Int`, () => {
      const ast = { node: op, expr1: elSiete, expr2: elTrue };
      assert.that(chequear(ast)).isFalse();
    });

    test(`expresion booleana ${op} es valida si sus dos argumentos son de tipo Int`, () => {
      const ast = { node: op, expr1: elSiete, expr2: elOcho };
      assert.that(chequear(ast)).isTrue();
    });
  });

  // llamados a procedimientos

  const miFuncionCeroParams = { node: 'StmtCall', id: 'miFuncion', expressions: [] };

  test('llamado a procedimiento es válido cuando la función existe, y retorna Unit', () => {
    const context = { locals: {}, functions: { 'miFuncion' : { node: 'Function', tipo: 'Unit' } } };
    assert.that(chequear(miFuncionCeroParams, context)).isTrue();
  });

  test('llamado a procedimiento no es válido cuando la función no existe', () => {
    assert.that(chequear(miFuncionCeroParams)).isFalse();
  });

  test('llamado a procedimiento no es válido cuando la función existe pero no devuelve Unit', () => {
    const context = { locals: {}, functions: { 'miFuncion' : { node: 'Function', tipo: 'Bool' } } };
    assert.that(chequear(miFuncionCeroParams, context)).isFalse();
  });

  const putCharDef = { node: 'Function', tipo: 'Unit', params: [{ node: 'Parameter', id: 'n', type: 'Int' }] };
  const putCharContext = { locals: '', functions: { putChar: putCharDef } };

  test('putChar() no es válida cuando el parámetro no es Int', () => {
    pending.dueTo('revisar');
    const ast = astBuilder.putChar(elTrue);
    assert.that(chequear(ast, putCharContext)).isFalse();
  });

  test('putChar() es válida cuando el parámetro es Int', () => {
    const ast = astBuilder.putChar(elOcho);
    assert.that(chequear(ast, putCharContext)).isTrue();
  });

  const putNumDef = { node: 'Function', tipo: 'Unit', params: [{ node: 'Parameter', id: 'n', type: 'Int' }] };
  const putNumContext = { locals: '', functions: { putNum: putNumDef } };

  test('putNum() no es válida cuando el parámetro no es Int', () => {
    pending.dueTo('revisar');
    const ast = astBuilder.putNum(elTrue);
    assert.that(chequear(ast, putNumContext)).isFalse();
  });

  test('putNum() es válida cuando el parámetro es Int', () => {
    const ast = astBuilder.putNum(elOcho);
    assert.that(chequear(ast, putNumContext)).isTrue();
  });

  // return

  test('return no es válido cuando su expresión no es válida', () => {
    const ret = { node: 'StmtReturn', expr: expresionInvalida };
    assert.that(chequear(ret)).isFalse();
  });

  test('return no es valido cuando el tipo de la expresión no coincide con el tipo de retorno de la función', () => {
    const context = { locals: {}, tipoFuncionActual: 'Bool' };
    const ret = { node: 'StmtReturn', expr: elOcho };
    assert.that(chequear(ret, context)).isFalse();
  });

  test('return es valido cuando el tipo de la expresión coincide con el tipo de retorno de la función', () => {
    const context = { locals: {}, tipoFuncionActual: 'Int' };
    const ret = { node: 'StmtReturn', expr: elOcho };
    assert.that(chequear(ret, context)).isTrue();
  });

  // armado de vector

  test('armado de vector no es válida si alguna de sus expresiones no devuelve Int', () => {
    const vecMake = { node: 'ExprVecMake', exprs: [elOcho, elTrue] };
    assert.that(chequear(vecMake)).isFalse();
  });

  test('armado de vector es válida si todas sus expresiones devuelven Int', () => {
    const vecMake = { node: 'ExprVecMake', exprs: [elOcho, elSiete] };
    assert.that(chequear(vecMake)).isTrue();
  });

  // longitud de un vector

  test('longitud de un vector no es válida si la variable no está definida', () => {
    const vecLength = { node: 'ExprVecLength', id: 'x' };
    assert.that(chequear(vecLength)).isFalse();
  });

  test('longitud de un vector no es válida si la variable está definida pero no es de tipo Vec', () => {
    const vecLength = { node: 'ExprVecLength', id: 'x' };
    const context = { locals: { 'x' : 'Bool' } };
    assert.that(chequear(vecLength, context)).isFalse();
  });

  test('longitud de un vector es válida si la variable es de tipo Vec', () => {
    const vecLength = { node: 'ExprVecLength', id: 'x' };
    const context = { locals: { 'x' : 'Vec' } };
    assert.that(chequear(vecLength, context)).isTrue();
  });

  // acceso a un vector

  test('acceso a un vector no es válida si el índice no es de tipo Int', () => {
    const vecDeref = { node: 'ExprVecDeref', id: 'x', expr: elTrue };
    const context = { locals: { 'x' : 'Vec' } };
    assert.that(chequear(vecDeref, context)).isFalse();
  });

  test('acceso a un vector no es válida si el vector no es de tipo Vec', () => {
    const vecDeref = { node: 'ExprVecDeref', id: 'x', expr: elOcho };
    const context = { locals: { 'x' : 'Int' } };
    assert.that(chequear(vecDeref, context)).isFalse();
  });

  test('acceso a un vector es válida si el índice es de tipo Int, y el vector de tipo Vec', () => {
    const vecDeref = { node: 'ExprVecDeref', id: 'x', expr: elOcho };
    const context = { locals: { 'x' : 'Vec' } };
    assert.that(chequear(vecDeref, context)).isTrue();
  });

  // asignación a vector

  test('asignación a vector no es válida si la variable no es de tipo Vec', () => {
    const vecAssign = { node: 'StmtVecAssign', id: 'x', expr1: elSiete, expr2: elOcho };
    const context = { locals: { 'x' : 'Bool' } };
    assert.that(chequear(vecAssign, context)).isFalse();
  });

  test('asignación a vector no es válida si el índice no es de tipo Int', () => {
    const vecAssign = { node: 'StmtVecAssign', id: 'x', expr1: elTrue, expr2: elOcho };
    const context = { locals: { 'x' : 'Vec' } };
    assert.that(chequear(vecAssign, context)).isFalse();
  });

  test('asignación a vector no es válida si la expresión no es de tipo Int', () => {
    const vecAssign = { node: 'StmtVecAssign', id: 'x', expr1: elSiete, expr2: elFalse };
    const context = { locals: { 'x' : 'Vec' } };
    assert.that(chequear(vecAssign, context)).isFalse();
  });

  test('asignación a vector es válida si cumple los tres requisitos', () => {
    const vecAssign = { node: 'StmtVecAssign', id: 'x', expr1: elSiete, expr2: elOcho };
    const context = { locals: { 'x' : 'Vec' } };
    assert.that(chequear(vecAssign, context)).isTrue();
  });

  // if

  test('if no es válido si la condición no es booleana', () => {
    const elIf = { node: 'StmtIf', expr: elOcho, block: emptyBlock };
    assert.that(chequear(elIf)).isFalse();
  });

  test('if es válido si la condición es booleana', () => {
    const elIf = { node: 'StmtIf', expr: elFalse, block: emptyBlock };
    assert.that(chequear(elIf)).isTrue();
  });

  // determinar el tipo de expresiones

  operadoresBooleanos.forEach(op => {
    test(`el tipo de un ${ op } es Bool`, () => {
      assert.that(typeChecker.determineTypeOf({ node: op })).isEqualTo('Bool');
    });
  });

  // determinar el tipo de llamados a funciones

  const miFuncionCall = { node: 'ExprCall', id: 'miFuncion' };

  test('retorna el tipo de retorno de la función que ya está en la tabla de funciones', () => {
    const context = { locals: {}, functions: { 'miFuncion' : { node: 'Function', tipo: 'Bool' } } };
    assert.that(typeChecker.determineTypeOf(miFuncionCall, context)).isEqualTo('Bool');
  });

  test('retorna undefined si la función no está en la tabla de funciones', () => {
    assert.that(typeChecker.determineTypeOf(miFuncionCall, {})).isUndefined();
  });
});
