# Cucaracha

## Cómo ejecutarlo

### Prerequisitos

* Node.JS versión 6.5.0
* NPM versión 2.10.1
* Ejecutar `npm install` en la carpeta principal. Esto descargará `pegjs`, la herramienta que usamos para generar el parser.

### Ejecución

#### Tests de unidad

Instalar `jasmine` de manera global (`npm install -g jasmine`). Luego, ejecutar `jasmine` en la raíz del proyecto.

#### Script

El archivo `index.js` contiene un script de prueba que, para todos los ejemplos, hace lo siguiente:

* parsea para generar el AST
* serializa el AST y lo compara con el _expected_.
* realiza el chequeo estático

Tenemos los ejemplos provistos más otros agregados por nosotros que demuestran errores de tipado/chequeo estático.

Para ejecutar este test, sólo hace falta correr `npm start` desde la consola.
