import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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

  ngOnInit(): void {
    this.pokemonService.getByNameOrId(this.name()).subscribe(pokemon => {
      this.pokemon.set(pokemon);
    });
  }
}