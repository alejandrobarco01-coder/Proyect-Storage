# Proyect Storage

Angular workspace for a reusable browser storage library and its Showcase application.

## Current project split

- `projects/storage-manager`: shared library package.
- LocalStorage service, API exports, and unit tests: implemented in this workspace.
- Cache Storage service, its tests, and the independent Showcase: companion's assigned part.

## Development

Requirements: Node.js and npm.

```sh
npm install
npm test
npm run build
```

The unit-test configuration enforces 100% statement, branch, function, and line coverage. Test and build commands target the `storage-manager` library.

The build output is written to `dist/storage-manager`. NPM publication is intentionally left for the integration/publication part of the project.
