import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Field, form } from '@angular/forms/signals';
import { isValidEmail, isStrongPassword, passwordsMatch } from '../../../shared/utils/validators';
import { AuthService } from '../auth.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, Field],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  // Form state
  signup = signal({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false
  });

  signupForm = form(this.signup);

  // Track touched fields
  touched = signal({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  // Error message for API errors
  errorMessage = signal('');
  isLoading = signal(false);

  // Form validation
  isFormValid = computed(() =>
    this.signupForm.name().value().trim().length >= 2 &&
    isValidEmail(this.signupForm.email().value()) &&
    isStrongPassword(this.signupForm.password().value()) &&
    passwordsMatch(this.signupForm.password().value(), this.signupForm.confirmPassword().value())
  );

  // Field error messages
  nameError = computed(() => {
    if (!this.touched().name) return '';
    const value = this.signupForm.name().value();
    if (!value) return 'Name is required';
    if (value.trim().length < 2) return 'Name must be at least 2 characters';
    return '';
  });

  emailError = computed(() => {
    if (!this.touched().email) return '';
    const value = this.signupForm.email().value();
    if (!value) return 'Email is required';
    if (!isValidEmail(value)) return 'Please enter a valid email';
    return '';
  });

  passwordError = computed(() => {
    if (!this.touched().password) return '';
    const value = this.signupForm.password().value();
    if (!value) return 'Password is required';
    if (!isStrongPassword(value)) return 'Password must be 8+ characters with uppercase, lowercase, and number';
    return '';
  });

  confirmPasswordError = computed(() => {
    if (!this.touched().confirmPassword) return '';
    const value = this.signupForm.confirmPassword().value();
    const passwordValue = this.signupForm.password().value();
    if (!value) return 'Please confirm password';
    if (!passwordsMatch(passwordValue, value)) return 'Passwords do not match';
    return '';
  });

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    const currentValue = this.signupForm.showPassword().value();
    this.signupForm.showPassword().value.set(!currentValue);
  }

  /**
   * Toggle confirm password visibility
   */
  toggleConfirmPasswordVisibility(): void {
    const currentValue = this.signupForm.showConfirmPassword().value();
    this.signupForm.showConfirmPassword().value.set(!currentValue);
  }

  /**
   * Mark field as touched
   */
  markTouched(field: 'name' | 'email' | 'password' | 'confirmPassword'): void {
    this.touched.update(t => ({ ...t, [field]: true }));
  }

  /**
   * Handle signup submission
   */
  onSignup(): void {
    // Mark all fields as touched
    this.touched.set({
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    this.errorMessage.set('');

    // Validate and submit
    if (this.isFormValid()) {
      this.isLoading.set(true);
      const formData = this.signupForm().value();

      this.authService.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password
      }).subscribe({
        next: (response) => {
          console.log('✅ Signup successful:', response);
          this.toastService.show('Signup successful!', 'success');
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('❌ Signup failed:', error);
          const msg = error.error?.message || error.message || 'Signup failed. Please try again.';
          this.errorMessage.set(msg);
          this.toastService.show(msg, 'error');
          this.isLoading.set(false);
        }
      });
    }
  }
}
