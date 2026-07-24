import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';
import { from, Observable } from 'rxjs';
import { StorageStrategy } from './storage-strategy';
import { StorageKeys } from '../enums/storage-keys';

function openCacheDb(): Promise<IDBPDatabase> {
    return openDB(StorageKeys.DB_NAME, 1, {
        upgrade(db) {
            db.createObjectStore(StorageKeys.STORE_NAME);
        },
    });
}

@Injectable()
export class IndexedDbStorageStrategy implements StorageStrategy {
    private readonly dbPromise = openCacheDb();

    get<T>(key: string): Observable<T | null> {
        return from(
            this.dbPromise.then(async (db) => {
                const value = await db.get(StorageKeys.STORE_NAME, key);
                return (value as T) ?? null;
            })
        );
    }

    set<T>(key: string, value: T): Observable<void> {
        return from(
            this.dbPromise.then(async (db) => {
                await db.put(StorageKeys.STORE_NAME, value, key);
            })
        );
    }

    remove(key: string): Observable<void> {
        return from(
            this.dbPromise.then(async (db) => {
                await db.delete(StorageKeys.STORE_NAME, key);
            })
        );
    }

    clear(): Observable<void> {
        return from(
            this.dbPromise.then(async (db) => {
                await db.clear(StorageKeys.STORE_NAME);
            })
        );
    }
}