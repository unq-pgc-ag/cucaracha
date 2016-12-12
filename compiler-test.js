var peg = require('pegjs');
var fs = require('fs');
var child_process = require('child_process')

var serializer = require('./lib/serializer');
var type_checker = require('./lib/type_checker');
var compiler = require('./lib/asm_compiler');

const ejemplos = [
  '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
  '11', '12', '13', '14', '15', '16', '17', '19', '20',
  '22', '23', '24', '25', '26', '27', '28', '29', '30',
  '31', '32', '33', '34', '35', '36', '37', '38'
  // TODO agregar mas a medida que van pasando
  // TODO exceden de registros: 18, 21, 39
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

            // parseo
            var ast = parser.parse(contenidoTestInput);
            console.log('Ejemplo #' + ejemplo + ': parseado correctamente');

            // chequeo estático
            // if (type_checker.validate(ast)) {
            //     console.log('Ejemplo #' + ejemplo + ': sin errores de tipos.');
            // } else {
            //     console.log('ERROR! Ejemplo #' + ejemplo + ' con errores de tipos.');
            // };

            // generación de código
            console.log('Ejemplo #' + ejemplo + ': compilando...');
            var instrucciones = compiler.compile(ast);

            // para ver el código intermedio
            // console.log(JSON.stringify(instrucciones, null, 2));

            var codigoCompilado = compiler.generateOutput(instrucciones);

            // para ver el código compilado
            // console.log('Ejemplo #' + ejemplo +  ': código compilado: ');
            // console.log(codigoCompilado);

            var prefijo = rutaBase + '/build/test' + ejemplo;
            var rutaDestino = prefijo + '.asm';

            fs.writeFile(rutaDestino, codigoCompilado, function(err) {
              if(err) { return console.log('No se pudo generar el archivo de salida: ' + err); }

              console.log('Ejemplo #' + ejemplo + ': Archivo .asm generado correctamente en ' + rutaDestino);

              child_process.exec('nasm -felf64 ' + rutaDestino,
                function (error, stdout, stderr) {
                  if (error) { return console.log('exec error: ' + error); }

                  console.log('Ejemplo #' + ejemplo + ': Archivo .o generado correctamente en ' + prefijo + '.o');

                  child_process.exec('gcc -o ' + prefijo + ' ' + prefijo + '.o',
                    function (error, stdout, stderr) {
                      if (error) { return console.log('exec error: ' + error); }

                      console.log('Ejemplo #' + ejemplo + ': Archivo ejecutable generado correctamente en ' + prefijo);

                      console.log('Ejemplo #' + ejemplo + ': Comienzo de la ejecución');
                      child_process.exec('./' + prefijo,
                        function (error, stdout, stderr) {
                          if (error) {
                            console.log('Ejemplo #' + ejemplo + ': Error en la ejecución: ' + error);
                          } else {
                            // chequear que el resultado sea correcto
                            var rutaTestExpected = rutaBase + '/test' + ejemplo + '.expected';

                            fs.readFile(rutaTestExpected, 'utf8', function (err, contenidoTestExpected) {
                                if (err) { return console.log('No se pudo cargar el resultado: ' + err); }

                                if (contenidoTestExpected === stdout) {
                                    console.log('Ejemplo #' + ejemplo + ': Pasó la prueba');
                                } else {
                                    console.log('Ejemplo #' + ejemplo + ': Falló la prueba');
                                    console.log('  > resultado esperado:');
                                    console.log(contenidoTestExpected);
                                    console.log('  > resultado obtenido:');
                                    console.log(stdout);
                                }
                            });
                          }
                          console.log('Ejemplo #' + ejemplo + ': Fin de la ejecución');
                      });
                  });
              });
            });
        });
    });
});
