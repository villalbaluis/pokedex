import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly pendingRequests = signal(0);

  readonly isLoading = computed(() => this.pendingRequests() > 0);

  public start(): void {
    this.pendingRequests.update((count) => count + 1);
  }

  public stop(): void {
    this.pendingRequests.update((count) => Math.max(0, count - 1));
  }
}