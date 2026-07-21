import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { pokeapiBaseUrlInterceptor } from './core/interceptors/pokeapi-base-url-interceptor';
import { CACHE_STRATEGY } from './core/cache/cache-strategy';
import { IndexedDbCacheStrategy } from './core/cache/indexed-db-cache-strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([pokeapiBaseUrlInterceptor])),
    { provide: CACHE_STRATEGY, useClass: IndexedDbCacheStrategy }
  ]
};