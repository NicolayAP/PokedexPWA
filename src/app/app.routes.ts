import { Routes } from '@angular/router';
import { Listado } from './pages/listado/listado';
import { Buscar } from './pages/buscar/buscar';
import { Favoritos } from './pages/favoritos/favoritos';

export const routes: Routes = [
  { path: 'listado', component: Listado },
  { path: 'buscar', component: Buscar },
  { path: 'favoritos', component: Favoritos },
  { path: '**', redirectTo: 'listado' }
];