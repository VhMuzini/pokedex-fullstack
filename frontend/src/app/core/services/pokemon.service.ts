import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { PokemonDetail, PokemonListResponse } from '../models/pokemon.model';

export interface ListPokemonParams {
  page: number;
  pageSize: number;
  search?: string;
  type?: string;
}

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/pokemon`;

  list(params: ListPokemonParams): Observable<PokemonListResponse> {
    let httpParams = new HttpParams().set('page', params.page).set('pageSize', params.pageSize);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.type) httpParams = httpParams.set('type', params.type);
    return this.http.get<PokemonListResponse>(this.baseUrl, { params: httpParams });
  }

  detail(idOrName: string | number): Observable<PokemonDetail> {
    return this.http.get<PokemonDetail>(`${this.baseUrl}/${idOrName}`);
  }

  types(): Observable<{ types: string[] }> {
    return this.http.get<{ types: string[] }>(`${this.baseUrl}/types`);
  }
}
