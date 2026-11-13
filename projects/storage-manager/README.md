# @alejandrobarco01-coder/storage-manager

Servicios Angular tipados para LocalStorage y Cache Storage. Se proporcionan en `root`, por lo que no requieren un módulo de configuración.

## Instalación

Después de publicar el paquete:

```bash
npm install @alejandrobarco01-coder/storage-manager
```

Importe siempre desde la API pública:

```ts
import { CacheStorageService, LocalStorageService } from '@alejandrobarco01-coder/storage-manager';
```

## LocalStorageService

`setItem<T>(key, value)` guarda JSON; `getItem<T>(key)` devuelve el valor o `null`; `removeItem(key)`, `hasItem(key)` y `keys()` eliminan, verifican y listan claves.

```ts
constructor(private readonly storage: LocalStorageService) {}

guardar(): void { this.storage.setItem('preferencias', { tema: 'oscuro' }); }
consultar(): { tema: string } | null { return this.storage.getItem<{ tema: string }>('preferencias'); }
```

Las claves vacías lanzan `TypeError`. `StorageSerializationError`, `StorageUnavailableError` y `StorageOperationError` distinguen JSON inválido, API inexistente y fallos nativos. `LOCAL_STORAGE` permite sustituir la implementación en pruebas.

## CacheStorageService

Todas las operaciones son asíncronas. `open(cacheName)` abre o crea una caché; `keys()` las lista; `has(cacheName)` la verifica; y `deleteCache(cacheName)` elimina una caché completa. Para recursos, `add(cacheName, request)` descarga y guarda, `put(cacheName, request, response)` almacena una respuesta, `match(cacheName, request, options?)` la consulta y `deleteEntry(cacheName, request, options?)` elimina el recurso.

```ts
constructor(private readonly caches: CacheStorageService) {}

async guardar(): Promise<void> {
  await this.caches.put('api-v1', '/api/profile', new Response('{"name":"Ada"}'));
}

buscar(): Promise<Response | undefined> {
  return this.caches.match('api-v1', '/api/profile');
}
```

Los nombres vacíos lanzan `TypeError`. `CacheStorageUnavailableError` indica que el navegador no ofrece la API y `CacheStorageOperationError` conserva la causa de un fallo nativo. `CACHE_STORAGE` permite inyectar una implementación alternativa.

## Desarrollo

Desde la raíz: `npm test`, `npm run build`, `npm run docs` y `npm run verify:package`. La documentación queda en `documentation/`; el paquete en `dist/storage-manager`. Karma requiere Chrome/Chromium o `CHROME_BIN` configurado.
