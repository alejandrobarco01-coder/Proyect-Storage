import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CacheStorageService, LocalStorageService } from '@alejandrobarco01-coder/storage-manager';

/** Aplicación independiente para demostrar exclusivamente la API pública de la librería. */
@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private readonly localStorage = inject(LocalStorageService);
  private readonly cacheStorage = inject(CacheStorageService);

  localKey = 'preferencias';
  localValue = '{"tema":"oscuro"}';
  cacheName = 'showcase-v1';
  resourceUrl = '/ejemplo.json';
  responseBody = '{"mensaje":"Respuesta guardada desde el Showcase"}';
  readonly localResult = signal('');
  readonly cacheResult = signal('');
  readonly cacheNames = signal<string[]>([]);

  saveLocal(): void {
    this.executeLocal(() => {
      this.localStorage.setItem(this.localKey, JSON.parse(this.localValue) as unknown);
      return 'Valor guardado.';
    });
  }

  readLocal(): void {
    this.executeLocal(
      () => `Resultado: ${JSON.stringify(this.localStorage.getItem(this.localKey))}`,
    );
  }

  removeLocal(): void {
    this.executeLocal(() => {
      this.localStorage.removeItem(this.localKey);
      return 'Clave eliminada.';
    });
  }

  listLocal(): void {
    this.executeLocal(() => `Claves: ${this.localStorage.keys().join(', ') || '(ninguna)'}`);
  }

  async openCache(): Promise<void> {
    await this.executeCache(async () => {
      await this.cacheStorage.open(this.cacheName);
      await this.refreshCaches();
      return 'Caché abierta.';
    });
  }

  async saveResponse(): Promise<void> {
    await this.executeCache(async () => {
      await this.cacheStorage.put(
        this.cacheName,
        this.resourceUrl,
        new Response(this.responseBody, { headers: { 'content-type': 'application/json' } }),
      );
      return 'Respuesta HTTP guardada.';
    });
  }

  async addResource(): Promise<void> {
    await this.executeCache(async () => {
      await this.cacheStorage.add(this.cacheName, this.resourceUrl);
      return 'Recurso descargado y guardado.';
    });
  }

  async findResponse(): Promise<void> {
    await this.executeCache(async () => {
      const response = await this.cacheStorage.match(this.cacheName, this.resourceUrl);
      return response
        ? `Respuesta: ${await response.clone().text()}`
        : 'No se encontró el recurso.';
    });
  }

  async removeResource(): Promise<void> {
    await this.executeCache(async () =>
      (await this.cacheStorage.deleteEntry(this.cacheName, this.resourceUrl))
        ? 'Recurso eliminado.'
        : 'No había recurso que eliminar.',
    );
  }

  async removeCache(): Promise<void> {
    await this.executeCache(async () => {
      const deleted = await this.cacheStorage.deleteCache(this.cacheName);
      await this.refreshCaches();
      return deleted ? 'Caché completa eliminada.' : 'La caché no existía.';
    });
  }

  async refreshCaches(): Promise<void> {
    await this.executeCache(async () => {
      const names = await this.cacheStorage.keys();
      this.cacheNames.set(names);
      return `Cachés: ${names.join(', ') || '(ninguna)'}`;
    });
  }

  private executeLocal(action: () => string): void {
    try {
      this.localResult.set(action());
    } catch (error) {
      this.localResult.set(this.message(error));
    }
  }

  private async executeCache(action: () => Promise<string>): Promise<void> {
    try {
      this.cacheResult.set(await action());
    } catch (error) {
      this.cacheResult.set(this.message(error));
    }
  }

  private message(error: unknown): string {
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}
