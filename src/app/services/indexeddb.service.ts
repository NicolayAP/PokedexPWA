import { Injectable } from '@angular/core';
import { PokemonFavorito } from '../interfaces/pokemon.interface';

@Injectable({ providedIn: 'root' })
export class IndexedDbService {

  private dbName = 'pokedex_db';
  private storeName = 'favoritos';
  private version = 1;
  private db: IDBDatabase | null = null;

  abrirDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('fechaAgregado', 'fechaAgregado', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  getFavoritos(): Promise<PokemonFavorito[]> {
    return this.abrirDB().then(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  }

  getFavoritoPorId(id: number): Promise<PokemonFavorito | undefined> {
    return this.abrirDB().then(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  }

  agregarFavorito(pokemon: PokemonFavorito): Promise<void> {
    return this.abrirDB().then(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const request = store.add(pokemon);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }

  actualizarNota(id: number, nota: string): Promise<void> {
    return this.abrirDB().then(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const getRequest = store.get(id);
        getRequest.onsuccess = () => {
          const fav = getRequest.result;
          if (fav) {
            fav.nota = nota;
            const putRequest = store.put(fav);
            putRequest.onsuccess = () => resolve();
            putRequest.onerror = () => reject(putRequest.error);
          } else {
            resolve();
          }
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    });
  }

  eliminarFavorito(id: number): Promise<void> {
    return this.abrirDB().then(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }
}