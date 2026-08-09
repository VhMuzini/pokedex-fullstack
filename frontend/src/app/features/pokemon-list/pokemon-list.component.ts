import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, tap } from 'rxjs';
import { PokemonService } from '../../core/services/pokemon.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { PokemonCardComponent } from '../../shared/pokemon-card/pokemon-card.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { TranslatePipe } from '../../shared/translate.pipe';
import type { PokemonListItem, PokemonListResponse } from '../../core/models/pokemon.model';

const PAGE_SIZE = 24;

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [PokemonCardComponent, LoadingSpinnerComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.scss',
})
export class PokemonListComponent implements OnInit {
  private readonly pokemonService = inject(PokemonService);
  readonly favorites = inject(FavoritesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly response = signal<PokemonListResponse | null>(null);
  readonly types = signal<string[]>([]);
  readonly activeType = signal<string | null>(null);
  readonly page = signal(1);
  readonly searchTerm = signal('');

  private readonly search$ = new Subject<string>();

  ngOnInit() {
    this.pokemonService.types().subscribe({
      next: (res) => this.types.set(res.types),
      error: () => this.types.set([]),
    });

    this.search$
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        tap(() => this.page.set(1)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((term) => {
        this.searchTerm.set(term);
        this.fetchPage();
      });

    this.fetchPage();
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.search$.next(value);
  }

  selectType(type: string | null) {
    if (this.activeType() === type) return;
    this.activeType.set(type);
    this.page.set(1);
    this.fetchPage();
  }

  goToPage(next: number) {
    const total = this.response()?.totalPages ?? 1;
    const clamped = Math.min(Math.max(1, next), total);
    if (clamped === this.page()) return;
    this.page.set(clamped);
    this.fetchPage();
    document.getElementById('grid-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  toggleFavorite(pokemon: PokemonListItem) {
    this.favorites.toggle(pokemon).subscribe();
  }

  private fetchPage() {
    this.loading.set(true);
    this.pokemonService
      .list({
        page: this.page(),
        pageSize: PAGE_SIZE,
        search: this.searchTerm() || undefined,
        type: this.activeType() ?? undefined,
      })
      .subscribe({
        next: (res) => {
          this.response.set(res);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
