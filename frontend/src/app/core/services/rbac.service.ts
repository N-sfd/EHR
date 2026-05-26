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
    // Backend RoleController is at /api/roles (not /api/rbac/roles)
    return this.api.get<Role[]>('/api/roles');
  }

  getPermissions(): Observable<Permission[]> {
    // Backend PermissionController is at /api/rbac/permissions in staff-service (port 8082)
    return this.api.get<Permission[]>('/api/rbac/permissions');
  }

  updateRolePermission(roleId: number, permissionId: number, enabled: boolean): Observable<any> {
    // TODO: This endpoint may not exist in backend - check if needed
    return this.api.post(`/api/roles/${roleId}/permissions`, {
      permissionId,
      enabled
    });
  }

  createRole(role: Role): Observable<Role> {
    // Backend RoleController is at /api/roles
    return this.api.post<Role>('/api/roles', role);
  }

  updateRole(roleId: number, role: Role): Observable<Role> {
    // Backend RoleController is at /api/roles
    return this.api.put<Role>(`/api/roles/${roleId}`, role);
  }

  deleteRole(roleId: number): Observable<void> {
    // Backend RoleController is at /api/roles
    return this.api.delete<void>(`/api/roles/${roleId}`);
  }
}

