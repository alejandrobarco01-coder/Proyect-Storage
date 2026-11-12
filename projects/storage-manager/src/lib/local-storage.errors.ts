/** The browser does not expose LocalStorage in the current execution context. */
export class StorageUnavailableError extends Error {
  constructor() {
    super('LocalStorage is not available in this environment.');
    this.name = 'StorageUnavailableError';
  }
}

/** A value could not be encoded or decoded using JSON. */
export class StorageSerializationError extends Error {
  constructor(operation: 'serialize' | 'deserialize', cause?: unknown) {
    super(`Unable to ${operation} a LocalStorage value.`, { cause });
    this.name = 'StorageSerializationError';
  }
}

/** A browser storage operation failed, for example because of a quota limit. */
export class StorageOperationError extends Error {
  constructor(operation: 'set' | 'get' | 'remove' | 'keys' | 'has', cause?: unknown) {
    super(`LocalStorage ${operation} operation failed.`, { cause });
    this.name = 'StorageOperationError';
  }
}
