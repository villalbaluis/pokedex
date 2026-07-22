import { Component, effect, inject, signal } from '@angular/core';
import { PokemonService } from '../pokemon.service';
import { RegionService } from '../region.service';
import { PokemonListItem } from '../pokemon.model';
import { PokemonCard } from './pokemon-card/pokemon-card';
import { RegionNav } from './region-nav/region-nav';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-home',
  imports: [PokemonCard, RegionNav],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  private readonly pokemonService = inject(PokemonService);
  private readonly regionService = inject(RegionService);

  protected readonly pokemonList = signal<PokemonListItem[]>([]);
  protected readonly visibleCount = signal(PAGE_SIZE);
  protected readonly loading = signal(true);

  constructor() {
    effect(() => {
      const region = this.regionService.selectedRegion();
      this.visibleCount.set(PAGE_SIZE);
      this.loading.set(true);

      if (region) {
        this.regionService.getPokemonNamesByRegion(region).subscribe((names) => {
          this.pokemonList.set(names.map((name) => ({ name, url: '' })));
          this.loading.set(false);
        });
      } else {
        this.pokemonService.getList(20, 0).subscribe((response) => {
          this.pokemonList.set(response.results);
          this.loading.set(false);
        });
      }
    });
  }

  protected showMore(): void {
    this.visibleCount.update((count) => count + PAGE_SIZE);
  }
}