
import { Component, inject, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/services/user';
import { ToastService } from '../../../shared/services/toast';
import { authSignals } from '../../../state/auth-signals';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastComponent } from '../../../shared/components/toast/toast';
import { AuthService } from '../auth';

@Component({
    selector: 'app-mpin',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './mpin.html',
    styleUrl: './mpin.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MpinComponent {
    private userService = inject(UserService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private toastService = inject(ToastService);

    isLoading = signal<boolean>(false);
    private userId = signal<string>('');
    pin = signal<string>('');

    constructor() {
        const scanId = this.route.snapshot.queryParamMap.get('scanId') ?? '';
        this.userId.set(scanId ?? '');
        effect(() => {
            if (this.pin().length === 4) {
                this.verifyPin();
            }
        });
    }

    addDigit(digit: number) {
        if (this.isLoading()) return;
        if (this.pin().length < 4) {
            this.pin.update(p => p + digit);
        }
    }

    removeDigit() {
        if (this.isLoading()) return;
        this.pin.update(p => p.slice(0, -1));
    }

    verifyPin() {
        this.isLoading.set(true);
        this.userService.verifyMpin(this.userId(), this.pin()).subscribe({
            next: (isValid) => {
                if (isValid) {
                    this.toastService.show('Verified successfully', 'success');
                    setTimeout(() => {
                        this.router.navigate(['/dashboard']);
                    }, 100);
                } else {
                    this.toastService.show('Invalid M-PIN', 'error');
                    this.pin.set('');
                    this.isLoading.set(false);
                }
            },
            error: (err) => {
                this.toastService.show(err['message'] ?? 'Verification failed', 'error');
                this.isLoading.set(false);
                this.pin.set('');
            }
        });
    }
}
