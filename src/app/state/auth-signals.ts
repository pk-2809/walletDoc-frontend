import { signal, computed } from '@angular/core';

/**
 * User interface
 */
export interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * Auth state signals
 */
class AuthSignals {
  // Core state
  token = signal<string | null>(null);
  user = signal<User | null>(null);
  isRestricedAuth = signal<boolean>(false);
  
  // Computed state
  isAuthenticated = computed(() => !!this.token() && !!this.user());

  /**
   * Set authentication data
   */
  setAuth(token: string, user: User): void {
    this.token.set(token);
    this.user.set(user);
    
    // Store in sessionStorage
    sessionStorage.setItem('auth_token', token);
    sessionStorage.setItem('auth_user', JSON.stringify(user));
  }

  /**
   * Clear authentication
   */
  clearAuth(): void {
    this.token.set(null);
    this.user.set(null);
    
    // Remove from sessionStorage
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
  }

  /**
   * Load auth from sessionStorage
   */
  loadFromStorage(): void {
    const token = sessionStorage.getItem('auth_token');
    const userJson = sessionStorage.getItem('auth_user');

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this.token.set(token);
        this.user.set(user);
      } catch (e) {
        this.clearAuth();
      }
    }
  }
}

// Export singleton instance
export const authSignals = new AuthSignals();

