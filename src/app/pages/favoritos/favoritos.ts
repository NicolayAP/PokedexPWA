import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PokemonService } from '../../services/pokemon.service';
import { PokemonFavorito } from '../../interfaces/pokemon.interface';

@Component({
  selector: 'app-favoritos',
  imports: [FormsModule, CommonModule],
  templateUrl: './favoritos.html'
})
export class Favoritos implements OnInit {

  favoritos: PokemonFavorito[] = [];
  editandoId: number | null = null;
  notaEditada = '';

  constructor(
    private service: PokemonService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.service.getFavoritos().then(favs => {
      this.favoritos = favs;
      this.cdr.detectChanges();
    });
  }

  eliminar(id: number) {
    if (confirm('¿Eliminar este Pokémon de favoritos?')) {
      this.service.eliminarFavorito(id).then(() => this.cargar());
    }
  }

  iniciarEdicion(fav: PokemonFavorito) {
    this.editandoId = fav.id;
    this.notaEditada = fav.nota;
  }

  guardarEdicion(id: number) {
    this.service.actualizarNota(id, this.notaEditada).then(() => {
      this.editandoId = null;
      this.cargar();
    });
  }

  cancelarEdicion() { this.editandoId = null; }
}