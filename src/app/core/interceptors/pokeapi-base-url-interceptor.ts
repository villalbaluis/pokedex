import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const pokeapiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('/')) {
    return next(req.clone({ url: `${environment.pokeApiBaseUrl}${req.url}` }));
  }
  return next(req);
};
