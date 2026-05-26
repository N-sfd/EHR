import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface CurrentUser {
  id: number;
  staffId: number;
  name: string;
  role: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: CurrentUser | null = null;

  constructor(private http: HttpClient) {
    // Load user from localStorage on init
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    try {
      const storedUser = localStorage.getItem('auth_user_v1');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    } catch (e) {
      console.warn('Failed to load user from storage:', e);
      this.currentUser = null;
    }
  }

  login(username: string, password: string): Observable<CurrentUser> {
    // Call Phase A authentication endpoint
    const apiUrl = environment.apiUrl || '';
    return this.http.post<{ userId: number; username: string; role: string; patientId?: number; staffId?: number }>(
      `${apiUrl}/api/auth/login`,
      { username, password },
      { withCredentials: true } // Required for APP_SESSION cookie
    ).pipe(
      map(response => {
        // Map backend response to CurrentUser
        const user: CurrentUser = {
          id: response.userId,
          staffId: response.staffId || response.userId, // Use staffId if available, fallback to userId
          name: response.username,
          role: response.role,
          email: `${response.username}@example.com` // Backend doesn't return email, use username
        };
        this.currentUser = user;
        // Store user info (no token needed - using cookies)
        localStorage.setItem('auth_user_v1', JSON.stringify(user));
        localStorage.setItem('auth_token_v1', 'cookie_based'); // Placeholder for compatibility
        return user;
      }),
      catchError(err => {
        console.error('Login failed:', err);
        return throwError(() => err);
      })
    );
  }

  getCurrentUser(): Observable<CurrentUser | null> {
    // If we have a stored user, try to verify with backend
    if (this.currentUser) {
      const apiUrl = environment.apiUrl || '';
      return this.http.get<{ userId: number; username: string; role: string; patientId?: number; staffId?: number }>(
        `${apiUrl}/api/auth/me`,
        { withCredentials: true }
      ).pipe(
        map(response => {
          // Update current user from backend
          const user: CurrentUser = {
            id: response.userId,
            staffId: response.staffId || response.userId,
            name: response.username,
            role: response.role,
            email: `${response.username}@example.com`
          };
          this.currentUser = user;
          localStorage.setItem('auth_user_v1', JSON.stringify(user));
          return user;
        }),
        catchError(err => {
          // If backend says not authenticated, clear local user
          console.warn('Session expired or invalid:', err);
          this.logout();
          return of(null);
        })
      );
    }
    // No stored user, return null
    return of(null);
  }

  getCurrentUserId(): number {
    return this.currentUser?.id || 1;
  }

  getCurrentStaffId(): number {
    return this.currentUser?.staffId || 1;
  }

  getCurrentProviderId(): number {
    // If user is a provider, return their provider ID
    // For now, return staff ID as provider ID
    return this.currentUser?.staffId || 1;
  }

  isAuthenticated(): boolean {
    // Check if we have a user stored (cookie-based auth doesn't need token check)
    return this.currentUser !== null;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token_v1');
  }

  logout(): Observable<void> {
    const apiUrl = environment.apiUrl || '';
    return this.http.post<void>(`${apiUrl}/api/auth/logout`, {}, { withCredentials: true }).pipe(
      map(() => {
        this.currentUser = null;
        localStorage.removeItem('auth_token_v1');
        localStorage.removeItem('auth_user_v1');
      }),
      catchError(err => {
        // Even if logout fails, clear local state
        console.warn('Logout request failed:', err);
        this.currentUser = null;
        localStorage.removeItem('auth_token_v1');
        localStorage.removeItem('auth_user_v1');
        return of(undefined);
      })
    );
  }
}
