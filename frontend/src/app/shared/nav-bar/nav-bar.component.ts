import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { TranslatePipe } from '../translate.pipe';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="nav">
      <div class="nav__inner container">
        <a routerLink="/" class="brand">
          <span class="brand__mark" aria-hidden="true"></span>
          <span class="brand__text mono-tag">{{ 'nav.brand' | translate }}</span>
        </a>

        <nav class="links">
          <a routerLink="/" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: true }">
            {{ 'nav.explore' | translate }}
          </a>
          <a routerLink="/favoritos" routerLinkActive="is-active" class="fav-link">
            {{ 'nav.favorites' | translate }}
            @if (favorites.count() > 0) {
              <span class="count mono-tag">{{ favorites.count() }}</span>
            }
          </a>
        </nav>

        <button
          type="button"
          class="lang"
          (click)="i18n.toggle()"
          [attr.aria-label]="'nav.langToggle' | translate"
        >
          {{ i18n.lang() === 'pt' ? 'EN' : 'PT' }}
        </button>
      </div>
    </header>
  `,
  styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent {
  readonly i18n = inject(I18nService);
  readonly favorites = inject(FavoritesService);
}
