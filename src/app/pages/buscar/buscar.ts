import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PokemonService } from '../../services/pokemon.service';
import { PokemonDetalle } from '../../interfaces/pokemon.interface';

@Component({
  selector: 'app-buscar',
  imports: [FormsModule, CommonModule],
  templateUrl: './buscar.html'
})
export class Buscar implements OnInit {

  termino = '';
  nota = '';
  pokemon?: PokemonDetalle;
  cargando = false;
  error = '';
  agregado = false;

  constructor(
    private service: PokemonService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.termino = params['q'];
        this.buscar();
      }
    });
  }

  buscar() {
    if (!this.termino.trim()) return;
    this.cargando = true;
    this.error = '';
    this.pokemon = undefined;
    this.agregado = false;

    this.service.getPokemon(this.termino).subscribe({
      next: (p) => {
        this.pokemon = p;
        this.service.esFavorito(p.id).then(es => {
          this.agregado = es;
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.error = `No se encontró "${this.termino}". Verifica el nombre.`;
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardarFavorito() {
    if (!this.pokemon) return;
    this.service.agregarFavorito(this.pokemon, this.nota).then(() => {
      this.agregado = true;
      this.nota = '';
      this.cdr.detectChanges();
    });
  }

  colorTipo(tipo: string): string {
    const colores: Record<string, string> = {
      fire: 'danger', water: 'primary', grass: 'success',
      electric: 'warning', ice: 'info', dark: 'dark',
      normal: 'secondary', fighting: 'danger', poison: 'success',
      ground: 'warning', flying: 'info', bug: 'success',
      rock: 'secondary', ghost: 'dark', steel: 'secondary'
    };
    return colores[tipo] || 'secondary';
  }
}