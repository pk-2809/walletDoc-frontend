import { Injectable, signal, computed, inject } from '@angular/core';
import { UpdateUser, User } from '../models/user.model';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api';
import { Dashboard } from '../models/dashboard.model';
import { Router } from '@angular/router';
import { authSignals } from '../../state/auth-signals';
import { Utility } from '../../shared/utils/utility';
import { ToastService } from '../../shared/services/toast';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _currentUser = signal<User | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());

  // Restricted Mode State (for M-PIN access)
  private _isRestricted = signal<boolean>(false);
  readonly isRestricted = this._isRestricted.asReadonly();

  private _dashboardData = signal<Dashboard | null>(null);
  readonly dashboardData = this._dashboardData.asReadonly();

  private api = inject(ApiService);
  private router = inject(Router);
  private utilityService = inject(Utility);
  private toastService = inject(ToastService);

  setUser(user: User): void {
    this._currentUser.set(user);
  }

  setRestricted(isResctricted: boolean): void {
    this._isRestricted.set(isResctricted);
    authSignals.isRestricedAuth.set(true);
  }

  setDashboardData(data: Dashboard): void {
    this._dashboardData.set(data);
  }

  updateUser(updates: Partial<User>): void {
    this._currentUser.update(current => {
      if (!current) return null;
      return { ...current, ...updates };
    });
  }

  clearUser(): void {
    this._currentUser.set(null);
  }

  getUserDetails(): Observable<boolean> {
    return new Observable(observer => {
      if (!this._currentUser() && !this._isRestricted()) {
        this.api.get(`api/auth/me`).subscribe({
          next: (response: any) => {
            if (response) {
              this.setUserDetails(response.data);
              this.setDashboardDetails(response.data);
            }
            observer.next(true);
            observer.complete();
          },
          error: (error: any) => {
            authSignals.clearAuth();
            this.router.navigate(['/login']);
            this.toastService.show('Session expired. Please login again.', 'error');
            observer.next(false);
            observer.complete();
          }
        });
      }
      else {
        observer.next(true);
        observer.complete();
      }
    });
  }

  setUserDetails(response: any) {
    const userData: User = {
      id: response.uid,
      name: response.displayName,
      email: response.email,
      mobile: response.mobileNumber || '',
      profileImage: response.profilePicture,
      joinedDate: this.utilityService.getFirebaseTimeStamp(response.createdAt),
      storageUsed: response.totalSize || 0,
      storageLimit: 50,
      masterPin: '****'
    }
    this.setUser(userData);
  }

  setDashboardDetails(response: any) {
    const dashboardData: Dashboard = {
      id: response.uid,
      totalDocs: response.documents.length || 0,
      storageUsed: response.totalSize || 0,
      documentList: response.documents.map((doc: any) => ({
        ...doc,
        docUrl: doc.url || doc.downloadURL || ''
      }))
    }
    this.setDashboardData(dashboardData);
  }

  updateProfilePicture(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('profilePicture', file);

    return new Observable(observer => {
      this.api.post(`api/auth/update-profile-picture`, formData).subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.updateUser({ profileImage: response.data.profileImage });
            observer.next(response.data);
          } else {
            observer.next(response);
          }
          observer.complete();
        },
        error: (error: any) => {
          observer.error(error);
        }
      });
    });
  }

  getProfilePicInBase64(): Observable<string> {
    return new Observable(observer => {
      this.api.get(`api/auth/profile-picture-base64`).subscribe({
        next: (response: any) => {
          console.log(response);
          if (response && response.success) {
            observer.next(response.data.base64);
            observer.complete();
          } else {
            observer.error('Failed to get base64 image');
          }
        },
        error: (err: any) => {
          console.error(err);
          observer.error(err);
        }
      });
    });
  }

  updateUserDetails(userDetails: UpdateUser): Observable<any> {
    return new Observable(observer => {
      this.api.put(`api/auth/update-profile`, userDetails).subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.updateUser({ profileImage: response.data.profileImage });
            observer.next(response.data);
          } else {
            observer.next(response);
          }
          observer.complete();
        },
        error: (error: any) => {
          observer.error(error);
        }
      });
    });
  }

  verifyMpin(uid: string, pin: string): Observable<boolean> {
    const body = {
      userId: uid,
      pin: pin
    };

    return new Observable(observer => {
      this.api.post(`api/documents/get-documents-by-pin`, body).subscribe({
        next: (response: any) => {
          if (response && response.data) {
            const token = response.token || response.data.token;
            if (token) {
              authSignals.setAuth(token, {
                id: uid,
                name: 'Guest',
                email: ''
              });
            }
            const res = { ...response, documents: response.data, uid, };
            this.setDashboardDetails(res);
            this.setRestricted(true);
            observer.next(response.data);
          } else {
            observer.next(response);
          }
          observer.complete();
        },
        error: (error: any) => {
          observer.error(error);
        }
      });
    });
  }
}