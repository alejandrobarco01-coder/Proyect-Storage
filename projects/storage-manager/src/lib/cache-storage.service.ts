import { Inject, Injectable } from '@angular/core';
import { CacheStorageOperationError, CacheStorageUnavailableError } from './cache-storage.errors';
import { CACHE_STORAGE } from './cache-storage.token';

/** Operaciones internas que se convierten en errores tipados de Cache Storage. */
type CacheOperation =
  'open' | 'keys' | 'has' | 'deleteCache' | 'add' | 'put' | 'match' | 'deleteEntry';

/**
 * Servicio tipado para administrar recursos HTTP mediante la API Cache Storage del navegador.
 * Cada operación abre la caché indicada por nombre, por lo que el consumidor no debe conservar
 * referencias nativas a `Cache` entre llamadas.
 */
@Injectable({ providedIn: 'root' })
export class CacheStorageService {
  /**
   * Crea el servicio con la implementación de Cache Storage inyectada.
   * @param cacheStorage Implementación de CacheStorage; puede ser `null` fuera del navegador.
   */
  constructor(@Inject(CACHE_STORAGE) private readonly cacheStorage: CacheStorage | null) {}

  /**
   * Abre una caché existente o la crea si aún no existe.
   * @param cacheName Nombre no vacío de la caché.
   * @returns La caché nativa abierta.
   * @throws {TypeError} Si el nombre está vacío o contiene solo espacios.
   * @throws {CacheStorageUnavailableError} Si Cache Storage no está disponible.
   * @throws {CacheStorageOperationError} Si el navegador rechaza la operación.
   */
  open(cacheName: string): Promise<Cache> {
    this.assertCacheName(cacheName);
    return this.withCacheStorage('open', (storage) => storage.open(cacheName));
  }

  /**
   * Devuelve los nombres de todas las cachés del origen actual.
   * @returns Nombres de las cachés disponibles.
   * @throws {CacheStorageUnavailableError} Si Cache Storage no está disponible.
   * @throws {CacheStorageOperationError} Si el navegador rechaza la operación.
   */
  keys(): Promise<string[]> {
    return this.withCacheStorage('keys', (storage) => storage.keys());
  }

  /**
   * Comprueba si existe una caché con el nombre indicado.
   * @param cacheName Nombre no vacío de la caché.
   * @returns `true` si la caché existe; de lo contrario, `false`.
   */
  has(cacheName: string): Promise<boolean> {
    this.assertCacheName(cacheName);
    return this.withCacheStorage('has', (storage) => storage.has(cacheName));
  }

  /**
   * Elimina una caché completa y todos sus recursos.
   * @param cacheName Nombre no vacío de la caché.
   * @returns `true` si la caché existía y se eliminó; de lo contrario, `false`.
   */
  deleteCache(cacheName: string): Promise<boolean> {
    this.assertCacheName(cacheName);
    return this.withCacheStorage('deleteCache', (storage) => storage.delete(cacheName));
  }

  /**
   * Descarga y guarda un recurso HTTP en la caché indicada.
   * @param cacheName Nombre no vacío de la caché.
   * @param request URL o solicitud del recurso que se debe descargar y almacenar.
   */
  add(cacheName: string, request: RequestInfo | URL): Promise<void> {
    this.assertCacheName(cacheName);
    return this.withCache(cacheName, 'add', (cache) => cache.add(request));
  }

  /**
   * Guarda una respuesta HTTP ya disponible bajo una solicitud o URL.
   * @param cacheName Nombre no vacío de la caché.
   * @param request URL o solicitud asociada a la respuesta.
   * @param response Respuesta HTTP que se guardará.
   */
  put(cacheName: string, request: RequestInfo | URL, response: Response): Promise<void> {
    this.assertCacheName(cacheName);
    return this.withCache(cacheName, 'put', (cache) => cache.put(request, response));
  }

  /**
   * Busca una respuesta almacenada en una caché.
   * @param cacheName Nombre no vacío de la caché.
   * @param request URL o solicitud que se desea consultar.
   * @param options Opciones de coincidencia admitidas por el navegador.
   * @returns La respuesta encontrada o `undefined` si no existe.
   */
  match(
    cacheName: string,
    request: RequestInfo | URL,
    options?: CacheQueryOptions,
  ): Promise<Response | undefined> {
    this.assertCacheName(cacheName);
    return this.withCache(cacheName, 'match', (cache) => cache.match(request, options));
  }

  /**
   * Elimina un recurso de una caché, sin eliminar la caché completa.
   * @param cacheName Nombre no vacío de la caché.
   * @param request URL o solicitud del recurso que se desea eliminar.
   * @param options Opciones de coincidencia admitidas por el navegador.
   * @returns `true` si se eliminó un recurso; de lo contrario, `false`.
   */
  deleteEntry(
    cacheName: string,
    request: RequestInfo | URL,
    options?: CacheQueryOptions,
  ): Promise<boolean> {
    this.assertCacheName(cacheName);
    return this.withCache(cacheName, 'deleteEntry', (cache) => cache.delete(request, options));
  }

  /** Valida que una caché tenga un nombre útil antes de acceder a la API del navegador. */
  private assertCacheName(cacheName: string): void {
    if (typeof cacheName !== 'string' || cacheName.trim().length === 0) {
      throw new TypeError('El nombre de la caché debe contener al menos un carácter no vacío.');
    }
  }

  /** Abre una caché y ejecuta una operación sobre ella, convirtiendo errores nativos en errores tipados. */
  private withCache<T>(
    cacheName: string,
    operation: Exclude<CacheOperation, 'open' | 'keys' | 'has' | 'deleteCache'>,
    action: (cache: Cache) => Promise<T>,
  ): Promise<T> {
    return this.withCacheStorage(operation, async (storage) =>
      action(await storage.open(cacheName)),
    );
  }

  /** Ejecuta una operación y convierte los errores nativos en errores tipados de la librería. */
  private async withCacheStorage<T>(
    operation: CacheOperation,
    action: (storage: CacheStorage) => Promise<T>,
  ): Promise<T> {
    if (this.cacheStorage === null) {
      throw new CacheStorageUnavailableError();
    }
    try {
      return await action(this.cacheStorage);
    } catch (error) {
      throw new CacheStorageOperationError(operation, error);
    }
  }
}
