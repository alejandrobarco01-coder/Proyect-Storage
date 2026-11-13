import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';
import { LOCAL_STORAGE, browserLocalStorageFactory } from './local-storage.token';
import {
  StorageOperationError,
  StorageSerializationError,
  StorageUnavailableError,
} from './local-storage.errors';

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, String(value));
  }
}

describe('LocalStorageService', () => {
  let storage: MemoryStorage;
  let service: LocalStorageService;

  beforeEach(() => {
    storage = new MemoryStorage();
    TestBed.configureTestingModule({ providers: [{ provide: LOCAL_STORAGE, useValue: storage }] });
    service = TestBed.inject(LocalStorageService);
  });

  it('round-trips strings, numbers, booleans, null and objects as JSON', () => {
    service.setItem('text', 'hello');
    service.setItem('number', 42);
    service.setItem('boolean', false);
    service.setItem('null', null);
    service.setItem('object', { name: 'Ada', tags: ['one', 'two'] });

    expect(service.getItem<string>('text')).toBe('hello');
    expect(service.getItem<number>('number')).toBe(42);
    expect(service.getItem<boolean>('boolean')).toBeFalse();
    expect(service.getItem<null>('null')).toBeNull();
    expect(service.getItem<{ name: string; tags: string[] }>('object')).toEqual({
      name: 'Ada',
      tags: ['one', 'two'],
    });
  });

  it('rejects undefined and values that JSON cannot serialize', () => {
    const circular: { self?: unknown } = {};
    circular.self = circular;

    expect(() => service.setItem('undefined', undefined)).toThrowError(StorageSerializationError);
    expect(() => service.setItem('circular', circular)).toThrowError(StorageSerializationError);
    expect(() => service.setItem('function', () => 'value')).toThrowError(StorageSerializationError);
  });

  it('returns null for a missing key and reports malformed stored JSON', () => {
    expect(service.getItem('missing')).toBeNull();
    storage.setItem('broken', '{');
    expect(() => service.getItem('broken')).toThrowError(StorageSerializationError);
  });

  it('removes keys and distinguishes a stored null from a missing key', () => {
    service.setItem('present-null', null);
    expect(service.hasItem('present-null')).toBeTrue();
    expect(service.hasItem('missing')).toBeFalse();

    service.removeItem('present-null');
    service.removeItem('missing');
    expect(service.hasItem('present-null')).toBeFalse();
  });

  it('lists all keys', () => {
    service.setItem('first', 1);
    service.setItem('second', 2);
    expect(service.keys()).toEqual(['first', 'second']);
  });

  it('skips an unexpected null key returned by the storage implementation', () => {
    const unusualStorage = { length: 1, key: () => null } as unknown as Storage;
    expect(new LocalStorageService(unusualStorage).keys()).toEqual([]);
  });

  it('rejects empty or whitespace-only keys on every key operation', () => {
    expect(() => service.setItem('', 1)).toThrowError(TypeError);
    expect(() => service.getItem('  ')).toThrowError(TypeError);
    expect(() => service.removeItem('')).toThrowError(TypeError);
    expect(() => service.hasItem(' ')).toThrowError(TypeError);
  });

  it('reports an unavailable storage provider', () => {
    const unavailable = new LocalStorageService(null);
    expect(() => unavailable.setItem('key', 1)).toThrowError(StorageUnavailableError);
    expect(() => unavailable.getItem('key')).toThrowError(StorageUnavailableError);
    expect(() => unavailable.removeItem('key')).toThrowError(StorageUnavailableError);
    expect(() => unavailable.hasItem('key')).toThrowError(StorageUnavailableError);
    expect(() => unavailable.keys()).toThrowError(StorageUnavailableError);
  });

  it('wraps browser storage failures with the operation name and original cause', () => {
    storage.setItem('existing', '1');
    spyOn(storage, 'setItem').and.throwError('quota exceeded');
    spyOn(storage, 'getItem').and.throwError('quota exceeded');
    spyOn(storage, 'removeItem').and.throwError('quota exceeded');
    spyOn(storage, 'key').and.throwError('quota exceeded');

    expect(() => service.setItem('key', 1)).toThrowError(StorageOperationError);
    expect(() => service.getItem('key')).toThrowError(StorageOperationError);
    expect(() => service.removeItem('key')).toThrowError(StorageOperationError);
    expect(() => service.hasItem('key')).toThrowError(StorageOperationError);
    expect(() => service.keys()).toThrowError(StorageOperationError);
  });

  it('safely resolves browser LocalStorage through the injection token factory', () => {
    expect(browserLocalStorageFactory()).toBe(globalThis.localStorage);
    expect(browserLocalStorageFactory(null)).toBeNull();
    expect(browserLocalStorageFactory({} as typeof globalThis)).toBeNull();
    const inaccessibleHost = Object.defineProperty({}, 'localStorage', {
      get: () => {
        throw new Error('access denied');
      },
    }) as typeof globalThis;
    expect(browserLocalStorageFactory(inaccessibleHost)).toBeNull();
  });
});
