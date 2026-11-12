import { Inject, Injectable } from '@angular/core';
import { StorageOperationError, StorageSerializationError, StorageUnavailableError } from './local-storage.errors';
import { LOCAL_STORAGE } from './local-storage.token';

/** Typed LocalStorage access with JSON serialization and explicit error handling. */
@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  constructor(@Inject(LOCAL_STORAGE) private readonly storage: Storage | null) {}

  /** Store a primitive or object under `key`. `undefined` cannot be represented in JSON. */
  setItem<T>(key: string, value: T): void {
    this.assertKey(key);
    if (value === undefined) {
      throw new StorageSerializationError('serialize');
    }

    let serialized: string | undefined;
    try {
      serialized = JSON.stringify(value);
    } catch (error) {
      throw new StorageSerializationError('serialize', error);
    }
    if (serialized === undefined) {
      throw new StorageSerializationError('serialize');
    }

    this.withStorage('set', (storage) => storage.setItem(key, serialized));
  }

  /** Return the decoded value, or `null` when the key is not present. */
  getItem<T>(key: string): T | null {
    this.assertKey(key);
    const serialized = this.withStorage('get', (storage) => storage.getItem(key));
    if (serialized === null) {
      return null;
    }

    try {
      return JSON.parse(serialized) as T;
    } catch (error) {
      throw new StorageSerializationError('deserialize', error);
    }
  }

  /** Remove a key if it exists. */
  removeItem(key: string): void {
    this.assertKey(key);
    this.withStorage('remove', (storage) => storage.removeItem(key));
  }

  /** Check whether a key exists, including keys whose stored value is JSON `null`. */
  hasItem(key: string): boolean {
    this.assertKey(key);
    return this.withStorage('has', (storage) => storage.getItem(key) !== null);
  }

  /** Return all keys currently stored in LocalStorage. */
  keys(): string[] {
    return this.withStorage('keys', (storage) => {
      const result: string[] = [];
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key !== null) {
          result.push(key);
        }
      }
      return result;
    });
  }

  private assertKey(key: string): void {
    if (typeof key !== 'string' || key.trim().length === 0) {
      throw new TypeError('A non-empty LocalStorage key is required.');
    }
  }

  private withStorage<T>(
    operation: 'set' | 'get' | 'remove' | 'keys' | 'has',
    action: (storage: Storage) => T,
  ): T {
    if (this.storage === null) {
      throw new StorageUnavailableError();
    }
    try {
      return action(this.storage);
    } catch (error) {
      throw new StorageOperationError(operation, error);
    }
  }
}
