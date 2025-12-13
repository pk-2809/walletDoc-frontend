import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderComponent } from './shared/components/loader/loader';
import { HealthCheckComponent } from './shared/components/health-check/health-check';
import { AuthService } from './features/auth/auth';

import { ToastComponent } from './shared/components/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoaderComponent, HealthCheckComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit {
  private authService = inject(AuthService);

  ngOnInit() {
    this.authService.initialize();
  }
}
