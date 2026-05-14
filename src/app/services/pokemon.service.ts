import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PokemonDetalle, PokemonFavorito, PokemonListResponse } from '../interfaces/pokemon.interface';

@Injectable({ providedIn: 'root' })
export class PokemonService {

  private apiUrl = 'https://pokeapi.co/api/v2';
  private favoritosKey = 'pokemon_favoritos';

  constructor(private http: HttpClient) {}

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

  // ── FAVORITOS (localStorage) ─────────────────────────

  getFavoritos(): PokemonFavorito[] {
    const data = localStorage.getItem(this.favoritosKey);
    return data ? JSON.parse(data) : [];
  }

  esFavorito(id: number): boolean {
    return this.getFavoritos().some(f => f.id === id);
  }

  agregarFavorito(pokemon: PokemonDetalle, nota = ''): void {
    const favoritos = this.getFavoritos();
    if (this.esFavorito(pokemon.id)) return;

    const nuevo: PokemonFavorito = {
      id: pokemon.id,
      name: pokemon.name,
      imagen: pokemon.sprites.other['official-artwork'].front_default
           || pokemon.sprites.front_default,
      tipos: pokemon.types.map(t => t.type.name),
      nota,
      fechaAgregado: new Date().toLocaleDateString('es-CO')
    };

    favoritos.push(nuevo);
    localStorage.setItem(this.favoritosKey, JSON.stringify(favoritos));
  }

  actualizarNota(id: number, nota: string): void {
    const favoritos = this.getFavoritos().map(f =>
      f.id === id ? { ...f, nota } : f
    );
    localStorage.setItem(this.favoritosKey, JSON.stringify(favoritos));
  }

  eliminarFavorito(id: number): void {
    const favoritos = this.getFavoritos().filter(f => f.id !== id);
    localStorage.setItem(this.favoritosKey, JSON.stringify(favoritos));
  }
}