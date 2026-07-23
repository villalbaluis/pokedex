import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { PokemonService } from '../pokemon.service';
import { RegionService } from '../region.service';
import { FavoritesService } from '../favorites.service';
import { PokemonListItem } from '../pokemon.model';
import { PokemonCard } from './pokemon-card/pokemon-card';
import { RegionNav } from './region-nav/region-nav';

const PAGE_SIZE = 20;
const NATIONAL_DEX_LIMIT = 2000;

@Component({
  selector: 'app-home',
  imports: [PokemonCard, RegionNav, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  private readonly pokemonService = inject(PokemonService);
  private readonly regionService = inject(RegionService);
  protected readonly favoritesService = inject(FavoritesService);
  protected readonly pokemonList = signal<PokemonListItem[]>([]);
  protected readonly visibleCount = signal(PAGE_SIZE);
  protected readonly loading = signal(true);
  protected readonly showFavoritesOnly = signal(false);
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly searchTerm = toSignal(this.searchControl.valueChanges, { initialValue: '' });

  protected readonly filteredList = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const onlyFavorites = this.showFavoritesOnly();
    const favorites = this.favoritesService.favorites();

    let list = this.pokemonList();

    if (term) {
      list = list.filter((item) => item.name.includes(term));
    }

    if (onlyFavorites) {
      list = list.filter((item) => favorites.includes(item.name));
    }

    return list;
  });

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
        this.pokemonService.getList(NATIONAL_DEX_LIMIT, 0).subscribe((response) => {
          this.pokemonList.set(response.results);
          this.loading.set(false);
        });
      }
    });

    effect(() => {
      this.searchTerm();
      this.showFavoritesOnly();
      this.visibleCount.set(PAGE_SIZE);
    });
  }

  protected toggleFavoritesOnly(): void {
    this.showFavoritesOnly.update((value) => !value);
  }

  protected showMore(): void {
    this.visibleCount.update((count) => count + PAGE_SIZE);
  }
}