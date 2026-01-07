import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface Role {
  roleId?: number;
  id?: number;  // Alias for roleId
  name: string;
  description?: string;
  permissionIds?: number[];
  status?: string;  // ACTIVE / INACTIVE
}

export interface Permission {
  permissionId?: number;
  name: string;
  module: string;
  action: string;
}

@Injectable({
  providedIn: 'root'
})
export class RbacService {
  constructor(private api: ApiService) {}

  getRoles(): Observable<Role[]> {
    return this.api.get<Role[]>('/api/rbac/roles');
  }

  getPermissions(): Observable<Permission[]> {
    // Backend PermissionController is at /api/rbac/permissions in staff-service (port 8082)
    return this.api.get<Permission[]>('/api/rbac/permissions');
  }

  updateRolePermission(roleId: number, permissionId: number, enabled: boolean): Observable<any> {
    return this.api.post(`/api/rbac/roles/${roleId}/permissions`, {
      permissionId,
      enabled
    });
  }

  createRole(role: Role): Observable<Role> {
    return this.api.post<Role>('/api/rbac/roles', role);
  }

  updateRole(roleId: number, role: Role): Observable<Role> {
    return this.api.put<Role>(`/api/rbac/roles/${roleId}`, role);
  }

  deleteRole(roleId: number): Observable<void> {
    return this.api.delete<void>(`/api/rbac/roles/${roleId}`);
  }
}

