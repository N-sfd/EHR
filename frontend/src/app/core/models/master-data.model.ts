// Master Data Models - Simplified for caching and fallback
export interface MasterDepartment {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  code?: string;
  specialtyGroup?: string;
}

export interface MasterSpecialization {
  id: string;
  name: string;
  departmentId?: string;
  active: boolean;
  code?: string;
  description?: string;
}

export interface MasterDesignation {
  id: string;
  name: string;
  active: boolean;
  code?: string;
  description?: string;
}

