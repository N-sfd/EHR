export interface RoleDto {
  roleId?: number;
  id?: number;  // Alias for roleId
  name: string;        // "Admin", "Doctor", "Receptionist" (required)
  code?: string;        // "ADMIN", "DOCTOR", "RECEPTIONIST"
  description?: string;
  roleType?: string;    // "SYSTEM", "CLINICAL", "NON_CLINICAL"
  isDefault?: boolean;  // default role for new staff?
  status?: string;      // ACTIVE / INACTIVE
}

// Type for creating a new role (without id)
export interface CreateRoleDto {
  name: string;
  code?: string;
  description?: string;
  roleType?: string;
  isDefault?: boolean;
  status?: string;
}

// Type alias for backward compatibility
export type Role = RoleDto;

