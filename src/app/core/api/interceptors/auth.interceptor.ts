import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { authSignals } from '../../../state/auth-signals';

/**
 * Auth interceptor - adds token to requests
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = authSignals;
  const token = auth.token();

  // Skip auth header for login/signup/health-check
  const isPublicAuth = req.url.includes('/auth/login') || req.url.includes('/auth/signup') || req.url.includes('/auth/register') || req.url.includes('/api/documents/get-documents-by-pin');
  const isHealthCheck = req.url.includes('/health');

  const skipAuth = isPublicAuth || isHealthCheck;

  if (token && !skipAuth) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
