import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type UserRole = 'ADMIN' | 'FRONT_DESK' | 'PROVIDER' | 'NURSE';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private currentRoleSubject = new BehaviorSubject<UserRole>('ADMIN');
  public currentRole$: Observable<UserRole> = this.currentRoleSubject.asObservable();

  constructor() {
    // In a real app, this would come from auth service
    // For now, default to ADMIN for demo
    const savedRole = localStorage.getItem('userRole') as UserRole || 'ADMIN';
    this.setRole(savedRole);
  }

  getCurrentRole(): UserRole {
    return this.currentRoleSubject.value;
  }

  setRole(role: UserRole): void {
    this.currentRoleSubject.next(role);
    localStorage.setItem('userRole', role);
  }

  isAdmin(): boolean {
    return this.getCurrentRole() === 'ADMIN';
  }

  isFrontDesk(): boolean {
    return this.getCurrentRole() === 'FRONT_DESK';
  }

  isProvider(): boolean {
    return this.getCurrentRole() === 'PROVIDER';
  }

  isNurse(): boolean {
    return this.getCurrentRole() === 'NURSE';
  }

  canEditPatient(): boolean {
    const role = this.getCurrentRole();
    return role === 'ADMIN' || role === 'FRONT_DESK';
  }

  canViewMissingInfo(): boolean {
    return true; // All roles can view
  }
}
