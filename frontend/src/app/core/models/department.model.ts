export interface DepartmentDto {
  departmentId?: number;
  id?: number | string;  // Alias for departmentId for compatibility (can be number or string)
  name: string;        // "Cardiology", "OPD", "Billing" (required)
  code?: string;        // "DEPT_CARDIO", "DEPT_OPD" - optional
  type?: string;       // "CLINICAL", "SUPPORT", "ADMIN"
  specialtyGroup?: string; // "GENERAL", "CARDIAC", "PEDIATRIC", etc.
  active?: boolean;    // Active status (for new model)
  status?: string;     // ACTIVE / INACTIVE (legacy)
  description?: string;
  phoneNumber?: string;
  email?: string;
  createdAt?: string;  // For display purposes
  updatedAt?: string;
}

// Type for creating a new department (without id)
export interface CreateDepartmentDto {
  name: string;
  code?: string;
  type?: string;
  description?: string;
  phoneNumber?: string;
  email?: string;
  status?: string;
}

// Type alias for backward compatibility
export type Department = DepartmentDto;
