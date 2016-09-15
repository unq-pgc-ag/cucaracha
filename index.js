var peg = require('pegjs');
var fs = require('fs');

const ejemplos = [ '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];

fs.readFile('sintaxis', 'utf8', function (err, contenidoGramatica) {
    if (err) { return console.log('No se puede leer la sintaxis: ' + err); }
    var parser = peg.generate(contenidoGramatica);
    console.log('Gramatica generada correctamente!');

    ejemplos.forEach(function (ejemplo) {
        var rutaTestInput = 'tests/test' + ejemplo + '.input';
        var rutaTestExpected = 'tests/test' + ejemplo + '.expected';
        fs.readFile(rutaTestInput, 'utf8', function (err, contenidoTestInput) {
            if (err) { return console.log('No se pudo cargar el ejemplo: ' + err); }

            var ast = parser.parse(contenidoTestInput);
            console.log('Parseado correctamente!');
            console.log('AST generado:');
            // console.log(JSON.stringify(ast, null, 2));

            fs.readFile(rutaTestExpected, 'utf8', function (err, contenidoTestExpected) {
                if (err) { return console.log('No se pudo cargar el resultado: ' + err); }

                var resultado = ast.serialize();
                if (contenidoTestExpected === resultado) {
                    console.log(':-) Serialización del ejemplo ' + ejemplo + ' correcta.');
                } else {
                    console.log(':-( Serialización del ejemplo ' + ejemplo + ' fallida.');
                    console.log(resultado);
                }
            });
        });
    });
});
