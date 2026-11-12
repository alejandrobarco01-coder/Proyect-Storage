import { Inject, Injectable } from '@angular/core';
import { StorageOperationError, StorageSerializationError, StorageUnavailableError } from './local-storage.errors';
import { LOCAL_STORAGE } from './local-storage.token';

/**
 * Servicio para acceder a LocalStorage con tipos y serialización JSON.
 * Los errores del navegador se exponen mediante clases específicas para distinguir
 * fallos de serialización, disponibilidad y operaciones de almacenamiento.
 */
@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  /**
   * Crea el servicio con la implementación de almacenamiento inyectada.
   * @param storage Implementación de Storage; puede ser `null` si el navegador no la ofrece.
   */
  constructor(@Inject(LOCAL_STORAGE) private readonly storage: Storage | null) {}

  /**
   * Guarda un valor primitivo u objeto bajo la clave indicada.
   * El valor se serializa como JSON antes de almacenarse.
   * @param key Clave no vacía para el valor.
   * @param value Valor compatible con la serialización JSON.
   * @throws {TypeError} Si la clave está vacía o contiene solo espacios.
   * @throws {StorageSerializationError} Si el valor no puede serializarse como JSON.
   * @throws {StorageUnavailableError} Si LocalStorage no está disponible.
   * @throws {StorageOperationError} Si el navegador rechaza la escritura.
   */
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

  /**
   * Consulta un valor y lo convierte desde JSON al tipo indicado.
   * @param key Clave que se desea consultar.
   * @returns El valor guardado o `null` si la clave no existe.
   * @throws {TypeError} Si la clave está vacía o contiene solo espacios.
   * @throws {StorageSerializationError} Si el contenido guardado no es JSON válido.
   * @throws {StorageUnavailableError} Si LocalStorage no está disponible.
   * @throws {StorageOperationError} Si el navegador rechaza la lectura.
   */
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

  /**
   * Elimina una clave; no produce error si no existía.
   * @param key Clave que se desea eliminar.
   * @throws {TypeError} Si la clave está vacía o contiene solo espacios.
   * @throws {StorageUnavailableError} Si LocalStorage no está disponible.
   * @throws {StorageOperationError} Si el navegador rechaza la eliminación.
   */
  removeItem(key: string): void {
    this.assertKey(key);
    this.withStorage('remove', (storage) => storage.removeItem(key));
  }

  /**
   * Comprueba si existe una clave, incluso si su valor guardado es JSON `null`.
   * @param key Clave que se desea comprobar.
   * @returns `true` si existe; en caso contrario, `false`.
   * @throws {TypeError} Si la clave está vacía o contiene solo espacios.
   * @throws {StorageUnavailableError} Si LocalStorage no está disponible.
   * @throws {StorageOperationError} Si el navegador rechaza la consulta.
   */
  hasItem(key: string): boolean {
    this.assertKey(key);
    return this.withStorage('has', (storage) => storage.getItem(key) !== null);
  }

  /**
   * Obtiene todas las claves actualmente guardadas en LocalStorage.
   * @returns Lista de claves en el orden expuesto por el navegador.
   * @throws {StorageUnavailableError} Si LocalStorage no está disponible.
   * @throws {StorageOperationError} Si el navegador rechaza la consulta.
   */
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

  /** Valida que una clave tenga contenido antes de llamar a la API del navegador.
   * @param key Clave que se va a validar.
   * @throws {TypeError} Si la clave está vacía o contiene solo espacios.
   */
  private assertKey(key: string): void {
    if (typeof key !== 'string' || key.trim().length === 0) {
      throw new TypeError('La clave de LocalStorage debe contener al menos un carácter no vacío.');
    }
  }

  /** Ejecuta una operación y convierte los errores nativos en errores tipados de la librería.
   * @param operation Nombre de la operación para incluirlo en el error tipado.
   * @param action Función que realiza la llamada a Storage.
   * @returns El resultado de la operación.
   * @throws {StorageUnavailableError} Si no se inyectó una implementación de Storage.
   * @throws {StorageOperationError} Si la operación del navegador falla.
   */
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
