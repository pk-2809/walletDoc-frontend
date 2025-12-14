import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withDisabledInitialNavigation } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/api/interceptors/auth';
import { errorInterceptor } from './core/api/interceptors/error';
import { loadingInterceptor } from './core/api/interceptors/loading';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withDisabledInitialNavigation()),
    provideHttpClient(
      withInterceptors([
        loadingInterceptor,
        authInterceptor,
        errorInterceptor
      ])
    )
  ]
};
