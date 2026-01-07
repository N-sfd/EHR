export interface DesignationDto {
  designationId?: number;
  id?: number;  // Alias for designationId for compatibility
  title: string;        // "Staff Nurse", "Consultant", "Receptionist"
  code?: string;        // "STAFF_NURSE", "CONSULTANT", "RECEPTIONIST"
  category?: string;    // "CLINICAL", "NON_CLINICAL", "ADMIN"
  departmentId?: number; // Link to department
  managerial?: boolean; // is it a supervisor/manager role?
  description?: string;
  status?: string;      // ACTIVE / INACTIVE
  createdAt?: string;
}

// Type for creating a new designation (without id)
export interface CreateDesignationDto {
  title: string;
  code?: string;
  category?: string;
  departmentId?: number;
  managerial?: boolean;
  description?: string;
  status?: string;
}

// Type alias for backward compatibility
export type Designation = DesignationDto;

