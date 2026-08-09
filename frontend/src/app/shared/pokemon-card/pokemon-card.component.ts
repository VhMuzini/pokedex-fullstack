import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TypeBadgeComponent } from '../type-badge/type-badge.component';
import { TranslatePipe } from '../translate.pipe';
import type { PokemonListItem } from '../../core/models/pokemon.model';

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [RouterLink, TypeBadgeComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card">
      <button
        type="button"
        class="fav"
        [class.fav--active]="isFavorite()"
        [attr.aria-label]="(isFavorite() ? 'card.favoriteRemove' : 'card.favoriteAdd') | translate"
        (click)="favoriteToggled.emit()"
      >
        ★
      </button>

      <a class="card__link" [routerLink]="['/pokemon', pokemon().id]" [attr.aria-label]="'card.viewDetails' | translate">
        <span class="stamp mono-tag">#{{ pokemon().id.toString().padStart(3, '0') }}</span>

        <div class="art">
          <img [src]="pokemon().sprite" [alt]="pokemon().name" loading="lazy" width="96" height="96" />
        </div>

        <h3 class="name">{{ pokemon().name }}</h3>

        <div class="types">
          @for (type of pokemon().types; track type) {
            <app-type-badge [type]="type" />
          }
        </div>
      </a>
    </article>
  `,
  styleUrl: './pokemon-card.component.scss',
})
export class PokemonCardComponent {
  pokemon = input.required<PokemonListItem>();
  isFavorite = input<boolean>(false);
  favoriteToggled = output<void>();
}
