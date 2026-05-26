import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface SmartSessionResponse {
  authenticated: boolean;
}

/**
 * Patient SMART on FHIR guard.
 * Checks if patient has valid SMART session via backend.
 * Redirects to /patient/launch if not authenticated.
 */
export const patientSmartGuard: CanActivateFn = (route, state) => {
  const http = inject(HttpClient);
  const router = inject(Router);

  // In development, allow access even without a SMART session so the portal
  // can be demoed without an Epic integration. In production set
  // environment.production = true to enforce the SMART auth flow.
  if (!environment.production) {
    return of(true);
  }

  return http.get<SmartSessionResponse>(`${environment.apiUrl}/api/patient/smart/session`).pipe(
    map(response => {
      if (response.authenticated) {
        return true;
      }
      router.navigate(['/patient/launch']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/patient/launch']);
      return of(false);
    })
  );
};

