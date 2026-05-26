import { HttpErrorResponse } from '@angular/common/http';

/**
 * Converts HTTP errors into user-friendly messages
 */
export function friendlyHttpError(err: unknown): string {
  if (!(err instanceof HttpErrorResponse)) {
    if (err instanceof Error && err.message) {
      return err.message;
    }
    return 'An unexpected error occurred.';
  }

  if (err.status === 0) {
    return 'API unreachable. Is backend running on port 8087?';
  }

  if (err.status === 401) {
    return 'Session expired. Please sign in again.';
  }

  if (err.status === 403) {
    return 'Access denied. You do not have permission to access this resource.';
  }

  if (err.status === 404) {
    return err.error?.message || 'Resource not found.';
  }

  if (err.status >= 500) {
    return err.error?.message || `Server error (${err.status}). Please try again later.`;
  }

  return err.error?.message || `Request failed (${err.status}).`;
}

