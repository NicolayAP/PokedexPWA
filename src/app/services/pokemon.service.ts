import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PokemonDetalle, PokemonFavorito, PokemonListResponse } from '../interfaces/pokemon.interface';
import { IndexedDbService } from './indexeddb.service';

@Injectable({ providedIn: 'root' })
export class PokemonService {

  private apiUrl = 'https://pokeapi.co/api/v2';

  constructor(
    private http: HttpClient,
    private idb: IndexedDbService
  ) {}

  // ── API ──────────────────────────────────────────────

  getListado(limit = 20, offset = 0) {
    return this.http.get<PokemonListResponse>(
      `${this.apiUrl}/pokemon?limit=${limit}&offset=${offset}`
    );
  }

  getPokemon(nombre: string) {
    return this.http.get<PokemonDetalle>(
      `${this.apiUrl}/pokemon/${nombre.toLowerCase().trim()}`
    );
  }

  // ── FAVORITOS (IndexedDB) ────────────────────────────

  getFavoritos(): Promise<PokemonFavorito[]> {
    return this.idb.getFavoritos();
  }

  esFavorito(id: number): Promise<boolean> {
    return this.idb.getFavoritoPorId(id).then(f => !!f);
  }

  agregarFavorito(pokemon: PokemonDetalle, nota = ''): Promise<void> {
    const nuevo: PokemonFavorito = {
      id: pokemon.id,
      name: pokemon.name,
      imagen: pokemon.sprites.other['official-artwork'].front_default
           || pokemon.sprites.front_default,
      tipos: pokemon.types.map(t => t.type.name),
      nota,
      // FIX #6: Guardar en ISO 8601 para consistencia entre navegadores.
      // Para mostrar en formato local, formatear en el componente o pipe.
      fechaAgregado: new Date().toISOString()
    };
    return this.idb.agregarFavorito(nuevo);
  }

  actualizarNota(id: number, nota: string): Promise<void> {
    return this.idb.actualizarNota(id, nota);
  }

  eliminarFavorito(id: number): Promise<void> {
    return this.idb.eliminarFavorito(id);
  }
}