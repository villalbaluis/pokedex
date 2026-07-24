import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Observable, of } from 'rxjs';
import { ALL_REGIONS_KEY, RegionService } from './region.service';
import { CACHE_STRATEGY, StorageStrategy } from '../../core/storage/storage-strategy';

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
}

describe('RegionService', () => {
  let service: RegionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CACHE_STRATEGY, useValue: new FakeStorageStrategy() },
      ],
    });

    service = TestBed.inject(RegionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no region selected', () => {
    expect(service.selectedRegion()).toBeNull();
  });

  it('should update selectedRegion when selectRegion is called', () => {
    service.selectRegion('kanto');
    expect(service.selectedRegion()).toBe('kanto');

    service.selectRegion(null);
    expect(service.selectedRegion()).toBeNull();
  });

  it('should fetch a region and its pokedex, combining the species names', () => {
    let result: string[] | undefined;
    service.getPokemonNamesByRegion('kanto').subscribe((names) => (result = names));

    httpMock.expectOne('/region/kanto').flush({
      id: 1,
      name: 'kanto',
      pokedexes: [{ name: 'kanto', url: '/pokedex/kanto' }],
    });

    httpMock.expectOne('/pokedex/kanto').flush({
      id: 2,
      name: 'kanto',
      pokemon_entries: [
        { entry_number: 1, pokemon_species: { name: 'bulbasaur', url: '' } },
        { entry_number: 2, pokemon_species: { name: 'charmander', url: '' } },
      ],
    });

    expect(result).toEqual(['bulbasaur', 'charmander']);
  });

  it('should resolve to an empty list when the region has no pokedexes, without a second HTTP call', () => {
    let result: string[] | undefined;
    service.getPokemonNamesByRegion('orre').subscribe((names) => (result = names));

    httpMock.expectOne('/region/orre').flush({
      id: 99,
      name: 'orre',
      pokedexes: [],
    });

    httpMock.expectNone((req) => req.url.startsWith('/pokedex'));
    expect(result).toEqual([]);
  });

  it('should default the visible count when nothing was stored yet', () => {
    expect(service.getVisibleCount('kanto', 20)).toBe(20);
    expect(service.getVisibleCount(ALL_REGIONS_KEY, 20)).toBe(20);
  });

  it('should remember the visible count per key independently', () => {
    service.setVisibleCount('kanto', 60);

    expect(service.getVisibleCount('kanto', 20)).toBe(60);
    expect(service.getVisibleCount('johto', 20)).toBe(20);
    expect(service.getVisibleCount(ALL_REGIONS_KEY, 20)).toBe(20);
  });
});
