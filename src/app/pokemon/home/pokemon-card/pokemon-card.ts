import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { PokemonService } from '../../services/pokemon.service';
import { FavoritesService } from '../../favorites/favorites.service';
import { Pokemon } from '../../models/pokemon.model';
import { pokemonTypeColor } from '../../../shared/pokemon-type-colors';

@Component({
  selector: 'app-pokemon-card',
  imports: [RouterLink],
  templateUrl: './pokemon-card.html',
  styleUrl: './pokemon-card.scss'
})
export class PokemonCard {
  public name = input.required<string>();
  private readonly pokemonService = inject(PokemonService);
  protected readonly favoritesService = inject(FavoritesService);
  protected readonly pokemonTypeColor = pokemonTypeColor;
  protected readonly pokemon = signal<Pokemon | null>(null);
  protected readonly hasError = signal(false);

  ngOnInit(): void {
    this.loadPokemon();
  }

  private loadPokemon(): void {
    this.pokemonService
      .getByNameOrId(this.name())
      .pipe(
        catchError(() => {
          this.hasError.set(true);
          return of(null);
        })
      )
      .subscribe((pokemon) => {
        this.pokemon.set(pokemon);
      });
  }

  protected toggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoritesService.toggle(this.name());
  }
}