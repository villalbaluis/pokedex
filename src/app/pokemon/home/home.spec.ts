import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { Home } from './home';
import { PokemonService } from '../services/pokemon.service';
import { ALL_REGIONS_KEY, RegionService } from '../services/region.service';
import { FavoritesService } from '../favorites/favorites.service';
import { Pokemon } from '../models/pokemon.model';

const mockPokemon: Pokemon = {
  id: 1,
  name: 'bulbasaur',
  height: 7,
  weight: 69,
  base_experience: 64,
  sprites: { front_default: null },
  types: [],
  abilities: [],
  stats: [],
};

class FakePokemonService {
  getList = vi.fn().mockReturnValue(
    of({
      count: 2,
      next: null,
      previous: null,
      results: [
        { name: 'bulbasaur', url: '' },
        { name: 'charmander', url: '' },
      ],
    })
  );
  getByNameOrId = vi.fn().mockReturnValue(of(mockPokemon));
}

class FakeRegionService {
  selectedRegion = signal<string | null>(null);
  selectRegion = vi.fn((name: string | null) => this.selectedRegion.set(name));
  getRegions = vi.fn().mockReturnValue(
    of({ count: 1, next: null, previous: null, results: [{ name: 'kanto', url: '' }] })
  );
  getPokemonNamesByRegion = vi.fn().mockReturnValue(of<string[]>([]));
  getVisibleCount = vi.fn((_key: string, defaultValue: number) => defaultValue);
  setVisibleCount = vi.fn();
}

class FakeFavoritesService {
  favorites = signal<string[]>([]);
  isFavorite = vi.fn((name: string) => this.favorites().includes(name));
  toggle = vi.fn();
}

function setInputValue(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

describe('Home', () => {
  let fixture: ComponentFixture<Home>;
  let pokemonService: FakePokemonService;
  let regionService: FakeRegionService;
  let favoritesService: FakeFavoritesService;
  let compiled: HTMLElement;

  beforeEach(async () => {
    pokemonService = new FakePokemonService();
    regionService = new FakeRegionService();
    favoritesService = new FakeFavoritesService();

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        { provide: PokemonService, useValue: pokemonService },
        { provide: RegionService, useValue: regionService },
        { provide: FavoritesService, useValue: favoritesService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load the national dex by default and render a card per result', () => {
    expect(pokemonService.getList).toHaveBeenCalled();
    expect(compiled.querySelectorAll('app-pokemon-card').length).toBe(2);
  });

  it('should filter the rendered cards as the user types in the search box', async () => {
    const input = compiled.querySelector('input[type="search"]') as HTMLInputElement;
    setInputValue(input, 'char');

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.querySelectorAll('app-pokemon-card').length).toBe(1);
  });

  it('should show a message when the search has no matches', async () => {
    const input = compiled.querySelector('input[type="search"]') as HTMLInputElement;
    setInputValue(input, 'nonexistent');

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.querySelector('.status-message')?.textContent).toContain('No se encontraron resultados');
  });

  it('should show a region-specific empty message when the selected region has no pokemon', async () => {
    regionService.selectRegion('orre');

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(regionService.getPokemonNamesByRegion).toHaveBeenCalledWith('orre');
    expect(compiled.querySelector('.status-message')?.textContent).toContain(
      'No hay Pokémon registrados para esta región'
    );
  });

  it('should only show favorites when the favorites toggle is active', async () => {
    favoritesService.favorites.set(['bulbasaur']);

    const toggleButton = compiled.querySelector('.fav-toggle') as HTMLButtonElement;
    toggleButton.click();

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.querySelectorAll('app-pokemon-card').length).toBe(1);
  });

  it('should persist the expanded visible count through RegionService when "Cargar más" is clicked', async () => {
    pokemonService.getList.mockReturnValue(
      of({
        count: 25,
        next: null,
        previous: null,
        results: Array.from({ length: 25 }, (_, i) => ({ name: `pokemon-${i}`, url: '' })),
      })
    );

    const freshFixture = TestBed.createComponent(Home);
    freshFixture.detectChanges();
    await freshFixture.whenStable();
    freshFixture.detectChanges();

    const loadMoreButton = freshFixture.nativeElement.querySelector('.loadMore__btn') as HTMLButtonElement;
    loadMoreButton.click();
    freshFixture.detectChanges();

    expect(regionService.setVisibleCount).toHaveBeenCalledWith(ALL_REGIONS_KEY, 40);
  });
});
