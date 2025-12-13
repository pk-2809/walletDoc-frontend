import { Injectable, signal } from '@angular/core';

/**
 * Loading service to manage loading state
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingCount = signal(0);
  
  /**
   * Public loading state
   */
  isLoading = signal(false);

  /**
   * Show loader
   */
  show(): void {
    this.loadingCount.update(count => count + 1);
    this.isLoading.set(true);
  }

  /**
   * Hide loader
   */
  hide(): void {
    this.loadingCount.update(count => Math.max(0, count - 1));
    
    // Only hide when all requests are complete
    if (this.loadingCount() === 0) {
      this.isLoading.set(false);
    }
  }

  /**
   * Force hide loader
   */
  forceHide(): void {
    this.loadingCount.set(0);
    this.isLoading.set(false);
  }
}

