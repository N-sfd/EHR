export interface DepartmentDto {
  departmentId?: number;
  id?: number;  // Alias for departmentId for compatibility (optional)
  name: string;        // "Cardiology", "OPD", "Billing" (required)
  code?: string;        // "DEPT_CARDIO", "DEPT_OPD" - optional
  type?: string;       // "CLINICAL", "SUPPORT", "ADMIN"
  description?: string;
  phoneNumber?: string;
  email?: string;
  status?: string;     // ACTIVE / INACTIVE
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
