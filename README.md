# Proyect Storage

Librería reutilizable para administrar almacenamiento en aplicaciones Angular mediante LocalStorage y Cache Storage. El repositorio también incluirá una aplicación Showcase independiente.

## Estructura

- `projects/storage-manager`: código fuente de la librería Angular.
- LocalStorage, API pública y pruebas unitarias: primera parte del trabajo.
- Cache Storage, pruebas correspondientes y aplicación Showcase: parte asignada al otro integrante.

## Requisitos

- Node.js
- npm

## Instalación y desarrollo

Desde la carpeta raíz del repositorio:

```bash
npm install
npm test
npm run build
```

Las pruebas comprueban el servicio de LocalStorage y exigen 100 % de cobertura en sentencias, ramas, funciones y líneas. El navegador Chrome debe estar instalado para ejecutar Karma.

La compilación de producción se genera en `dist/storage-manager`.

## Documentación técnica

Genera la documentación de la librería con Compodoc:

```bash
npm run docs
```

Los archivos estáticos quedan en `documentation/`. Para servirlos localmente:

```bash
npm run docs:serve
```

## LocalStorage

La API expone `LocalStorageService`, `LOCAL_STORAGE` y los errores específicos. El servicio guarda y recupera valores JSON tipados, elimina claves, comprueba su existencia y lista las claves almacenadas. Consulta el [README de la librería](projects/storage-manager/README.md) para ver ejemplos.

## Publicación

La librería se compila en formato Angular distribuible. Su publicación en NPM y la aplicación Showcase forman parte de la integración final del equipo.
