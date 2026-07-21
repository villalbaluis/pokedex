import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PokemonService } from '../pokemon.service';
import { Pokemon } from '../pokemon.model';

@Component({
  selector: 'app-pokemon-detail',
  imports: [RouterLink],
  templateUrl: './pokemon-detail.html',
  styleUrl: './pokemon-detail.scss'
})
export class PokemonDetail {
  private readonly pokemonService = inject(PokemonService);

  id = input.required<string>();

  protected readonly pokemon = signal<Pokemon | null>(null);

  ngOnInit(): void {
    this.pokemonService.getByNameOrId(this.id()).subscribe(pokemon => {
      this.pokemon.set(pokemon);
    });
  }
}