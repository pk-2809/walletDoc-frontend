import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../../services/loading';

/**
 * Loading interceptor - shows/hides loader
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Skip loading for health check
  if (req.url.includes('/health')) {
    return next(req);
  }

  loadingService.show();

  console.log(`Request: ${req.url} ---> `, req.body);
  return next(req).pipe(
    finalize(() => loadingService.hide())
  );
};
