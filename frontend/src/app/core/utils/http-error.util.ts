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
    return apiUnreachableMessage();
  }

  if (err.status === 502 || err.status === 503 || err.status === 504) {
    return apiUnreachableMessage();
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

function apiUnreachableMessage(): string {
  return 'API is not running. From the repo root, start it with: mvn spring-boot:run (port 8087) or .\\deploy.ps1 for Docker.';
}

/** Login form — clearer auth and connectivity messages. */
export function friendlyAuthError(err: unknown): string {
  if (!(err instanceof HttpErrorResponse)) {
    if (err instanceof Error && err.message) {
      return err.message;
    }
    return 'An unexpected error occurred during sign-in.';
  }

  if (err.status === 0 || err.status === 502 || err.status === 503 || err.status === 504) {
    return apiUnreachableMessage();
  }

  if (err.status === 401) {
    return err.error?.error || 'Invalid username or password. Dev default: admin / password';
  }

  if (err.status === 403) {
    return err.error?.error || 'Account is inactive or access denied.';
  }

  return friendlyHttpError(err);
}

