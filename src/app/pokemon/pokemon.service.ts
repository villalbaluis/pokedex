import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pokemon, PokemonListResponse } from './pokemon.model';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private readonly http = inject(HttpClient);

  getList(limit = 20, offset = 0): Observable<PokemonListResponse> {
    return this.http.get<PokemonListResponse>(`/pokemon?limit=${limit}&offset=${offset}`);
  }

  getByNameOrId(nameOrId: string | number): Observable<Pokemon> {
    return this.http.get<Pokemon>(`/pokemon/${nameOrId}`);
  }
}
