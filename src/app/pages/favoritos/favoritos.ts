import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { PokemonService } from '../../services/pokemon.service';
import { PokemonFavorito } from '../../interfaces/pokemon.interface';

@Component({
  selector: 'app-favoritos',
  imports: [FormsModule, CommonModule, DatePipe],
  templateUrl: './favoritos.html'
})
export class Favoritos implements OnInit {

  favoritos: PokemonFavorito[] = [];
  editandoId: number | null = null;
  notaEditada = '';
  // FIX: Estado de error para mostrar al usuario si IndexedDB falla
  errorCarga = '';

  constructor(
    private service: PokemonService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.errorCarga = '';
    this.service.getFavoritos()
      .then(favs => {
        this.favoritos = favs;
        this.cdr.detectChanges();
      })
      .catch((err) => {
        // FIX: Capturar error de IndexedDB y mostrarlo en la UI
        this.errorCarga = `No se pudieron cargar los favoritos: ${err?.message || 'Error desconocido'}`;
        this.cdr.detectChanges();
      });
  }

  eliminar(id: number) {
    if (confirm('¿Eliminar este Pokémon de favoritos?')) {
      this.service.eliminarFavorito(id)
        .then(() => this.cargar())
        .catch((err) => {
          this.errorCarga = `Error al eliminar: ${err?.message || 'Error desconocido'}`;
          this.cdr.detectChanges();
        });
    }
  }

  iniciarEdicion(fav: PokemonFavorito) {
    this.editandoId = fav.id;
    this.notaEditada = fav.nota;
  }

  guardarEdicion(id: number) {
    this.service.actualizarNota(id, this.notaEditada)
      .then(() => {
        this.editandoId = null;
        this.cargar();
      })
      .catch((err) => {
        // FIX #4: Ahora este error llega aquí porque el servicio rechaza correctamente
        this.errorCarga = `Error al guardar la nota: ${err?.message || 'Error desconocido'}`;
        this.editandoId = null;
        this.cdr.detectChanges();
      });
  }

  cancelarEdicion() { this.editandoId = null; }

  // FIX #6: Método helper para formatear la fecha ISO a formato local legible
  formatearFecha(fechaISO: string): string {
    try {
      return new Date(fechaISO).toLocaleDateString('es-CO', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch {
      // Compatibilidad con favoritos guardados antes del fix (formato antiguo)
      return fechaISO;
    }
  }
}