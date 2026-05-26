import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RoleDto, CreateRoleDto, Role } from '../models/role.model';

export type UserRole = 'ADMIN' | 'FRONT_DESK' | 'PROVIDER' | 'NURSE';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private currentRoleSubject = new BehaviorSubject<UserRole>('ADMIN');
  public currentRole$: Observable<UserRole> = this.currentRoleSubject.asObservable();
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl || '';
  private useMock = environment.useMock !== false; // Use environment configuration, default to true

  constructor() {
    this.setRole((localStorage.getItem('userRole') as UserRole) || 'ADMIN');
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
    return true;
  }

  // CRUD methods
  getAll(): Observable<RoleDto[]> {
    if (this.useMock) return this.getMockRoles();
    return this.http.get<RoleDto[]>(`${this.apiUrl}/api/roles`).pipe(
      catchError(() => this.getMockRoles())
    );
  }

  get(id: number): Observable<RoleDto> {
    const findRole = (roles: RoleDto[]) => roles.find(r => (r.id || r.roleId) === id) || null as any;
    if (this.useMock) {
      return this.getMockRoles().pipe(map(findRole));
    }
    return this.http.get<RoleDto>(`${this.apiUrl}/api/roles/${id}`).pipe(
      catchError(() => this.getMockRoles().pipe(map(findRole)))
    );
  }

  create(roleData: CreateRoleDto | RoleDto): Observable<RoleDto> {
    if (this.useMock) {
      return of({ ...roleData, id: Date.now(), roleId: Date.now(), status: roleData.status || 'ACTIVE' } as RoleDto).pipe(delay(300));
    }
    return this.http.post<RoleDto>(`${this.apiUrl}/api/roles`, roleData);
  }

  update(id: number, roleData: RoleDto | CreateRoleDto): Observable<RoleDto> {
    if (this.useMock) {
      return of({ ...roleData, id, roleId: id } as RoleDto).pipe(delay(300));
    }
    return this.http.put<RoleDto>(`${this.apiUrl}/api/roles/${id}`, roleData);
  }

  delete(id: number): Observable<void> {
    if (this.useMock) return of(undefined).pipe(delay(300));
    return this.http.delete<void>(`${this.apiUrl}/api/roles/${id}`);
  }

  private getMockRoles(): Observable<RoleDto[]> {
    const roles: RoleDto[] = [
      { id: 1, roleId: 1, name: 'Admin', code: 'ADMIN', roleType: 'SYSTEM', status: 'ACTIVE' },
      { id: 2, roleId: 2, name: 'Doctor', code: 'DOCTOR', roleType: 'CLINICAL', status: 'ACTIVE' },
      { id: 3, roleId: 3, name: 'Nurse', code: 'NURSE', roleType: 'CLINICAL', status: 'ACTIVE' },
      { id: 4, roleId: 4, name: 'Receptionist', code: 'RECEPTIONIST', roleType: 'NON_CLINICAL', status: 'ACTIVE' },
      { id: 5, roleId: 5, name: 'Medical Assistant', code: 'MEDICAL_ASSISTANT', roleType: 'CLINICAL', status: 'ACTIVE' }
    ];
    return of(roles).pipe(delay(300));
  }
}
