import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { PokemonService } from '../services/pokemon.service';
import { FavoritesService } from '../favorites/favorites.service';
import { Pokemon, PokemonSpecies } from '../models/pokemon.model';
import { pokemonTypeColor } from '../../shared/pokemon-type-colors';
import { calculateWeaknesses, Weakness } from '../utils/pokemon-weaknesses';
import { flattenEvolutionChain } from '../utils/pokemon-evolution';

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'SpA',
  'special-defense': 'SpD',
  speed: 'SPD',
};

interface EvolutionStageDisplay {
  name: string;
  minLevel: number | null;
  sprite: string;
}

interface NeighborPokemon {
  id: number;
  name: string;
}

@Component({
  selector: 'app-pokemon-detail',
  imports: [RouterLink],
  templateUrl: './pokemon-detail.html',
  styleUrl: './pokemon-detail.scss'
})
export class PokemonDetail {
  private readonly pokemonService = inject(PokemonService);
  protected readonly favoritesService = inject(FavoritesService);
  protected readonly pokemonTypeColor = pokemonTypeColor;

  id = input.required<string>();

  protected readonly pokemon = signal<Pokemon | null>(null);
  protected readonly species = signal<PokemonSpecies | null>(null);
  protected readonly weaknesses = signal<Weakness[]>([]);
  protected readonly evolutionStages = signal<EvolutionStageDisplay[]>([]);
  protected readonly prevPokemon = signal<NeighborPokemon | null>(null);
  protected readonly nextPokemon = signal<NeighborPokemon | null>(null);
  protected readonly hasError = signal(false);

  protected readonly totalStats = computed(() => {
    const p = this.pokemon();
    return p ? p.stats.reduce((sum, s) => sum + s.base_stat, 0) : 0;
  });

  protected readonly genus = computed(() => {
    const s = this.species();
    if (!s) return '';
    const entry = s.genera.find((g) => g.language.name === 'es') ?? s.genera.find((g) => g.language.name === 'en');
    return entry?.genus ?? '';
  });

  protected readonly flavorText = computed(() => {
    const s = this.species();
    if (!s) return '';
    const entry =
      s.flavor_text_entries.find((f) => f.language.name === 'es') ??
      s.flavor_text_entries.find((f) => f.language.name === 'en');
    return entry?.flavor_text.replace(/[\n\f]/g, ' ') ?? '';
  });

  protected readonly canBeMale = computed(() => {
    const rate = this.species()?.gender_rate ?? -1;
    return rate !== -1 && rate !== 8;
  });

  protected readonly canBeFemale = computed(() => {
    const rate = this.species()?.gender_rate ?? -1;
    return rate !== -1 && rate !== 0;
  });

  constructor() {
    this.setupPokemonEffect();
    this.setupWeaknessesEffect();
    this.setupEvolutionEffect();
    this.setupNeighborsEffect();
  }

  private setupPokemonEffect(): void {
    effect(() => {
      const id = this.id();
      this.pokemon.set(null);
      this.species.set(null);
      this.hasError.set(false);

      this.pokemonService
        .getByNameOrId(id)
        .pipe(
          catchError(() => {
            this.hasError.set(true);
            return of(null);
          })
        )
        .subscribe((pokemon) => {
          this.pokemon.set(pokemon);
        });

      this.pokemonService
        .getSpecies(id)
        .pipe(catchError(() => of(null)))
        .subscribe((species) => {
          this.species.set(species);
        });
    });
  }

  private setupWeaknessesEffect(): void {
    effect(() => {
      const p = this.pokemon();
      this.weaknesses.set([]);

      if (!p) {
        return;
      }

      const requests = p.types.map((t) =>
        this.pokemonService.getTypeDetail(t.type.name)
      );

      forkJoin(requests)
        .pipe(catchError(() => of([])))
        .subscribe((typeDetails) => {
          this.weaknesses.set(calculateWeaknesses(typeDetails));
        });
    });
  }

  private setupEvolutionEffect(): void {
    effect(() => {
      const s = this.species();
      this.evolutionStages.set([]);

      if (!s) {
        return;
      }

      this.pokemonService
        .getEvolutionChain(s.evolution_chain.url)
        .pipe(
          switchMap((chainResponse) => {
            const stages = flattenEvolutionChain(chainResponse.chain);
            const requests = stages.map((stage) =>
              this.pokemonService.getByNameOrId(stage.name)
            );

            return forkJoin(requests).pipe(
              map((pokemons) =>
                stages.map((stage, index) => ({
                  name: stage.name,
                  minLevel: stage.minLevel,
                  sprite:
                    pokemons[index].sprites.other?.['official-artwork']
                      ?.front_default ??
                    pokemons[index].sprites.front_default ??
                    '',
                }))
              )
            );
          }),
          catchError(() => of([]))
        )
        .subscribe((stages) => {
          this.evolutionStages.set(stages);
        });
    });
  }

  private setupNeighborsEffect(): void {
    effect(() => {
      const p = this.pokemon();
      this.prevPokemon.set(null);
      this.nextPokemon.set(null);

      if (!p) {
        return;
      }

      if (p.id > 1) {
        this.pokemonService
          .getByNameOrId(p.id - 1)
          .pipe(catchError(() => of(null)))
          .subscribe((prev) => {
            if (prev) {
              this.prevPokemon.set({ id: prev.id, name: prev.name });
            }
          });
      }

      this.pokemonService
        .getByNameOrId(p.id + 1)
        .pipe(catchError(() => of(null)))
        .subscribe((next) => {
          if (next) {
            this.nextPokemon.set({ id: next.id, name: next.name });
          }
        });
    });
  }

  protected toggleFavorite(): void {
    this.favoritesService.toggle(this.id());
  }

  protected statAbbreviation(statName: string): string {
    return STAT_LABELS[statName] ?? statName.toUpperCase();
  }
}