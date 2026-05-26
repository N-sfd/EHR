import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Auth interceptor for cookie-based authentication.
 * Handles 401/403 errors and redirects to login if needed.
 * APP_SESSION cookie is sent automatically via withCredentials: true (from credentialsInterceptor).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        // Session expired - redirect to login
        console.warn('[AuthInterceptor] 401 Unauthorized - redirecting to login');
        // Uncomment if you have a login route:
        // router.navigate(['/login']);
      } else if (err.status === 403) {
        // Access denied - log but don't redirect (user might have partial access)
        console.warn('[AuthInterceptor] 403 Forbidden - check roles/permissions');
      }
      return throwError(() => err);
    })
  );
};


