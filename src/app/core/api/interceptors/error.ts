import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { authSignals } from '../../../state/auth-signals';
import { ToastService } from '../../../shared/services/toast';

/**
 * Error interceptor - handles HTTP errors
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastService = inject(ToastService);
  const auth = authSignals;

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';

      if (error.status === 401) {
        // Handle 401 Unauthorized
        const userEmail = auth.user()?.email;
        auth.clearAuth();

        toastService.show('Session has been expired', 'error');

        // Check if current route is public (e.g. verify-pin)
        // If public, DO NOT redirect. just clear session.
        const currentUrl = router.url;
        const publicRoutes = ['/verify-pin', '/login', '/signup'];
        const isPublic = publicRoutes.some(route => currentUrl.includes(route));

        if (!isPublic) {
          router.navigate(['/auth/login'], {
            queryParams: { email: userEmail }
          });
        }

        errorMessage = 'Session expired';
      } else if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
      return throwError(() => new Error(errorMessage));
    })
  );
};
