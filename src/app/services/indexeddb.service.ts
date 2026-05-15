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
      // Si ya hay una conexión abierta y válida, reutilizarla
      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);

      // FIX #3: Manejar onblocked para evitar que la app se congele
      // cuando otra pestaña tiene la DB abierta en una versión anterior.
      request.onblocked = () => {
        reject(new Error('La base de datos está bloqueada por otra pestaña. Ciérrala y recarga.'));
      };

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

        // FIX #2: Escuchar onversionchange para invalidar el caché de this.db
        // si otra pestaña abre una versión más nueva de la DB.
        this.db.onversionchange = () => {
          this.db?.close();
          this.db = null;
          console.warn('La base de datos fue actualizada en otra pestaña. Recarga la página.');
        };

        // FIX #2: Limpiar la referencia si la conexión se cierra inesperadamente
        this.db.onclose = () => {
          this.db = null;
        };

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

        // FIX #5: Usar put() en lugar de add() para evitar ConstraintError
        // si el Pokémon ya existe. put() actúa como upsert (insert o update).
        store.put(pokemon);

        // FIX #1: Resolver en tx.oncomplete, no en request.onsuccess.
        // oncomplete garantiza que los datos fueron confirmados en disco.
        tx.oncomplete = () => resolve();
        tx.onerror   = () => reject(tx.error);
        tx.onabort   = () => reject(new Error('Transacción abortada al agregar favorito'));
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

          // FIX #4: Rechazar si el registro no existe en lugar de resolver silenciosamente
          if (!fav) {
            tx.abort();
            reject(new Error(`No se encontró el favorito con id ${id}`));
            return;
          }

          fav.nota = nota;
          store.put(fav);
        };

        getRequest.onerror = () => reject(getRequest.error);

        // FIX #1: Confirmar en oncomplete
        tx.oncomplete = () => resolve();
        tx.onerror    = () => reject(tx.error);
        tx.onabort    = () => reject(new Error('Transacción abortada al actualizar nota'));
      });
    });
  }

  eliminarFavorito(id: number): Promise<void> {
    return this.abrirDB().then(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        store.delete(id);

        // FIX #1: Confirmar en oncomplete
        tx.oncomplete = () => resolve();
        tx.onerror    = () => reject(tx.error);
        tx.onabort    = () => reject(new Error('Transacción abortada al eliminar favorito'));
      });
    });
  }
}