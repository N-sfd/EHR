import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

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
  private currentUser: CurrentUser | null = {
    id: 1,
    staffId: 1,
    name: 'Current User',
    role: 'NURSE',
    email: 'user@example.com'
  };

  getCurrentUser(): Observable<CurrentUser | null> {
    // In production, this would call an API endpoint
    return of(this.currentUser).pipe(delay(100));
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
    return this.currentUser !== null;
  }

  getToken(): string | null {
    // In production, this would retrieve the token from storage
    // For now, return null (no token-based auth in mock)
    return null;
  }

  logout(): void {
    this.currentUser = null;
    // In production, this would clear tokens and redirect to login
  }
}
