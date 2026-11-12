import { InjectionToken } from '@angular/core';

/** Resolve LocalStorage safely so importing the library during server rendering is supported. */
export function browserLocalStorageFactory(host: typeof globalThis | null = globalThis): Storage | null {
  if (host === null) {
    return null;
  }
  try {
    return 'localStorage' in host ? host.localStorage : null;
  } catch {
    return null;
  }
}

/** Injection token that can be replaced with a storage implementation in tests or applications. */
export const LOCAL_STORAGE = new InjectionToken<Storage | null>('LOCAL_STORAGE', {
  providedIn: 'root',
  factory: browserLocalStorageFactory,
});
