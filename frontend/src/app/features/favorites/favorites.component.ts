import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '../../core/services/favorites.service';
import { PokemonCardComponent } from '../../shared/pokemon-card/pokemon-card.component';
import { TranslatePipe } from '../../shared/translate.pipe';
import type { PokemonListItem } from '../../core/models/pokemon.model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterLink, PokemonCardComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
})
export class FavoritesComponent {
  readonly favorites = inject(FavoritesService);

  readonly items = computed<PokemonListItem[]>(() =>
    this.favorites.favorites().map((fav) => ({ id: fav.id, name: fav.name, sprite: fav.sprite, types: [] })),
  );

  remove(pokemon: PokemonListItem) {
    this.favorites.toggle(pokemon).subscribe();
  }
}
