import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface CacheStrategy {
    get<T>(key: string): Observable<T | null>;
    set<T>(key: string, value: T): Observable<void>;
    remove(key: string): Observable<void>;
    clear(): Observable<void>;
}

export const CACHE_STRATEGY = new InjectionToken<CacheStrategy>('CACHE_STRATEGY');