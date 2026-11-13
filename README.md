# Proyect Storage

Librería Angular para gestionar LocalStorage y Cache Storage, con una aplicación Showcase independiente.

## Estructura

- `projects/storage-manager`: fuente de `@alejandrobarco01-coder/storage-manager`.
- `showcase`: aplicación Angular que usa exclusivamente la API pública del paquete.
- `documentation`: referencia generada con Compodoc.

## Preparación y calidad

Se requiere Node.js 20.19+ y npm.

```bash
npm install
npm test
npm run build
npm run docs
```

Las pruebas exigen 100 % en statements, branches, functions y lines. Si Karma no encuentra Google Chrome, instale Chrome/Chromium o indique un binario compatible. En macOS:

```bash
CHROME_BIN="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" npm test
```

La compilación se genera en `dist/storage-manager`; `npm run docs:serve` sirve la documentación estática de `documentation/`.

## Showcase

Como la primera publicación NPM sigue pendiente, el Showcase consume durante desarrollo el paquete compilado local (`file:../dist/storage-manager`), sin rutas internas ni código fuente de la librería.

```bash
npm run showcase:install
npm run showcase
```

Permite ejecutar guardado, consulta, listado y eliminación de LocalStorage; y apertura/listado/eliminación de cachés, descarga de recursos, guardado, consulta y eliminación de respuestas HTTP. Después de publicar, cambie su dependencia en `showcase/package.json` por `"@alejandrobarco01-coder/storage-manager": "^0.0.1"` y ejecute `npm install` en esa carpeta.

## Paquete y publicación

```bash
npm run package
npm run verify:package
```

`package` deja el tarball en `artifacts/`. `verify:package` lo instala e importa en un proyecto temporal independiente. Ninguno publica en NPM. La publicación debe coordinarse con el propietario de la cuenta. Consulte el [README de la librería](projects/storage-manager/README.md) para instalación, API y ejemplos.
