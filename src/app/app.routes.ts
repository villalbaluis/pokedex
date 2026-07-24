import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./pokemon/home/home').then(m => m.Home) },
    { path: 'pokemon/:id', loadComponent: () => import('./pokemon/pokemon-detail/pokemon-detail').then(m => m.PokemonDetail) },
];