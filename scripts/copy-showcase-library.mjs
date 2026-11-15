import { cp, mkdir, rm } from 'node:fs/promises';

const source = new URL('../dist/storage-manager/', import.meta.url);
const destination = new URL('../showcase/vendor/storage-manager/', import.meta.url);

await rm(destination, { recursive: true, force: true });
await mkdir(new URL('../showcase/vendor/', import.meta.url), { recursive: true });
await cp(source, destination, { recursive: true });

console.log('Storage Manager copiada a showcase/vendor/storage-manager.');
