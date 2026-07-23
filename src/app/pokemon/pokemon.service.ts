import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap, tap } from 'rxjs';
import { Pokemon, PokemonListResponse } from './pokemon.model';
import { CACHE_STRATEGY } from '../core/storage/storage-strategy';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CACHE_STRATEGY);

  getList(limit = 20, offset = 0): Observable<PokemonListResponse> {
    const key = `pokemon:list:${limit}:${offset}`;

    return this.cache.get<PokemonListResponse>(key).pipe(
      switchMap((cached) => {
        if (cached) {
          return of(cached);
        }

        return this.http.get<PokemonListResponse>(`/pokemon?limit=${limit}&offset=${offset}`).pipe(
          tap((response) => this.cache.set(key, response).subscribe())
        );
      })
    );
  }

  getByNameOrId(nameOrId: string | number): Observable<Pokemon> {
    const key = `pokemon:detail:${nameOrId}`;

    return this.cache.get<Pokemon>(key).pipe(
      switchMap((cached) => {
        if (cached) {
          return of(cached);
        }

        return this.http.get<Pokemon>(`/pokemon/${nameOrId}`).pipe(
          tap((pokemon) => this.cache.set(key, pokemon).subscribe())
        );
      })
    );
  }
}