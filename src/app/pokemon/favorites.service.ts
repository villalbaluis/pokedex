import { Injectable, inject, signal } from '@angular/core';
import { FAVORITES_STORAGE } from '../core/storage/storage-strategy';

const FAVORITES_KEY = 'favorites';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly storage = inject(FAVORITES_STORAGE);

  readonly favorites = signal<string[]>([]);

  constructor() {
    this.storage.get<string[]>(FAVORITES_KEY).subscribe((names) => {
      this.favorites.set(names ?? []);
    });
  }

  isFavorite(name: string): boolean {
    return this.favorites().includes(name);
  }

  toggle(name: string): void {
    const current = this.favorites();
    const next = current.includes(name)
      ? current.filter((favorite) => favorite !== name)
      : [...current, name];

    this.favorites.set(next);
    this.storage.set(FAVORITES_KEY, next).subscribe();
  }
}