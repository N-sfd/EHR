import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface LogoutResponse {
  success: boolean;
}

@Component({
  selector: 'app-patient-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive],
  templateUrl: './patient-layout.component.html',
  styleUrls: ['./patient-layout.component.css']
})
export class PatientLayoutComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  isLoggingOut = false;

  logout() {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;
    
    this.http.post<LogoutResponse>(`${environment.apiUrl}/api/patient/smart/logout`, {})
      .subscribe({
        next: () => {
          this.isLoggingOut = false;
          this.router.navigate(['/patient/launch']);
        },
        error: () => {
          // Even on error, navigate to launch (logout should be best-effort)
          this.isLoggingOut = false;
          this.router.navigate(['/patient/launch']);
        }
      });
  }
}

