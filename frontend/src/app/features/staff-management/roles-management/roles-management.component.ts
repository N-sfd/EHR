import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../../core/services/role.service';
import { RbacService, Permission } from '../../../core/services/rbac.service';
import { RoleDto } from '../../../core/models/role.model';

@Component({
  selector: 'app-roles-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles-management.component.html',
  styleUrls: ['./roles-management.component.css']
})
export class RolesManagementComponent implements OnInit {
  roles: RoleDto[] = [];
  permissions: Permission[] = [];
  permissionsByModule: Map<string, Permission[]> = new Map();
  
  selectedRole: RoleDto | null = null;
  rolePermissions: Map<number, Set<number>> = new Map(); // roleId -> Set of permissionIds
  
  showAddModal = false;
  showEditModal = false;
  showDeleteModal = false;
  roleToDelete: RoleDto | null = null;
  
  formData: any = {
    name: '',
    code: '',
    description: '',
    roleType: '',
    isDefault: false,
    status: 'ACTIVE'
  };
  
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  roleTypes = ['SYSTEM', 'CLINICAL', 'NON_CLINICAL', 'ADMIN'];
  scopeTypes = ['GLOBAL', 'DEPARTMENT', 'READ_ONLY'];
  
  // Expose Array to template
  Array = Array;

  constructor(
    private roleService: RoleService,
    private rbacService: RbacService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissions();
  }

  loadRoles() {
    this.isLoading = true;
    this.roleService.getAll().subscribe({
      next: (roles: RoleDto[]) => {
        const mapped = roles.map((r: RoleDto) => ({
          ...r,
          roleId: r.roleId || r.id,
          id: r.roleId || r.id
        }));
        this.roles = Array.from(
          new Map(mapped.map((role: RoleDto) => [role.id, role])).values()
        ) as RoleDto[];
        this.loadRolePermissions();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading roles:', err);
        this.errorMessage = 'Failed to load roles';
        this.isLoading = false;
      }
    });
  }

  loadPermissions() {
    this.rbacService.getPermissions().subscribe({
      next: (permissions) => {
        this.permissions = permissions;
        this.groupPermissionsByModule();
      },
      error: (err) => {
        console.error('Error loading permissions:', err);
        this.errorMessage = 'Failed to load permissions';
      }
    });
  }

  groupPermissionsByModule() {
    this.permissionsByModule.clear();
    this.permissions.forEach(permission => {
      const module = permission.module || 'Other';
      if (!this.permissionsByModule.has(module)) {
        this.permissionsByModule.set(module, []);
      }
      this.permissionsByModule.get(module)!.push(permission);
    });
  }

  loadRolePermissions() {
    // Load role-permission mappings
    // This would typically come from an API endpoint
    // For now, we'll initialize empty sets
    this.roles.forEach(role => {
      if (role.roleId || role.id) {
        const roleId = role.roleId || role.id!;
        if (!this.rolePermissions.has(roleId)) {
          this.rolePermissions.set(roleId, new Set());
        }
      }
    });
  }

  hasPermission(roleId: number | undefined, permissionId: number | undefined): boolean {
    if (!roleId || !permissionId) return false;
    const perms = this.rolePermissions.get(roleId);
    return perms ? perms.has(permissionId) : false;
  }

  togglePermission(roleId: number | undefined, permissionId: number | undefined) {
    if (!roleId || !permissionId) return;
    
    const perms = this.rolePermissions.get(roleId) || new Set();
    if (perms.has(permissionId)) {
      perms.delete(permissionId);
    } else {
      perms.add(permissionId);
    }
    this.rolePermissions.set(roleId, perms);
    
    // Save to backend
    this.rbacService.updateRolePermission(roleId, permissionId, perms.has(permissionId)).subscribe({
      next: () => {
        this.successMessage = 'Permission updated successfully';
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        console.error('Error updating permission:', err);
        this.errorMessage = 'Failed to update permission';
      }
    });
  }

  openAddModal() {
    this.formData = {
      name: '',
      code: '',
      description: '',
      roleType: '',
      isDefault: false,
      status: 'ACTIVE'
    };
    this.showAddModal = true;
  }

  openEditModal(role: RoleDto) {
    this.selectedRole = role;
    this.formData = {
      name: role.name,
      code: role.code || '',
      description: role.description || '',
      roleType: role.roleType || '',
      isDefault: role.isDefault || false,
      status: role.status || 'ACTIVE'
    };
    this.showEditModal = true;
  }

  openDeleteModal(role: RoleDto) {
    this.roleToDelete = role;
    this.showDeleteModal = true;
  }

  closeModals() {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedRole = null;
    this.roleToDelete = null;
  }

  generateCode(name: string): string {
    return name.toUpperCase().replace(/\s+/g, '_');
  }

  onNameChange() {
    if (!this.formData.code || this.formData.code === this.generateCode(this.formData.name || '')) {
      this.formData.code = this.generateCode(this.formData.name);
    }
  }

  saveRole() {
    if (!this.formData.name) {
      this.errorMessage = 'Role name is required';
      return;
    }

    if (!this.formData.code) {
      this.formData.code = this.generateCode(this.formData.name);
    }

    const roleData = {
      name: this.formData.name,
      code: this.formData.code,
      description: this.formData.description,
      roleType: this.formData.roleType,
      isDefault: this.formData.isDefault,
      status: this.formData.status
    };

    if (this.showEditModal && this.selectedRole) {
      const roleId = this.selectedRole.roleId || this.selectedRole.id;
      if (roleId) {
        this.roleService.update(roleId, roleData).subscribe({
          next: () => {
            this.loadRoles();
            this.closeModals();
            this.successMessage = 'Role updated successfully';
            setTimeout(() => this.successMessage = null, 3000);
          },
          error: (err) => {
            console.error('Error updating role:', err);
            this.errorMessage = err.error?.message || 'Failed to update role';
          }
        });
      }
    } else {
      this.roleService.create(roleData).subscribe({
        next: () => {
          this.loadRoles();
          this.closeModals();
          this.successMessage = 'Role created successfully';
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (err) => {
          console.error('Error creating role:', err);
          this.errorMessage = err.error?.message || 'Failed to create role';
        }
      });
    }
  }

  deleteRole() {
    if (!this.roleToDelete) return;
    
    const roleId = this.roleToDelete.roleId || this.roleToDelete.id;
    if (roleId) {
      this.roleService.delete(roleId).subscribe({
        next: () => {
          this.loadRoles();
          this.closeModals();
          this.successMessage = 'Role deleted successfully';
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (err) => {
          console.error('Error deleting role:', err);
          this.errorMessage = err.error?.message || 'Failed to delete role';
        }
      });
    }
  }

  selectRole(role: RoleDto) {
    this.selectedRole = role;
  }
}

