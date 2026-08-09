import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { FavoriteEntry, PokemonListItem } from '../models/pokemon.model';
import { SKIP_ERROR_TOAST } from '../interceptors/error.interceptor';

const CLIENT_ID_KEY = 'pokedex.clientId';

function readOrCreateClientId(): string {
  const existing = localStorage.getItem(CLIENT_ID_KEY);
  if (existing) return existing;
  const generated = crypto.randomUUID();
  localStorage.setItem(CLIENT_ID_KEY, generated);
  return generated;
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/favorites`;
  private readonly clientId = readOrCreateClientId();

  private readonly _favorites = signal<FavoriteEntry[]>([]);
  readonly favorites = this._favorites.asReadonly();
  readonly count = computed(() => this._favorites().length);

  private get headers() {
    return { 'x-client-id': this.clientId };
  }

  load() {
    return this.http
      .get<{ favorites: FavoriteEntry[] }>(this.baseUrl, {
        headers: this.headers,
        context: new HttpContext().set(SKIP_ERROR_TOAST, true),
      })
      .pipe(tap((res) => this._favorites.set(res.favorites)));
  }

  isFavorite(id: number): boolean {
    return this._favorites().some((fav) => fav.id === id);
  }

  toggle(pokemon: Pick<PokemonListItem, 'id' | 'name' | 'sprite'>) {
    if (this.isFavorite(pokemon.id)) {
      return this.http
        .delete<{ favorites: FavoriteEntry[] }>(`${this.baseUrl}/${pokemon.id}`, { headers: this.headers })
        .pipe(tap((res) => this._favorites.set(res.favorites)));
    }
    return this.http
      .post<{ favorites: FavoriteEntry[] }>(
        this.baseUrl,
        { id: pokemon.id, name: pokemon.name, sprite: pokemon.sprite },
        { headers: this.headers },
      )
      .pipe(tap((res) => this._favorites.set(res.favorites)));
  }
}
