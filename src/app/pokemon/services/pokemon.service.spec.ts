import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Observable, of } from 'rxjs';
import { PokemonService } from './pokemon.service';
import { CACHE_STRATEGY, StorageStrategy } from '../../core/storage/storage-strategy';
import { Pokemon } from '../models/pokemon.model';

class FakeStorageStrategy implements StorageStrategy {
  private readonly store = new Map<string, unknown>();

  get<T>(key: string): Observable<T | null> {
    return of((this.store.get(key) as T) ?? null);
  }

  set<T>(key: string, value: T): Observable<void> {
    this.store.set(key, value);
    return of(undefined);
  }

  remove(key: string): Observable<void> {
    this.store.delete(key);
    return of(undefined);
  }

  clear(): Observable<void> {
    this.store.clear();
    return of(undefined);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }
}

describe('PokemonService', () => {
  let service: PokemonService;
  let httpMock: HttpTestingController;
  let cache: FakeStorageStrategy;

  const mockPokemon: Pokemon = {
    id: 258,
    name: 'mudkip',
    height: 4,
    weight: 76,
    base_experience: 62,
    sprites: { front_default: null },
    types: [],
    abilities: [],
    stats: [],
  };

  beforeEach(() => {
    cache = new FakeStorageStrategy();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CACHE_STRATEGY, useValue: cache },
      ],
    });

    service = TestBed.inject(PokemonService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch a pokemon over HTTP on a cache miss', () => {
    let result: Pokemon | undefined;
    service.getByNameOrId('mudkip').subscribe((pokemon) => (result = pokemon));

    const req = httpMock.expectOne('/pokemon/mudkip');
    expect(req.request.method).toBe('GET');
    req.flush(mockPokemon);

    expect(result).toEqual(mockPokemon);
  });

  it('should cache the pokemon under both its numeric id and its name', () => {
    service.getByNameOrId('mudkip').subscribe();
    httpMock.expectOne('/pokemon/mudkip').flush(mockPokemon);

    expect(cache.has('pokemon:detail:258')).toBe(true);
    expect(cache.has('pokemon:detail:mudkip')).toBe(true);
  });

  it('should not call HTTP again when the pokemon is already cached by id', () => {
    cache.set('pokemon:detail:258', mockPokemon).subscribe();

    let result: Pokemon | undefined;
    service.getByNameOrId('258').subscribe((pokemon) => (result = pokemon));

    httpMock.expectNone('/pokemon/258');
    expect(result).toEqual(mockPokemon);
  });

  it('should not call HTTP again when a pokemon fetched by name is later requested by id', () => {
    service.getByNameOrId('mudkip').subscribe();
    httpMock.expectOne('/pokemon/mudkip').flush(mockPokemon);

    let result: Pokemon | undefined;
    service.getByNameOrId('258').subscribe((pokemon) => (result = pokemon));

    httpMock.expectNone('/pokemon/258');
    expect(result).toEqual(mockPokemon);
  });

  it('should fetch the pokemon list with the requested limit and offset', () => {
    service.getList(20, 40).subscribe();

    const req = httpMock.expectOne('/pokemon?limit=20&offset=40');
    req.flush({ count: 100, next: null, previous: null, results: [] });
  });
});
