var peg = require('pegjs');
var fs = require('fs');

var ejemplos = [
    ['tests/test00.input', 'tests/test00.expected'],
    ['tests/test01.input', 'tests/test01.expected'],
    ['tests/test02.input', 'tests/test02.expected'],
    ['tests/test03.input', 'tests/test03.expected'],
    ['tests/test04.input', 'tests/test04.expected'],
    ['tests/test05.input', 'tests/test05.expected'],
    ['tests/test06.input', 'tests/test06.expected'],
    ['tests/test07.input', 'tests/test07.expected'],
    ['tests/test08.input', 'tests/test08.expected'],
    ['tests/test09.input', 'tests/test09.expected'],
    ['tests/test10.input', 'tests/test10.expected'],
];

fs.readFile('sintaxis', 'utf8', function (err, data) {
    if (err) { return console.log('No se puede leer la sintaxis: ' + err); }
    var parser = peg.generate(data);
    console.log('Gramatica generada correctamente!');

    ejemplos.forEach(function (ejemplo) {
        fs.readFile(ejemplo[0], 'utf8', function (err, data) {
            if (err) { return console.log('No se pudo cargar el ejemplo: ' + err); }

            console.log('Ejemplo cargado: ' + ejemplo[0]);
            var results = parser.parse(data);
            console.log('Parseado correctamente!');
            console.log('AST generado:');
            console.log(JSON.stringify(results, null, 2));
        });
    });
});
