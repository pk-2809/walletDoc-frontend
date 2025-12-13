import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../../core/api/api.service';
import { authSignals, User as AuthUser } from '../../state/auth-signals';
import { UserService } from '../../core/services/user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  private userService = inject(UserService);
  private router = inject(Router);

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('api/auth/login', credentials).pipe(
      tap((response: any) => {
        this.setDataAndProceed(response.data);
      })
    );
  }

  signup(data: SignupRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('api/auth/register', data).pipe(
      tap((response: any) => {
        this.setDataAndProceed(response.data);
      })
    );
  }

  setDataAndProceed(response: any) {
    const user: AuthUser = {
      id: response.uid,
      name: response.displayName,
      email: response.email
    };
    this.userService.setUserDetails(response);
    this.userService.setDashboardDetails(response);
    authSignals.setAuth(response.token, user);
    this.router.navigate(['/dashboard']);
  }

  logout(): Observable<any> {
    const data = {
      idToken: authSignals.token(),
      uid: authSignals.user()?.id
    }
    return this.api.post('api/auth/logout', data).pipe(
      tap(() => {
        authSignals.clearAuth();
        this.router.navigate(['/login']);
      })
    )
  }

  initialize(): void {
    authSignals.loadFromStorage();
  }
}

