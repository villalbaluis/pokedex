import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap, tap, map } from 'rxjs';
import { NamedAPIResourceList } from '../models/named-api-resource.model';
import { Region, Pokedex } from '../models/region.model';
import { CACHE_STRATEGY } from '../../core/storage/storage-strategy';

export const ALL_REGIONS_KEY = '__all__';

@Injectable({
  providedIn: 'root',
})

export class RegionService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CACHE_STRATEGY);
  private readonly visibleCounts = new Map<string, number>();
  public readonly selectedRegion = signal<string | null>(null);

  public selectRegion(name: string | null): void {
    this.selectedRegion.set(name);
  }

  public getRegions(): Observable<NamedAPIResourceList> {
    const key = 'region:list';

    return this.cache.get<NamedAPIResourceList>(key).pipe(
      switchMap((cached) => {
        if (cached) {
          return of(cached);
        }

        return this.http.get<NamedAPIResourceList>('/region?limit=30').pipe(
          tap((response) => this.cache.set(key, response).subscribe())
        );
      })
    );
  }

  public getPokemonNamesByRegion(regionName: string): Observable<string[]> {
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

  public getVisibleCount(key: string, defaultValue: number): number {
    return this.visibleCounts.get(key) ?? defaultValue;
  }

  public setVisibleCount(key: string, count: number): void {
    this.visibleCounts.set(key, count);
  }
}