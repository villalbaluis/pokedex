import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { pokeapiBaseUrlInterceptor } from './core/interceptors/pokeapi-base-url-interceptor';
import { CACHE_STRATEGY, FAVORITES_STORAGE } from './core/storage/storage-strategy';
import { IndexedDbStorageStrategy } from './core/storage/indexed-db-strategy';
import { LocalStorageStrategy } from './core/storage/local-storage-strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([pokeapiBaseUrlInterceptor])),
    { provide: CACHE_STRATEGY, useClass: IndexedDbStorageStrategy },
    { provide: FAVORITES_STORAGE, useClass: LocalStorageStrategy }
  ]
};