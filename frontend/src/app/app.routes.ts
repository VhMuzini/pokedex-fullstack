import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/pokemon-list/pokemon-list.component').then((m) => m.PokemonListComponent),
    title: 'Pokédex · Explorar',
  },
  {
    path: 'favoritos',
    loadComponent: () =>
      import('./features/favorites/favorites.component').then((m) => m.FavoritesComponent),
    title: 'Pokédex · Favoritos',
  },
  {
    path: 'pokemon/:idOrName',
    loadComponent: () =>
      import('./features/pokemon-detail/pokemon-detail.component').then(
        (m) => m.PokemonDetailComponent,
      ),
    title: 'Pokédex · Detalhe',
  },
  { path: '**', redirectTo: '' },
];
