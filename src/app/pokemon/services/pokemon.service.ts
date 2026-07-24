import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap, tap } from 'rxjs';
import { EvolutionChainResponse, Pokemon, PokemonListResponse, PokemonSpecies, TypeDetail } from '../models/pokemon.model';
import { CACHE_STRATEGY } from '../../core/storage/storage-strategy';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CACHE_STRATEGY);

  public getList(limit = 20, offset = 0): Observable<PokemonListResponse> {
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

  public getByNameOrId(nameOrId: string | number): Observable<Pokemon> {
    const key = `pokemon:detail:${nameOrId}`;

    return this.cache.get<Pokemon>(key).pipe(
      switchMap((cached) => {
        if (cached) {
          return of(cached);
        }

        return this.http.get<Pokemon>(`/pokemon/${nameOrId}`).pipe(
          tap((pokemon) => {
            this.cache.set(`pokemon:detail:${pokemon.id}`, pokemon).subscribe();
            this.cache.set(`pokemon:detail:${pokemon.name}`, pokemon).subscribe();
          })
        );
      })
    );
  }

  public getSpecies(nameOrId: string | number): Observable<PokemonSpecies> {
    const key = `pokemon:species:${nameOrId}`;

    return this.cache.get<PokemonSpecies>(key).pipe(
      switchMap((cached) => {
        if (cached) {
          return of(cached);
        }

        return this.http.get<PokemonSpecies>(`/pokemon-species/${nameOrId}`).pipe(
          tap((species) => {
            this.cache.set(`pokemon:species:${species.id}`, species).subscribe();
            this.cache.set(`pokemon:species:${species.name}`, species).subscribe();
          })
        );
      })
    );
  }

  public getTypeDetail(name: string): Observable<TypeDetail> {
    const key = `pokemon:type:${name}`;

    return this.cache.get<TypeDetail>(key).pipe(
      switchMap((cached) => {
        if (cached) {
          return of(cached);
        }

        return this.http.get<TypeDetail>(`/type/${name}`).pipe(
          tap((typeDetail) => this.cache.set(key, typeDetail).subscribe())
        );
      })
    );
  }

  public getEvolutionChain(url: string): Observable<EvolutionChainResponse> {
    const key = `pokemon:evolution-chain:${url}`;

    return this.cache.get<EvolutionChainResponse>(key).pipe(
      switchMap((cached) => {
        if (cached) {
          return of(cached);
        }

        return this.http.get<EvolutionChainResponse>(url).pipe(
          tap((response) => this.cache.set(key, response).subscribe())
        );
      })
    );
  }
}