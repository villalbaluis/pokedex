import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { PokemonService } from '../../pokemon.service';
import { Pokemon } from '../../pokemon.model';

@Component({
  selector: 'app-pokemon-card',
  imports: [RouterLink],
  templateUrl: './pokemon-card.html',
  styleUrl: './pokemon-card.scss'
})
export class PokemonCard {
  private readonly pokemonService = inject(PokemonService);

  name = input.required<string>();

  protected readonly pokemon = signal<Pokemon | null>(null);
  protected readonly hasError = signal(false);

  ngOnInit(): void {
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
}