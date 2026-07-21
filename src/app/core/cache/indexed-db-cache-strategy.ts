import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';
import { from, Observable } from 'rxjs';
import { CacheStrategy } from './cache-strategy';

const DB_NAME = 'pokedex-cache';
const STORE_NAME = 'entries';

function openCacheDb(): Promise<IDBPDatabase> {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            db.createObjectStore(STORE_NAME);
        },
    });
}

@Injectable()
export class IndexedDbCacheStrategy implements CacheStrategy {
    private readonly dbPromise = openCacheDb();

    get<T>(key: string): Observable<T | null> {
        return from(
            this.dbPromise.then(async (db) => {
                const value = await db.get(STORE_NAME, key);
                return (value as T) ?? null;
            })
        );
    }

    set<T>(key: string, value: T): Observable<void> {
        return from(
            this.dbPromise.then(async (db) => {
                await db.put(STORE_NAME, value, key);
            })
        );
    }

    remove(key: string): Observable<void> {
        return from(
            this.dbPromise.then(async (db) => {
                await db.delete(STORE_NAME, key);
            })
        );
    }

    clear(): Observable<void> {
        return from(
            this.dbPromise.then(async (db) => {
                await db.clear(STORE_NAME);
            })
        );
    }
}