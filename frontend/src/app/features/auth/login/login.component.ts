import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, of, timeout } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { friendlyAuthError } from '../../../core/utils/http-error.util';
import { environment } from '../../../../environments/environment';

type ApiStatus = 'checking' | 'online' | 'offline';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isSubmitting = false;
  errorMessage: string | null = null;
  passwordVisible = false;
  apiStatus: ApiStatus = 'checking';

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  loginForm = this.fb.group({
    username: ['admin', Validators.required],
    password: ['password', Validators.required],
    rememberMe: [true]
  });

  readonly currentYear = new Date().getFullYear();

  readonly capabilities = [
    { icon: 'fa-calendar-days', title: 'Appointment scheduling', desc: 'Grid views, waitlists, and provider templates' },
    { icon: 'fa-hospital-user', title: 'Patient portal', desc: 'MyChart-style access for patients and families' },
    { icon: 'fa-wand-magic-sparkles', title: 'AI assistant', desc: 'Optional Ollama or cloud models for staff chat' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkApiHealth();
  }

  get apiOffline(): boolean {
    return this.apiStatus === 'offline';
  }

  checkApiHealth(): void {
    this.apiStatus = 'checking';
    const healthUrl = `${environment.apiUrl || ''}/api/health`;

    this.http.get(healthUrl).pipe(
      timeout(5000),
      catchError(() => of(null))
    ).subscribe(response => {
      this.apiStatus = response ? 'online' : 'offline';
    });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  submit(): void {
    this.errorMessage = null;

    if (this.apiOffline) {
      this.errorMessage = friendlyAuthError(new HttpErrorResponse({ status: 504, statusText: 'Gateway Timeout' }));
      return;
    }

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
      error: (err: unknown) => {
        this.isSubmitting = false;
        this.errorMessage = friendlyAuthError(err);
        if (this.apiStatus === 'online' && this.errorMessage.includes('API is not running')) {
          this.apiStatus = 'offline';
        }
      }
    });
  }
}
