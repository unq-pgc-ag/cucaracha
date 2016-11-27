var peg = require('pegjs');
var fs = require('fs');
var serializer = require('./lib/serializer');
var type_checker = require('./lib/type_checker');

const ejemplos = [
  '00',
];

var rutaBase = 'spec/examples/compiler';

fs.readFile('lib/sintaxis', 'utf8', function (err, contenidoGramatica) {
    if (err) { return console.log('No se puede leer la sintaxis: ' + err); }
    var parser = peg.generate(contenidoGramatica);
    console.log('Gramatica generada correctamente!');

    ejemplos.forEach(function (ejemplo) {
        var rutaTestInput = rutaBase + '/test' + ejemplo + '.input';
        fs.readFile(rutaTestInput, 'utf8', function (err, contenidoTestInput) {
            if (err) { return console.log('No se pudo cargar el ejemplo: ' + err); }
            var ast = parser.parse(contenidoTestInput);
            console.log('Parseado correctamente!');
            if (type_checker.validate(ast)) {
                console.log(':-) Ejemplo ' + ejemplo + ' sin errores de tipos.');
            } else {
                console.log(':-( ERROR! Ejemplo ' + ejemplo + ' con errores de tipos.');
            };

        });
    });
});
