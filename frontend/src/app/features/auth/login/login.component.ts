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
    password: ['admin123', Validators.required],
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
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message || 'Invalid credentials, try again.';
      }
    });
  }
}

