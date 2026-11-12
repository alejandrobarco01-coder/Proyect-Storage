## @alejandrobarco01-coder/storage-manager

Angular storage utilities. The LocalStorage service is implemented; the Cache Storage API and Showcase are reserved for the companion's part of the project.

### LocalStorageService

Inject `LocalStorageService` to save JSON-serializable values and retrieve them with a type of your choice:

```ts
import { LocalStorageService } from '@alejandrobarco01-coder/storage-manager';

constructor(private readonly storage: LocalStorageService) {}

savePreferences(): void {
  this.storage.setItem('preferences', { theme: 'dark' });
}

readPreferences(): { theme: string } | null {
  return this.storage.getItem<{ theme: string }>('preferences');
}

removePreferences(): void {
  this.storage.removeItem('preferences');
}
```

The service also provides `hasItem(key)` and `keys()`. Missing keys return `null`. Values are serialized as JSON, so `undefined` and values that JSON cannot encode raise `StorageSerializationError`. Browser API failures raise `StorageOperationError`; server-side contexts without LocalStorage raise `StorageUnavailableError`. Keys must contain at least one non-whitespace character.

`LOCAL_STORAGE` is an injection token that can be replaced with a custom `Storage` implementation. The default provider resolves the browser's LocalStorage safely and returns `null` when the API is unavailable.

### Build and tests

Run `npm install`, `npm run build`, and `npm test`. The test configuration requires 100% statement, branch, function, and line coverage for the library.
