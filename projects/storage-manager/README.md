# @alejandrobarco01-coder/storage-manager

Librería Angular para administrar almacenamiento del navegador con una API tipada. Actualmente incluye el servicio de LocalStorage; el servicio de Cache Storage se integrará en la siguiente parte del proyecto.

## Instalación

Después de publicar el paquete en NPM, instálalo en una aplicación Angular:

```bash
npm install @alejandrobarco01-coder/storage-manager
```

## Uso de LocalStorageService

Inyecta `LocalStorageService` en el servicio o componente de tu aplicación. Los valores se guardan como JSON, por lo que se admiten valores primitivos, arreglos y objetos serializables.

```ts
import { LocalStorageService } from '@alejandrobarco01-coder/storage-manager';

export class PreferenciasService {
  constructor(private readonly almacenamiento: LocalStorageService) {}

  guardar(): void {
    this.almacenamiento.setItem('preferencias', { tema: 'oscuro' });
  }

  consultar(): { tema: string } | null {
    return this.almacenamiento.getItem<{ tema: string }>('preferencias');
  }

  existe(): boolean {
    return this.almacenamiento.hasItem('preferencias');
  }

  listarClaves(): string[] {
    return this.almacenamiento.keys();
  }

  eliminar(): void {
    this.almacenamiento.removeItem('preferencias');
  }
}
```

## API disponible

| Elemento | Descripción |
| --- | --- |
| `setItem<T>(clave, valor)` | Serializa y guarda un valor. |
| `getItem<T>(clave)` | Devuelve el valor tipado o `null` si no existe la clave. |
| `removeItem(clave)` | Elimina una clave existente. No falla si la clave no existe. |
| `hasItem(clave)` | Indica si existe la clave, incluso si contiene el valor JSON `null`. |
| `keys()` | Devuelve todas las claves del almacenamiento. |
| `LOCAL_STORAGE` | Token para inyectar o sustituir la implementación de `Storage`. |

Las claves deben tener al menos un carácter que no sea un espacio en blanco. `undefined` y los valores que JSON no puede serializar generan `StorageSerializationError`. Los errores de la API del navegador generan `StorageOperationError`. Si el entorno no ofrece LocalStorage, se genera `StorageUnavailableError`.

## Desarrollo de la librería

Desde la raíz del repositorio, ejecuta `npm install`, `npm test` y `npm run build`. La compilación genera el paquete en `dist/storage-manager`. Las pruebas están configuradas para exigir 100 % de cobertura en sentencias, ramas, funciones y líneas.

La documentación técnica completa se genera con `npm run docs` y se guarda en `documentation/`.
