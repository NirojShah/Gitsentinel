import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../component/button/button';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { SignupService } from './signup.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, ButtonComponent, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class SignupComponent {
  // Required fields based on UserCreateInput
  email = signal<string>('');
  username = signal<string>('');
  password = signal<string>('');
  
  // Optional fields & UI validation
  name = signal<string>('');
  confirmPassword = signal<string>('');
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  private readonly signupService = inject(SignupService);

  handleSignup() {
    if (this.isSubmitting()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email().trim())) {
      this.errorMessage.set('Enter a valid email address.');
      return;
    }
    if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(this.username().trim())) {
      this.errorMessage.set('Username must be 3-32 characters and use letters, numbers, dots, underscores, or hyphens.');
      return;
    }
    if (this.password().length < 8) {
      this.errorMessage.set('Password must be at least 8 characters.');
      return;
    }
    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isSubmitting.set(true);
    this.signupService
      .signup({
        email: this.email().trim(),
        username: this.username().trim(),
        password: this.password(),
        ...(this.name().trim() && { name: this.name().trim() }),
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: ({ message }) => {
          this.successMessage.set(message || 'Account created. Sign in to continue.');
          this.password.set('');
          this.confirmPassword.set('');
        },
        error: (error: unknown) => this.errorMessage.set(this.getErrorMessage(error)),
      });
  }

  private getErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const responseError = error.error;
      if (typeof responseError === 'object' && responseError !== null && 'message' in responseError) {
        const message = responseError.message;
        if (typeof message === 'string') return message;
      }
    }
    if (error instanceof Error) return error.message;
    return 'Unable to create your account.';
  }
}