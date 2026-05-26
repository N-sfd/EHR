import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Ensures cookies (HttpOnly SMART_SESSION) are sent on API requests
 * when frontend and backend run on different origins (4200 -> 8087).
 * 
 * Only applies to backend API calls, not third-party URLs.
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Only attach credentials for your backend API calls
  // Handles both:
  // - Relative URLs: /api/... (works with reverse proxy or same domain)
  // - Absolute URLs: ${environment.apiUrl}/api/... (cross-origin dev)
  const apiUrl = environment.apiUrl || '';
  const isBackendApiCall =
    // Relative API calls
    req.url.startsWith('/api/') ||
    req.url === '/api' ||
    // Absolute API calls to our backend
    (apiUrl && req.url.startsWith(apiUrl + '/api/')) ||
    (apiUrl && req.url === apiUrl + '/api');

  if (isBackendApiCall) {
    req = req.clone({ withCredentials: true });
  }

  return next(req);
};

