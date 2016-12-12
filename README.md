# Cucaracha

## Cómo ejecutarlo

### Prerequisitos

* Node.JS versión 6.5.0
* NPM versión 2.10.1
* Ejecutar `npm install` en la carpeta principal. Esto descargará `pegjs`, la herramienta que usamos para generar el parser.

### Ejecución

#### Tests de unidad

Instalar `jasmine` de manera global (`npm install -g jasmine`). Luego, ejecutar `jasmine` en la raíz del proyecto. O también se puede ejecutar `npm test`.

#### Scripts

##### Para parseo

El archivo `parser-test.js` contiene un script de prueba que, para todos los ejemplos, hace lo siguiente:

* parsea para generar el AST
* serializa el AST y lo compara con el _expected_.
* realiza el chequeo estático

Tenemos los ejemplos provistos más otros agregados por nosotros que demuestran errores de tipado/chequeo estático.

Para ejecutar este test, sólo hace falta correr `npm run parser-test` desde la consola.

##### Para compilación

El archivo `compiler-test.js` contiene un script de prueba que, para algunos de los ejemplos, hace lo siguiente:

* parsea para generar el AST
* serializa el AST
* realiza el chequeo estático
* compila y genera el archivo de salida

Para ejecutar este test, sólo hace falta correr `npm run compiler-test` desde la consola. En la carpeta `spec/examples/compiler/build` se ubicará cada uno de los ejemplos compilados.

Para ver sólo los resultados de cada prueba de manera ordenada, se puede hacer `npm run compiler-test | grep prueba | sort -k 2,2`.
