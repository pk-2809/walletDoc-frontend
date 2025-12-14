import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Field, form } from '@angular/forms/signals';
import { isValidEmail, isStrongPassword } from '../../../shared/utils/validators';
import { AuthService } from '../auth';
import { UserService } from '../../../core/services/user';
import { User } from '../../../core/models/user.model';
import { ToastService } from '../../../shared/services/toast';
import { ToastComponent } from '../../../shared/components/toast/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, Field],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  login = signal({
    email: this.route.snapshot.queryParams['email'] || '',
    password: '',
    showPassword: false
  });

  loginForm: any = form(this.login);

  emailTouched = signal(false);
  passwordTouched = signal(false);
  errorMessage = signal('');
  isLoading = signal(false);

  // Validation
  isEmailValid = computed(() => isValidEmail(this.loginForm.email().value()));
  isPasswordValid = computed(() => isStrongPassword(this.loginForm.password().value()));
  isFormValid = computed(() => this.isEmailValid() && this.isPasswordValid());

  // Error messages
  emailError = computed(() => {
    if (!this.emailTouched()) return '';
    if (!this.loginForm.email().value()) return 'Email is required';
    if (!this.isEmailValid()) return 'Please enter a valid email';
    return '';
  });

  passwordError = computed(() => {
    if (!this.passwordTouched()) return '';
    if (!this.loginForm.password().value()) return 'Password is required';
    if (!this.isPasswordValid()) return 'Password must be 8+ characters with uppercase, lowercase, and number';
    return '';
  });

  togglePasswordVisibility() {
    const value = this.loginForm.showPassword().value();
    this.loginForm.showPassword().value.set(!value);
  }

  onLogin() {
    this.emailTouched.set(true);
    this.passwordTouched.set(true);
    this.errorMessage.set('');

    if (this.isFormValid()) {
      this.isLoading.set(true);
      const data = this.loginForm().value();

      this.authService.login({
        email: data.email,
        password: data.password
      }).subscribe({
        next: (response: any) => {
          console.log('Login successful:', response);
          const userData: User = {
            id: response.data.uid,
            name: response.data.displayName,
            email: response.data.email,
            mobile: response.data.mobileNumber || '',
            profileImage: response.data.profilePicture,
            joinedDate: response.data.createdAt,
            storageUsed: response.data.totalSize || 0,
            storageLimit: 50,
            masterPin: '****'
          }
          this.userService.setUser(userData);
          this.toastService.show('Login successful!', 'success');
          this.isLoading.set(false);
        },
        error: (error) => {
          console.log('Login failed:', error);
          const msg = error.error?.message || error.message || 'Login failed. Please try again.';
          this.errorMessage.set(msg);
          this.toastService.show(msg, 'error');
          this.isLoading.set(false);
        }
      });
    }
  }
}
