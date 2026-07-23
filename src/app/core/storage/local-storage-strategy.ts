import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { StorageStrategy } from './storage-strategy';

@Injectable()
export class LocalStorageStrategy implements StorageStrategy {
    get<T>(key: string): Observable<T | null> {
        const raw = localStorage.getItem(key);
        return of(raw ? (JSON.parse(raw) as T) : null);
    }

    set<T>(key: string, value: T): Observable<void> {
        localStorage.setItem(key, JSON.stringify(value));
        return of(undefined);
    }

    remove(key: string): Observable<void> {
        localStorage.removeItem(key);
        return of(undefined);
    }

    clear(): Observable<void> {
        localStorage.clear();
        return of(undefined);
    }
}