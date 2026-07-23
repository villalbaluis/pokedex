import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap, tap, map } from 'rxjs';
import { NamedAPIResourceList } from '../shared/models/named-api-resource.model';
import { Region, Pokedex } from './region.model';
import { CACHE_STRATEGY } from '../core/storage/storage-strategy';

@Injectable({
  providedIn: 'root',
})
export class RegionService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CACHE_STRATEGY);

  readonly selectedRegion = signal<string | null>(null);

  selectRegion(name: string | null): void {
    this.selectedRegion.set(name);
  }

  getRegions(): Observable<NamedAPIResourceList> {
    return this.http.get<NamedAPIResourceList>('/region?limit=30');
  }

  getPokemonNamesByRegion(regionName: string): Observable<string[]> {
    const key = `region:names:${regionName}`;

    return this.cache.get<string[]>(key).pipe(
      switchMap((cached) => {
        if (cached) {
          return of(cached);
        }

        return this.http.get<Region>(`/region/${regionName}`).pipe(
          switchMap((region) => {
            const pokedexUrl = region.pokedexes[0]?.url;
            return pokedexUrl ? this.http.get<Pokedex>(pokedexUrl) : of(null);
          }),
          map((pokedex) => (pokedex ? pokedex.pokemon_entries.map((entry) => entry.pokemon_species.name) : [])),
          tap((names) => this.cache.set(key, names).subscribe())
        );
      })
    );
  }
}