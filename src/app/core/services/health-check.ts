import { Injectable, inject } from '@angular/core';
import { ApiService } from '../api/api';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HealthCheckService {
  private api = inject(ApiService);

  check(): Observable<boolean> {
    return new Observable(observer => {
      this.api.get(`health`).subscribe({
        next: (response: any) => {
          observer.next(true);
          observer.complete();
        },
        error: (error: any) => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
}

