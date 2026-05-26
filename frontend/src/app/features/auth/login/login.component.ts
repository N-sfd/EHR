import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isSubmitting = false;
  errorMessage: string | null = null;
  passwordVisible = false;
  private fb = inject(FormBuilder);

  loginForm = this.fb.group({
    username: ['admin', Validators.required],
    password: ['password', Validators.required], // Default password matches backend test user
    rememberMe: [true]
  });

  highlights = [
    { label: 'Clinics onboarded', value: '120+' },
    { label: 'Providers', value: '2.4k' },
    { label: 'Appointments / mo', value: '48k' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  submit() {
    this.errorMessage = null;

    if (this.loginForm.invalid || this.isSubmitting) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { username, password } = this.loginForm.value;
    if (!username || !password) {
      return;
    }

    this.isSubmitting = true;
    this.authService.login(username, password).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        console.error('Login error details:', {
          status: err?.status,
          statusText: err?.statusText,
          message: err?.message,
          url: err?.url,
          error: err?.error
        });
        
        // Provide more helpful error messages
        if (err?.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check if the backend is running on port 8087.';
        } else if (err?.status === 401) {
          this.errorMessage = err?.error?.error || 'Invalid username or password. Make sure you are using "admin" / "password".';
        } else if (err?.status === 403) {
          this.errorMessage = err?.error?.error || 'Account is inactive or access denied.';
        } else if (err?.status === 500) {
          this.errorMessage = err?.error?.error || 'Internal server error. Please check backend logs.';
        } else {
          this.errorMessage = err?.error?.error || err?.error?.message || err?.message || 'An error occurred during login.';
        }
      }
    });
  }
}

