import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HealthCheckService } from '../../../core/services/health-check';

@Component({
  selector: 'app-health-check',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './health-check.component.html',
  styleUrls: ['./health-check.component.css']
})
export class HealthCheckComponent implements OnInit {
  private healthCheckService = inject(HealthCheckService);

  isChecking = signal(true);
  healthCheckFailed = signal(false);
  statusMessage = signal('INITIALIZING SECURE CONNECTION...');

  ngOnInit() {
    this.performHealthCheck();
  }

  performHealthCheck() {
    this.isChecking.set(true);
    this.healthCheckFailed.set(false);
    this.statusMessage.set('ESTABLISHING SECURE HANDSHAKE...');

    // Simulate steps for better UX
    setTimeout(() => {
      this.statusMessage.set('VERIFYING ENCRYPTION KEYS...');
    }, 800);

    this.healthCheckService.check().subscribe({
      next: (isHealthy) => {
        if (isHealthy) {
          this.statusMessage.set('CONNECTION SECURED.');
          setTimeout(() => {
            this.isChecking.set(false);
          }, 1500); // Allow user to see "Secured"
        } else {
          this.isChecking.set(false);
          this.healthCheckFailed.set(true);
        }
      },
      error: () => {
        this.isChecking.set(false);
        this.healthCheckFailed.set(true);
      }
    });
  }

  retry() {
    this.performHealthCheck();
  }
}
