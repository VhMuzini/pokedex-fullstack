import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PokemonService } from '../../core/services/pokemon.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { TypeBadgeComponent } from '../../shared/type-badge/type-badge.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { TranslatePipe } from '../../shared/translate.pipe';
import { MAX_STAT_VALUE, type PokemonDetail } from '../../core/models/pokemon.model';

const INITIAL_MOVES_SHOWN = 8;

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [RouterLink, TypeBadgeComponent, LoadingSpinnerComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.scss',
})
export class PokemonDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly pokemonService = inject(PokemonService);
  private readonly destroyRef = inject(DestroyRef);
  readonly favorites = inject(FavoritesService);

  readonly loading = signal(true);
  readonly errored = signal(false);
  readonly pokemon = signal<PokemonDetail | null>(null);
  readonly allMovesShown = signal(false);

  readonly maxStat = MAX_STAT_VALUE;
  readonly visibleMoves = computed(() => {
    const moves = this.pokemon()?.moves ?? [];
    return this.allMovesShown() ? moves : moves.slice(0, INITIAL_MOVES_SHOWN);
  });

  ngOnInit() {
    // Angular reaproveita a mesma instancia do componente ao navegar entre
    // rotas iguais com parametros diferentes (ex.: /pokemon/1 -> /pokemon/2),
    // entao ngOnInit so roda uma vez. Observar route.paramMap (em vez de ler
    // route.snapshot uma unica vez) garante que a busca dispare de novo a
    // cada troca de parametro, inclusive ao clicar num node da evolucao.
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const idOrName = params.get('idOrName');
      if (!idOrName) {
        this.errored.set(true);
        this.loading.set(false);
        return;
      }

      this.loading.set(true);
      this.errored.set(false);
      this.allMovesShown.set(false);

      this.pokemonService.detail(idOrName).subscribe({
        next: (data) => {
          this.pokemon.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.errored.set(true);
          this.loading.set(false);
        },
      });
    });
  }

  toggleFavorite() {
    const current = this.pokemon();
    if (!current) return;
    this.favorites.toggle({ id: current.id, name: current.name, sprite: current.sprite }).subscribe();
  }
}
