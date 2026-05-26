import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface AuthorizeResponse {
  url: string;
}

@Component({
  selector: 'app-launch',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="launch-container">
      <div class="launch-content" *ngIf="!isLoading && !errorMessage">
        <h1>Connecting to Epic MyChart</h1>
        <p>Please wait while we connect you to your patient portal...</p>
        <div class="spinner" *ngIf="isAuthorizing">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
      </div>
      
      <div class="error-state" *ngIf="errorMessage">
        <i class="fas fa-exclamation-circle"></i>
        <h2>Connection Error</h2>
        <p>{{ errorMessage }}</p>
        <button class="btn-retry" (click)="retry()">Try Again</button>
      </div>
      
      <div class="loading-state" *ngIf="isLoading && !isAuthorizing">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading...</p>
      </div>
    </div>
  `,
  styles: [`
    .launch-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: #f5f5f5;
    }
    
    .launch-content {
      text-align: center;
      max-width: 500px;
    }
    
    h1 {
      color: #1f2937;
      margin-bottom: 16px;
      font-size: 24px;
    }
    
    p {
      color: #6b7280;
      margin-bottom: 24px;
    }
    
    .spinner {
      font-size: 32px;
      color: #3b82f6;
      margin-top: 24px;
    }
    
    .error-state {
      text-align: center;
      max-width: 500px;
      padding: 32px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .error-state i {
      font-size: 48px;
      color: #ef4444;
      margin-bottom: 16px;
    }
    
    .error-state h2 {
      color: #1f2937;
      margin-bottom: 12px;
    }
    
    .error-state p {
      color: #6b7280;
      margin-bottom: 24px;
    }
    
    .btn-retry {
      padding: 12px 24px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }
    
    .btn-retry:hover {
      background: #2563eb;
    }
    
    .loading-state {
      text-align: center;
    }
    
    .loading-state i {
      font-size: 32px;
      color: #3b82f6;
      margin-bottom: 16px;
    }
  `]
})
export class LaunchComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  
  isLoading = true;
  isAuthorizing = false;
  errorMessage: string | null = null;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const iss = params['iss'];
      const launch = params['launch'];

      if (!iss || !launch) {
        // In development, skip Epic auth and go straight to the portal home
        if (!environment.production) {
          this.router.navigate(['/patient/home']);
          return;
        }
        this.errorMessage = 'Missing required parameters (iss, launch). Please launch from Epic MyChart.';
        this.isLoading = false;
        return;
      }

      this.authorize(iss, launch);
    });
  }

  authorize(iss: string, launch: string) {
    this.isAuthorizing = true;
    this.errorMessage = null;
    
    this.http.get<AuthorizeResponse>(`${environment.apiUrl}/api/patient/smart/authorize`, {
      params: { iss, launch }
    }).subscribe({
      next: (response) => {
        if (response.url) {
          // Redirect to Epic authorization URL
          window.location.href = response.url;
        } else {
          this.errorMessage = 'Invalid response from server.';
          this.isAuthorizing = false;
          this.isLoading = false;
        }
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Failed to connect to Epic MyChart. Please try again.';
        this.isAuthorizing = false;
        this.isLoading = false;
      }
    });
  }

  retry() {
    this.isLoading = true;
    this.errorMessage = null;
    this.route.queryParams.subscribe(params => {
      const iss = params['iss'];
      const launch = params['launch'];
      if (iss && launch) {
        this.authorize(iss, launch);
      } else {
        this.errorMessage = 'Missing required parameters. Please launch from Epic MyChart.';
        this.isLoading = false;
      }
    });
  }
}

