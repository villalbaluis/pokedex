import { Component, computed, effect, inject, signal, viewChild, ElementRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { FavoritesService } from '../favorites/favorites.service';
import { PokemonListItem } from '../models/pokemon.model';
import { PokemonService } from '../services/pokemon.service';
import { ALL_REGIONS_KEY, RegionService } from '../services/region.service';
import { PokemonCard } from './pokemon-card/pokemon-card';
import { RegionNav } from './region-nav/region-nav';

const PAGE_SIZE = 20;
const NATIONAL_DEX_LIMIT = 2000;

@Component({
  selector: 'app-home',
  imports: [PokemonCard, RegionNav, ReactiveFormsModule, RouterOutlet],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  private readonly pokemonService = inject(PokemonService);
  private readonly regionService = inject(RegionService);
  private readonly router = inject(Router);
  protected readonly favoritesService = inject(FavoritesService);
  protected readonly pokemonList = signal<PokemonListItem[]>([]);
  protected readonly visibleCount = signal(PAGE_SIZE);
  protected readonly loading = signal(true);
  protected readonly showFavoritesOnly = signal(false);
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly searchTerm = toSignal(this.searchControl.valueChanges, { initialValue: '' });
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  private readonly navigationEnd = toSignal(
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)),
    { initialValue: null }
  );

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
    this.setupRegionEffect();
    this.setupFiltersEffect();
    this.setupAutoSelectEffect();
  }

  private setupRegionEffect(): void {
    effect(() => {
      const region = this.regionService.selectedRegion();
      const key = region ?? ALL_REGIONS_KEY;
      this.visibleCount.set(this.regionService.getVisibleCount(key, PAGE_SIZE));
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
  }

  private setupFiltersEffect(): void {
    let isFirstRun = true;

    effect(() => {
      this.searchTerm();
      this.showFavoritesOnly();

      if (isFirstRun) {
        isFirstRun = false;
        return;
      }

      this.visibleCount.set(PAGE_SIZE);
    });
  }

  private setupAutoSelectEffect(): void {
    this.setupJumpToFirstOnListChange();
    this.setupJumpToFirstOnBareRoute();
  }

  private setupJumpToFirstOnListChange(): void {
    effect(() => {
      const list = this.pokemonList();

      if (list.length > 0) {
        this.router.navigate(['/pokemon', list[0].name]);
      }
    });
  }

  private setupJumpToFirstOnBareRoute(): void {
    effect(() => {
      this.navigationEnd();
      const list = this.filteredList();

      if (list.length > 0 && this.router.url === '/') {
        this.router.navigate(['/pokemon', list[0].name]);
      }
    });
  }

  protected toggleFavoritesOnly(): void {
    this.showFavoritesOnly.update((value) => !value);
  }

  protected showMore(): void {
    const region = this.regionService.selectedRegion();
    const key = region ?? ALL_REGIONS_KEY;

    this.visibleCount.update((count) => {
      const next = count + PAGE_SIZE;
      this.regionService.setVisibleCount(key, next);
      return next;
    });
  }

  protected submitSearch(): void {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.filteredList();

    if (!term || list.length === 0) {
      this.searchInput()?.nativeElement.focus();
      return;
    }

    const exact = list.find((item) => item.name === term) ?? list[0];
    this.router.navigate(['/pokemon', exact.name]);
  }

  protected clearSearch(): void {
    this.searchControl.setValue('');
    this.searchInput()?.nativeElement.focus();
  }
}