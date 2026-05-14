import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PokemonService } from '../../services/pokemon.service';
import { PokemonResumen } from '../../interfaces/pokemon.interface';

@Component({
  selector: 'app-listado',
  imports: [RouterLink, CommonModule],
  templateUrl: './listado.html'
})
export class Listado implements OnInit {

  pokemons: PokemonResumen[] = [];
  total = 0;
  pagina = 0;
  porPagina = 20;
  cargando = false;

  constructor(
    private service: PokemonService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando = true;
    this.service.getListado(this.porPagina, this.pagina * this.porPagina)
      .subscribe({
        next: (res) => {
          this.pokemons = res.results;
          this.total = res.count;
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
  }

  anterior() { if (this.pagina > 0) { this.pagina--; this.cargar(); } }
  siguiente() { if ((this.pagina + 1) * this.porPagina < this.total) { this.pagina++; this.cargar(); } }

  idDesdUrl(url: string): number {
    const parts = url.split('/').filter(Boolean);
    return parseInt(parts[parts.length - 1]);
  }
}