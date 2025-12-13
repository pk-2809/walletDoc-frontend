import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { authSignals } from '../../state/auth-signals';

/**
 * Auth guard - protects routes that require authentication
 */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = authSignals;

  if (auth.isAuthenticated() || auth.isRestricedAuth()) {
    return true;
  }

  // Redirect to login
  router.navigate(['/login']);
  return false;
};

/**
 * Guest guard - redirects authenticated users away from login/signup
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = authSignals;

  if (!auth.isAuthenticated()) {
    return true;
  }

  // Redirect to dashboard
  router.navigate(['/dashboard']);
  return false;
};

