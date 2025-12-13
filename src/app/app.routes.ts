import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { dashboardResolver } from './shared/resolvers/dashboard-resolver';
import { previewResolver } from './shared/resolvers/preview-resolver';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'verify-pin',
    loadComponent: () => import('./features/auth/mpin/mpin.component').then(m => m.MpinComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    resolve: { userData: dashboardResolver }
  },
  {
    path: 'dashboard/profile',
    loadComponent: () => import('./features/dashboard/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
    resolve: { userData: dashboardResolver }
  },
  {
    path: 'dashboard/preview/:id',
    loadComponent: () => import('./features/document-view/document-view.component').then(m => m.DocumentViewComponent),
    canActivate: [authGuard],
    resolve: { docData: previewResolver }
  }
];
