import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface StorageStrategy {
    get<T>(key: string): Observable<T | null>;
    set<T>(key: string, value: T): Observable<void>;
    remove(key: string): Observable<void>;
    clear(): Observable<void>;
}

export const CACHE_STRATEGY = new InjectionToken<StorageStrategy>('CACHE_STRATEGY');
export const FAVORITES_STORAGE = new InjectionToken<StorageStrategy>('FAVORITES_STORAGE');