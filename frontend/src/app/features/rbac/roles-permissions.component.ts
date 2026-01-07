import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RbacService, Role, Permission } from '../../core/services/rbac.service';
import { RoleService } from '../../core/services/role.service';
import { RoleDto, CreateRoleDto } from '../../core/models/role.model';

@Component({
  selector: 'app-roles-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles-permissions.component.html',
  styleUrls: ['./roles-permissions.component.css']
})
export class RolesPermissionsComponent implements OnInit {
  roles: Role[] = [];
  permissions: Permission[] = [];
  selectedRole: Role | null = null;
  rolePermissions: Map<number, Set<number>> = new Map(); // roleId -> Set of permissionIds
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Group permissions by module
  permissionsByModule: Map<string, Permission[]> = new Map();

  // Modal states
  showAddModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedRoleForEdit: RoleDto | null = null;
  roleToDelete: RoleDto | null = null;

  // Form data
  formData: any = {
    name: '',
    code: '', // Hidden field
    description: '', // Hidden field
    roleType: '', // Hidden field
    isDefault: false, // Hidden field
    status: 'ACTIVE'
  };

  constructor(
    private rbacService: RbacService,
    private roleService: RoleService
  ) {}

  ngOnInit() {
    this.loadRoles();
    this.loadPermissions();
  }

  loadRoles() {
    this.isLoading = true;
    this.roleService.getAll().subscribe({
      next: (roles) => {
        const mapped = roles.map(r => ({
          ...r,
          roleId: r.roleId || r.id,
          id: r.roleId || r.id,
          status: r.status || 'ACTIVE'
        }));
        // Remove duplicates by id
        this.roles = Array.from(
          new Map(mapped.map(role => [role.id, role])).values()
        );
        this.loadRolePermissions();
        this.isLoading = false;
      },
      error: (err) => {
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
    // Load permissions for each role
    this.roles.forEach(role => {
      if (role.roleId) {
        this.rolePermissions.set(role.roleId, new Set(role.permissionIds || []));
      }
    });
  }

  togglePermission(roleId: number, permissionId: number, checked: boolean) {
    if (!this.rolePermissions.has(roleId)) {
      this.rolePermissions.set(roleId, new Set());
    }

    const permissionSet = this.rolePermissions.get(roleId)!;

    this.isLoading = true;
    this.rbacService.updateRolePermission(roleId, permissionId, checked).subscribe({
      next: () => {
        if (checked) {
          permissionSet.add(permissionId);
        } else {
          permissionSet.delete(permissionId);
        }
        this.successMessage = 'Permission updated successfully';
        setTimeout(() => this.successMessage = null, 3000);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error updating permission:', err);
        this.errorMessage = 'Failed to update permission';
        setTimeout(() => this.errorMessage = null, 5000);
        this.isLoading = false;
      }
    });
  }

  hasPermission(roleId: number, permissionId: number): boolean {
    const permissionSet = this.rolePermissions.get(roleId);
    return permissionSet ? permissionSet.has(permissionId) : false;
  }

  selectRole(role: Role) {
    this.selectedRole = role;
  }

  getModules(): string[] {
    return Array.from(this.permissionsByModule.keys()).sort();
  }

  getPermissionsForModule(module: string): Permission[] {
    return this.permissionsByModule.get(module) || [];
  }

  openAddRoleModal() {
    this.resetForm();
    this.errorMessage = null;
    this.showAddModal = true;
    setTimeout(() => {
      const nameInput = document.querySelector('.modal-body input[name="name"]') as HTMLInputElement;
      if (nameInput) {
        nameInput.focus();
      }
    }, 100);
  }

  openEditModal(role: RoleDto) {
    this.selectedRoleForEdit = role;
    this.formData = {
      name: role.name || '',
      code: role.code || '', // Hidden field
      description: role.description || '', // Hidden field
      roleType: role.roleType || '', // Hidden field
      isDefault: role.isDefault || false, // Hidden field
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
    this.selectedRoleForEdit = null;
    this.roleToDelete = null;
    this.errorMessage = null;
    this.resetForm();
  }

  resetForm() {
    this.formData = {
      name: '',
      code: '', // Hidden field
      description: '', // Hidden field
      roleType: '', // Hidden field
      isDefault: false, // Hidden field
      status: 'ACTIVE'
    };
  }

  saveRole() {
    if (this.isLoading) {
      return;
    }

    const nameValue = (this.formData.name || '').toString().trim();
    if (!nameValue) {
      this.errorMessage = 'Role name is required. Please enter a role name.';
      const modalBody = document.querySelector('.modal-body');
      if (modalBody) {
        modalBody.scrollTop = 0;
      }
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    
    const roleData: CreateRoleDto = {
      name: nameValue,
      code: (this.formData.code || '').toString().trim() || undefined,
      description: (this.formData.description || '').toString().trim() || undefined,
      roleType: (this.formData.roleType || '').toString().trim() || undefined,
      isDefault: this.formData.isDefault || false,
      status: (this.formData.status || 'ACTIVE').toString()
    };

    if (this.showAddModal) {
      this.roleService.create(roleData).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeModals();
          this.loadRoles();
        },
        error: (err) => {
          console.error('Error creating role:', err);
          this.isLoading = false;
          
          let errorMessage = 'Error creating role. Please try again.';
          if (err?.error?.errors && typeof err.error.errors === 'object') {
            const errorObj = err.error.errors;
            const errorMessages = Object.entries(errorObj).map(([field, msg]) => {
              const fieldLabels: { [key: string]: string } = {
                'name': 'Role Name',
                'status': 'Status'
              };
              const fieldLabel = fieldLabels[field] || field.charAt(0).toUpperCase() + field.slice(1);
              return `${fieldLabel}: ${msg}`;
            });
            errorMessage = errorMessages.join(', ');
          } else if (err?.error?.message) {
            errorMessage = err.error.message;
          }
          
          this.errorMessage = errorMessage;
          setTimeout(() => alert(errorMessage), 100);
        }
      });
    } else if (this.showEditModal && this.selectedRoleForEdit) {
      const roleId = this.selectedRoleForEdit.roleId || this.selectedRoleForEdit.id;
      if (!roleId) return;
      
      const updateData: RoleDto = {
        ...roleData,
        roleId: roleId,
        id: roleId
      };
      
      this.roleService.update(roleId, updateData).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeModals();
          this.loadRoles();
        },
        error: (err) => {
          console.error('Error updating role:', err);
          this.isLoading = false;
          
          let errorMessage = 'Error updating role. Please try again.';
          if (err?.error?.errors && typeof err.error.errors === 'object') {
            const errorObj = err.error.errors;
            const errorMessages = Object.entries(errorObj).map(([field, msg]) => {
              const fieldLabel = field.charAt(0).toUpperCase() + field.slice(1);
              return `${fieldLabel}: ${msg}`;
            });
            errorMessage = errorMessages.join(', ');
          } else if (err?.error?.message) {
            errorMessage = err.error.message;
          }
          
          this.errorMessage = errorMessage;
          setTimeout(() => alert(errorMessage), 100);
        }
      });
    }
  }

  deleteRole() {
    if (!this.roleToDelete) return;
    
    const roleId = this.roleToDelete.roleId || this.roleToDelete.id;
    if (!roleId) return;

    this.isLoading = true;
    this.roleService.delete(roleId).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeModals();
        this.loadRoles();
      },
      error: (err) => {
        console.error('Error deleting role:', err);
        const errorMessage = err?.error?.message || err?.message || 'Error deleting role. Please try again.';
        alert(errorMessage);
        this.isLoading = false;
      }
    });
  }
}
