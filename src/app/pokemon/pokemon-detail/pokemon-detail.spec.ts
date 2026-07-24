import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { PokemonDetail } from './pokemon-detail';
import { PokemonService } from '../services/pokemon.service';
import { FavoritesService } from '../favorites/favorites.service';
import { Pokemon, PokemonSpecies, TypeDetail, EvolutionChainResponse } from '../models/pokemon.model';

const mockPokemon: Pokemon = {
  id: 258,
  name: 'mudkip',
  height: 4,
  weight: 76,
  base_experience: 62,
  sprites: { front_default: 'mudkip.png' },
  types: [{ slot: 1, type: { name: 'water', url: '' } }],
  abilities: [
    { slot: 1, is_hidden: false, ability: { name: 'torrent', url: '' } },
    { slot: 2, is_hidden: true, ability: { name: 'damp', url: '' } },
  ],
  stats: [
    { base_stat: 50, effort: 0, stat: { name: 'hp', url: '' } },
    { base_stat: 70, effort: 0, stat: { name: 'attack', url: '' } },
  ],
};

const mockSpecies: PokemonSpecies = {
  id: 258,
  name: 'mudkip',
  gender_rate: 4,
  genera: [
    { genus: 'Mud Fish Pokémon', language: { name: 'en', url: '' } },
    { genus: 'Pokémon Pez Lodo', language: { name: 'es', url: '' } },
  ],
  flavor_text_entries: [{ flavor_text: 'Vive en los ríos.\fSiempre alegre.', language: { name: 'es', url: '' } }],
  evolution_chain: { name: 'chain', url: '/evolution-chain/260' },
};

const mockTypeDetail: TypeDetail = {
  name: 'water',
  damage_relations: {
    double_damage_from: [{ name: 'grass', url: '' }],
    half_damage_from: [{ name: 'fire', url: '' }],
    no_damage_from: [],
  },
};

const mockEvolutionChain: EvolutionChainResponse = {
  chain: {
    species: { name: 'mudkip', url: '' },
    evolution_details: [],
    evolves_to: [
      {
        species: { name: 'marshtomp', url: '' },
        evolution_details: [{ min_level: 16 }],
        evolves_to: [],
      },
    ],
  },
};

class FakePokemonService {
  getByNameOrId = vi.fn().mockReturnValue(of(mockPokemon));
  getSpecies = vi.fn().mockReturnValue(of(mockSpecies));
  getTypeDetail = vi.fn().mockReturnValue(of(mockTypeDetail));
  getEvolutionChain = vi.fn().mockReturnValue(of(mockEvolutionChain));
}

class FakeFavoritesService {
  favorites = signal<string[]>([]);
  isFavorite = vi.fn((name: string) => this.favorites().includes(name));
  toggle = vi.fn();
}

describe('PokemonDetail', () => {
  let fixture: ComponentFixture<PokemonDetail>;
  let pokemonService: FakePokemonService;
  let favoritesService: FakeFavoritesService;
  let compiled: HTMLElement;

  beforeEach(async () => {
    pokemonService = new FakePokemonService();
    favoritesService = new FakeFavoritesService();

    await TestBed.configureTestingModule({
      imports: [PokemonDetail],
      providers: [
        { provide: PokemonService, useValue: pokemonService },
        { provide: FavoritesService, useValue: favoritesService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonDetail);
    fixture.componentRef.setInput('id', '258');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should fetch the pokemon and its species for the given id', () => {
    expect(pokemonService.getByNameOrId).toHaveBeenCalledWith('258');
    expect(pokemonService.getSpecies).toHaveBeenCalledWith('258');
  });

  it('should render the total of all base stats', () => {
    const total = compiled.querySelector('.stat-circle--total .stat-circle__value');
    expect(total?.textContent).toContain('120');
  });

  it('should prefer the spanish genus and clean up the flavor text', () => {
    expect(compiled.querySelector('.detail-card__genus')?.textContent).toContain('Pokémon Pez Lodo');
    expect(compiled.querySelector('.flavor-text')?.textContent).toContain('Vive en los ríos. Siempre alegre.');
  });

  it('should render both gender icons when the species can be either', () => {
    expect(compiled.querySelector('.gender-icon--male')).toBeTruthy();
    expect(compiled.querySelector('.gender-icon--female')).toBeTruthy();
  });

  it('should fetch type details and render the combined weaknesses', () => {
    expect(pokemonService.getTypeDetail).toHaveBeenCalledWith('water');

    const badge = compiled.querySelector('.weakness-badge');
    expect(badge?.textContent).toContain('2x');
    expect(badge?.textContent).toContain('grass');
  });

  it('should fetch the evolution chain and render every stage with its level', () => {
    expect(pokemonService.getEvolutionChain).toHaveBeenCalledWith('/evolution-chain/260');

    const stages = compiled.querySelectorAll('.evolution-stage');
    expect(stages.length).toBe(2);
    expect(stages[0].textContent).toContain('mudkip');
    expect(stages[1].textContent).toContain('marshtomp');
    expect(compiled.querySelector('.evolution-arrow')?.textContent).toContain('Lvl 16');
  });

  it('should show the error state when the pokemon fails to load', async () => {
    pokemonService.getByNameOrId.mockReturnValue(throwError(() => new Error('not found')));

    const errorFixture = TestBed.createComponent(PokemonDetail);
    errorFixture.componentRef.setInput('id', 'unknown');
    errorFixture.detectChanges();
    await errorFixture.whenStable();
    errorFixture.detectChanges();

    expect(errorFixture.nativeElement.textContent).toContain('no está disponible');
  });

  it('should toggle the favorite for the current id when the button is clicked', () => {
    const button = compiled.querySelector('.favorite-btn') as HTMLButtonElement;
    button.click();

    expect(favoritesService.toggle).toHaveBeenCalledWith('258');
  });
});
