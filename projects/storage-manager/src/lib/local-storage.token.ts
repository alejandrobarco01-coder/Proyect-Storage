import { InjectionToken } from '@angular/core';

/**
 * Resuelve LocalStorage de forma segura y permite importar la librería durante el renderizado del servidor.
 * @param host Objeto global del entorno; se puede sustituir para pruebas.
 * @returns La implementación de LocalStorage o `null` si no está disponible o el acceso está bloqueado.
 */
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

/** Token de inyección que se puede reemplazar por otra implementación de Storage. */
export const LOCAL_STORAGE = new InjectionToken<Storage | null>('LOCAL_STORAGE', {
  providedIn: 'root',
  factory: browserLocalStorageFactory,
});
