import { Component, inject, signal } from '@angular/core';
import { PokemonService } from '../pokemon.service';
import { PokemonListItem } from '../pokemon.model';
import { PokemonCard } from './pokemon-card/pokemon-card';

@Component({
  selector: 'app-home',
  imports: [PokemonCard],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  private readonly pokemonService = inject(PokemonService);

  protected readonly pokemonList = signal<PokemonListItem[]>([]);

  ngOnInit(): void {
    this.pokemonService.getList(20, 0).subscribe(response => {
      this.pokemonList.set(response.results);
    });
  }
}