import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { StorageStrategy } from './storage-strategy';

@Injectable()
export class InMemoryStorageStrategy implements StorageStrategy {
    private readonly store = new Map<string, unknown>();

    get<T>(key: string): Observable<T | null> {
        return of((this.store.get(key) as T) ?? null);
    }

    set<T>(key: string, value: T): Observable<void> {
        this.store.set(key, value);
        return of(undefined);
    }

    remove(key: string): Observable<void> {
        this.store.delete(key);
        return of(undefined);
    }

    clear(): Observable<void> {
        this.store.clear();
        return of(undefined);
    }
}