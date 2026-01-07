export interface SpecializationDto {
  specializationId?: number;
  id?: number;  // Alias for specializationId
  name: string;        // "Cardiology", "Pediatrics" (required)
  code?: string;        // "CARDIO", "PEDIATRICS"
  departmentId?: number;    // optional link to department
  description?: string;
  status?: string;      // ACTIVE / INACTIVE
}

// Type for creating a new specialization (without id)
export interface CreateSpecializationDto {
  name: string;
  code?: string;
  departmentId?: number;
  description?: string;
  status?: string;
}

// Type alias for backward compatibility
export type Specialization = SpecializationDto;

