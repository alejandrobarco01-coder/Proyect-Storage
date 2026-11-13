/** Error lanzado cuando Cache Storage no está disponible en el entorno actual. */
export class CacheStorageUnavailableError extends Error {
  /** Crea un error para indicar que el navegador no ofrece la API Cache Storage. */
  constructor() {
    super('Cache Storage no está disponible en este entorno.');
    this.name = 'CacheStorageUnavailableError';
  }
}

/** Error lanzado cuando el navegador rechaza una operación de Cache Storage. */
export class CacheStorageOperationError extends Error {
  /**
   * Crea un error tipado que conserva la causa original del navegador.
   * @param operation Operación de Cache Storage que falló.
   * @param cause Error original producido por el navegador, si existe.
   */
  constructor(
    operation: 'open' | 'keys' | 'has' | 'deleteCache' | 'add' | 'put' | 'match' | 'deleteEntry',
    cause?: unknown,
  ) {
    const operationName: Record<typeof operation, string> = {
      open: 'apertura de caché',
      keys: 'consulta de cachés',
      has: 'comprobación de caché',
      deleteCache: 'eliminación de caché',
      add: 'almacenamiento de recurso',
      put: 'almacenamiento de respuesta',
      match: 'consulta de recurso',
      deleteEntry: 'eliminación de recurso',
    };
    super(`Falló la operación de ${operationName[operation]} en Cache Storage.`, { cause });
    this.name = 'CacheStorageOperationError';
  }
}
