import { TestBed } from '@angular/core/testing';
import { CacheStorageOperationError, CacheStorageUnavailableError } from './cache-storage.errors';
import { CacheStorageService } from './cache-storage.service';
import { browserCacheStorageFactory, CACHE_STORAGE } from './cache-storage.token';

class MemoryCache implements Cache {
  readonly requests: Request[] = [];
  private readonly responses = new Map<string, Response>();

  add = jasmine.createSpy('add').and.callFake(async (request: RequestInfo | URL): Promise<void> => {
    this.responses.set(this.key(request), new Response('recurso descargado'));
  });

  addAll = jasmine.createSpy('addAll').and.resolveTo();

  delete = jasmine
    .createSpy('delete')
    .and.callFake(async (request: RequestInfo | URL): Promise<boolean> =>
      this.responses.delete(this.key(request)),
    );

  keys = jasmine
    .createSpy('keys')
    .and.callFake(async (): Promise<ReadonlyArray<Request>> => this.requests);

  match = jasmine
    .createSpy('match')
    .and.callFake(async (request: RequestInfo | URL): Promise<Response | undefined> =>
      this.responses.get(this.key(request)),
    );

  matchAll = jasmine.createSpy('matchAll').and.resolveTo([]);

  put = jasmine
    .createSpy('put')
    .and.callFake(async (request: RequestInfo | URL, response: Response): Promise<void> => {
      this.responses.set(this.key(request), response);
    });

  private key(request: RequestInfo | URL): string {
    return typeof request === 'string' ? request : request.toString();
  }
}

class MemoryCacheStorage implements CacheStorage {
  readonly caches = new Map<string, MemoryCache>();

  delete = jasmine
    .createSpy('delete')
    .and.callFake(async (cacheName: string): Promise<boolean> => this.caches.delete(cacheName));

  has = jasmine
    .createSpy('has')
    .and.callFake(async (cacheName: string): Promise<boolean> => this.caches.has(cacheName));

  keys = jasmine
    .createSpy('keys')
    .and.callFake(async (): Promise<string[]> => [...this.caches.keys()]);

  match = jasmine.createSpy('match').and.resolveTo(undefined);

  open = jasmine.createSpy('open').and.callFake(async (cacheName: string): Promise<Cache> => {
    let cache = this.caches.get(cacheName);
    if (!cache) {
      cache = new MemoryCache();
      this.caches.set(cacheName, cache);
    }
    return cache;
  });
}

describe('CacheStorageService', () => {
  let cacheStorage: MemoryCacheStorage;
  let service: CacheStorageService;

  beforeEach(() => {
    cacheStorage = new MemoryCacheStorage();
    TestBed.configureTestingModule({
      providers: [{ provide: CACHE_STORAGE, useValue: cacheStorage }],
    });
    service = TestBed.inject(CacheStorageService);
  });

  it('opens, lists, verifies and deletes complete caches', async () => {
    const cache = await service.open('assets-v1');
    expect(cache).toEqual(jasmine.any(MemoryCache));
    expect(await service.keys()).toEqual(['assets-v1']);
    expect(await service.has('assets-v1')).toBeTrue();
    expect(await service.deleteCache('assets-v1')).toBeTrue();
    expect(await service.deleteCache('missing')).toBeFalse();
    expect(await service.has('assets-v1')).toBeFalse();
  });

  it('downloads resources and stores, finds and removes HTTP responses', async () => {
    await service.add('api-v1', '/assets/logo.svg');
    expect(await service.match('api-v1', '/assets/logo.svg')).toEqual(jasmine.any(Response));

    const response = new Response(JSON.stringify({ id: 7 }), {
      headers: { 'content-type': 'application/json' },
    });
    await service.put('api-v1', '/api/items/7', response);
    const cached = await service.match('api-v1', '/api/items/7', { ignoreSearch: true });
    expect(await cached?.json()).toEqual({ id: 7 });
    expect(await service.match('api-v1', '/missing')).toBeUndefined();
    expect(await service.deleteEntry('api-v1', '/api/items/7', { ignoreSearch: true })).toBeTrue();
    expect(await service.deleteEntry('api-v1', '/api/items/7')).toBeFalse();
  });

  it('rejects empty cache names for every operation that receives one', () => {
    const response = new Response('value');
    expect(() => service.open('')).toThrowError(TypeError);
    expect(() => service.has(' ')).toThrowError(TypeError);
    expect(() => service.deleteCache('')).toThrowError(TypeError);
    expect(() => service.add(' ', '/resource')).toThrowError(TypeError);
    expect(() => service.put('', '/resource', response)).toThrowError(TypeError);
    expect(() => service.match(' ', '/resource')).toThrowError(TypeError);
    expect(() => service.deleteEntry('', '/resource')).toThrowError(TypeError);
  });

  it('reports an unavailable Cache Storage provider', async () => {
    const unavailable = new CacheStorageService(null);
    await expectAsync(unavailable.open('cache')).toBeRejectedWithError(
      CacheStorageUnavailableError,
    );
    await expectAsync(unavailable.keys()).toBeRejectedWithError(CacheStorageUnavailableError);
    await expectAsync(unavailable.has('cache')).toBeRejectedWithError(CacheStorageUnavailableError);
    await expectAsync(unavailable.deleteCache('cache')).toBeRejectedWithError(
      CacheStorageUnavailableError,
    );
    await expectAsync(unavailable.add('cache', '/resource')).toBeRejectedWithError(
      CacheStorageUnavailableError,
    );
    await expectAsync(unavailable.put('cache', '/resource', new Response())).toBeRejectedWithError(
      CacheStorageUnavailableError,
    );
    await expectAsync(unavailable.match('cache', '/resource')).toBeRejectedWithError(
      CacheStorageUnavailableError,
    );
    await expectAsync(unavailable.deleteEntry('cache', '/resource')).toBeRejectedWithError(
      CacheStorageUnavailableError,
    );
  });

  it('wraps Cache Storage failures for each public operation', async () => {
    cacheStorage.open.and.rejectWith(new Error('open failed'));
    await expectAsync(service.open('cache')).toBeRejectedWithError(CacheStorageOperationError);
    await expectAsync(service.add('cache', '/resource')).toBeRejectedWithError(
      CacheStorageOperationError,
    );
    await expectAsync(service.put('cache', '/resource', new Response())).toBeRejectedWithError(
      CacheStorageOperationError,
    );
    await expectAsync(service.match('cache', '/resource')).toBeRejectedWithError(
      CacheStorageOperationError,
    );
    await expectAsync(service.deleteEntry('cache', '/resource')).toBeRejectedWithError(
      CacheStorageOperationError,
    );

    cacheStorage.keys.and.rejectWith(new Error('keys failed'));
    cacheStorage.has.and.rejectWith(new Error('has failed'));
    cacheStorage.delete.and.rejectWith(new Error('delete failed'));
    await expectAsync(service.keys()).toBeRejectedWithError(CacheStorageOperationError);
    await expectAsync(service.has('cache')).toBeRejectedWithError(CacheStorageOperationError);
    await expectAsync(service.deleteCache('cache')).toBeRejectedWithError(
      CacheStorageOperationError,
    );
  });

  it('safely resolves Cache Storage through the injection token factory', () => {
    expect(browserCacheStorageFactory()).toBe(globalThis.caches);
    expect(browserCacheStorageFactory(null)).toBeNull();
    expect(browserCacheStorageFactory({} as typeof globalThis)).toBeNull();
    const inaccessibleHost = Object.defineProperty({}, 'caches', {
      get: () => {
        throw new Error('access denied');
      },
    }) as typeof globalThis;
    expect(browserCacheStorageFactory(inaccessibleHost)).toBeNull();
  });
});
