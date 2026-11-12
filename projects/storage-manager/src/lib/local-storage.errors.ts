/** Error lanzado cuando LocalStorage no está disponible en el entorno actual. */
export class StorageUnavailableError extends Error {
  /** Crea un error para indicar que el entorno no permite usar LocalStorage. */
  constructor() {
    super('LocalStorage no está disponible en este entorno.');
    this.name = 'StorageUnavailableError';
  }
}

/** Error lanzado cuando un valor no se puede codificar o decodificar como JSON. */
export class StorageSerializationError extends Error {
  /**
   * Crea un error para indicar que un valor no se pudo convertir desde o hacia JSON.
   * @param operation Indica si falló la serialización o la deserialización.
   * @param cause Error original producido por JSON, si existe.
   */
  constructor(operation: 'serialize' | 'deserialize', cause?: unknown) {
    const operationName = operation === 'serialize' ? 'serialización' : 'deserialización';
    super(`No se pudo realizar la operación de ${operationName} del valor de LocalStorage.`, { cause });
    this.name = 'StorageSerializationError';
  }
}

/** Error lanzado cuando falla una operación del navegador, por ejemplo por falta de cuota. */
export class StorageOperationError extends Error {
  /**
   * Crea un error para indicar que el navegador rechazó una operación de almacenamiento.
   * @param operation Operación de almacenamiento que falló.
   * @param cause Error original del navegador, si existe.
   */
  constructor(operation: 'set' | 'get' | 'remove' | 'keys' | 'has', cause?: unknown) {
    const operationName: Record<typeof operation, string> = {
      set: 'escritura',
      get: 'lectura',
      remove: 'eliminación',
      keys: 'consulta de claves',
      has: 'comprobación de existencia',
    };
    super(`Falló la operación de ${operationName[operation]} en LocalStorage.`, { cause });
    this.name = 'StorageOperationError';
  }
}
