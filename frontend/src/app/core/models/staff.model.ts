import { RoleDto } from './role.model';
import { DepartmentDto } from './department.model';
import { DesignationDto } from './designation.model';
import { LocationDto } from './location.model';
import { SpecializationDto } from './specialization.model';

export interface StaffDto {
  id?: number;
  staffCode?: string; // S-001 from backend
  firstName: string;
  lastName: string;
  emailAddress?: string;
  phoneNumber?: string;
  employmentStatus?: string;
  departmentId?: number;
  designationId?: number;
  jobId?: number; // Backend uses jobId for designation
  roleId?: number;
  isDoctor?: boolean;
  doctorCode?: string; // D-001 when isDoctor=true
  specializations?: number[];
  
  // Doctor-specific license fields
  licenseNumber?: string;
  licenseCouncil?: string;
  licenseExpiry?: string;
  
  // Additional optional fields for compatibility
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  pronoun?: string;
  ethnicity?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  photoUrl?: string;
  roles?: RoleDto[];
  designation?: DesignationDto;
  department?: DepartmentDto;
  primaryLocation?: LocationDto;
  otherLocations?: LocationDto[];
  hireDate?: string;
  employmentType?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

// Type alias for backward compatibility
export type Staff = StaffDto;

