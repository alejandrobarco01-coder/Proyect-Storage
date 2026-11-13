import { InjectionToken } from '@angular/core';

/**
 * Resuelve Cache Storage de forma segura y permite usar la librería durante el renderizado del servidor.
 * @param host Objeto global del entorno; se puede sustituir para pruebas.
 * @returns La implementación de CacheStorage o `null` si el navegador no la ofrece o bloquea su acceso.
 */
export function browserCacheStorageFactory(
  host: typeof globalThis | null = globalThis,
): CacheStorage | null {
  if (host === null) {
    return null;
  }
  try {
    return 'caches' in host ? host.caches : null;
  } catch {
    return null;
  }
}

/** Token de inyección que permite sustituir Cache Storage por una implementación de prueba. */
export const CACHE_STORAGE = new InjectionToken<CacheStorage | null>('CACHE_STORAGE', {
  providedIn: 'root',
  factory: browserCacheStorageFactory,
});
