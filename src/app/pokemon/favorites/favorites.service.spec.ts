import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { FavoritesService } from './favorites.service';
import { FAVORITES_STORAGE, StorageStrategy } from '../../core/storage/storage-strategy';

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

describe('FavoritesService', () => {
  let service: FavoritesService;
  let storage: FakeStorageStrategy;

  beforeEach(() => {
    storage = new FakeStorageStrategy();

    TestBed.configureTestingModule({
      providers: [{ provide: FAVORITES_STORAGE, useValue: storage }],
    });

    service = TestBed.inject(FavoritesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no favorites', () => {
    expect(service.favorites()).toEqual([]);
    expect(service.isFavorite('pikachu')).toBe(false);
  });

  it('should add a pokemon to favorites when toggled', () => {
    service.toggle('pikachu');

    expect(service.favorites()).toEqual(['pikachu']);
    expect(service.isFavorite('pikachu')).toBe(true);
  });

  it('should remove a pokemon from favorites when toggled a second time', () => {
    service.toggle('pikachu');
    service.toggle('pikachu');

    expect(service.favorites()).toEqual([]);
    expect(service.isFavorite('pikachu')).toBe(false);
  });

  it('should keep other favorites untouched when toggling one', () => {
    service.toggle('pikachu');
    service.toggle('mudkip');
    service.toggle('pikachu');

    expect(service.favorites()).toEqual(['mudkip']);
  });

  it('should persist the updated list to storage on every toggle', () => {
    const setSpy = vi.spyOn(storage, 'set');

    service.toggle('pikachu');

    expect(setSpy).toHaveBeenCalledWith('favorites', ['pikachu']);
  });

  it('should load previously persisted favorites when the service is created', () => {
    const preloadedStorage = new FakeStorageStrategy();
    preloadedStorage.set('favorites', ['mudkip']).subscribe();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: FAVORITES_STORAGE, useValue: preloadedStorage }],
    });

    const freshService = TestBed.inject(FavoritesService);

    expect(freshService.favorites()).toEqual(['mudkip']);
  });
});
