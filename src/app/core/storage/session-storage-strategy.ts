import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { StorageStrategy } from './storage-strategy';

@Injectable()
export class SessionStorageStrategy implements StorageStrategy {
    get<T>(key: string): Observable<T | null> {
        const raw = sessionStorage.getItem(key);
        return of(raw ? (JSON.parse(raw) as T) : null);
    }

    set<T>(key: string, value: T): Observable<void> {
        sessionStorage.setItem(key, JSON.stringify(value));
        return of(undefined);
    }

    remove(key: string): Observable<void> {
        sessionStorage.removeItem(key);
        return of(undefined);
    }

    clear(): Observable<void> {
        sessionStorage.clear();
        return of(undefined);
    }
}