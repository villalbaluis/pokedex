import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { PokemonCard } from './pokemon-card';
import { PokemonService } from '../../services/pokemon.service';
import { FavoritesService } from '../../favorites/favorites.service';
import { Pokemon } from '../../models/pokemon.model';

const mockPokemon: Pokemon = {
  id: 258,
  name: 'mudkip',
  height: 4,
  weight: 76,
  base_experience: 62,
  sprites: { front_default: 'mudkip.png' },
  types: [{ slot: 1, type: { name: 'water', url: '' } }],
  abilities: [],
  stats: [],
};

class FakePokemonService {
  getByNameOrId = vi.fn().mockReturnValue(of(mockPokemon));
}

class FakeFavoritesService {
  favorites = signal<string[]>([]);
  isFavorite = vi.fn((name: string) => this.favorites().includes(name));
  toggle = vi.fn();
}

describe('PokemonCard', () => {
  let component: PokemonCard;
  let fixture: ComponentFixture<PokemonCard>;
  let pokemonService: FakePokemonService;
  let favoritesService: FakeFavoritesService;

  beforeEach(async () => {
    pokemonService = new FakePokemonService();
    favoritesService = new FakeFavoritesService();

    await TestBed.configureTestingModule({
      imports: [PokemonCard],
      providers: [
        { provide: PokemonService, useValue: pokemonService },
        { provide: FavoritesService, useValue: favoritesService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('name', 'mudkip');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch the pokemon by name on init', () => {
    expect(pokemonService.getByNameOrId).toHaveBeenCalledWith('mudkip');
  });

  it('should render the pokemon name and type once loaded', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain('mudkip');
    expect(compiled.querySelector('.type')?.textContent).toContain('water');
  });

  it('should show an error state when the pokemon fails to load', () => {
    pokemonService.getByNameOrId.mockReturnValue(throwError(() => new Error('not found')));

    const errorFixture = TestBed.createComponent(PokemonCard);
    errorFixture.componentRef.setInput('name', 'unknown-pokemon');
    errorFixture.detectChanges();

    const compiled = errorFixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('no disponible');
  });

  it('should toggle favorite without navigating when the star is clicked', () => {
    const button = fixture.nativeElement.querySelector('.favorite-btn') as HTMLButtonElement;
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

    button.dispatchEvent(clickEvent);

    expect(favoritesService.toggle).toHaveBeenCalledWith('mudkip');
    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});
