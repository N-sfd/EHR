import { StaffDto } from './staff.model';
import { SpecializationDto } from './specialization.model';
import { DepartmentDto } from './department.model';
import { LocationDto } from './location.model';

export interface DoctorDto extends Omit<StaffDto, 'specializations'> {
  doctorCode: string;
  specializations: SpecializationDto[]; // Override StaffDto's number[] with SpecializationDto[]
  clinicalDepartment?: DepartmentDto;  // may be same as staff department
  clinicalLocations?: LocationDto[];
  
  // Professional Details
  licenseNumber?: string;
  licenseCouncil?: string;
  licenseExpiry?: string;
  yearsOfExperience?: number;
  bio?: string;
  
  // Schedule
  workingDays?: string[];  // ["MON", "TUE", "WED"]
  timeSlots?: TimeSlot[];
  visitDuration?: number;  // minutes
  telehealthEnabled?: boolean;
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// Type alias for backward compatibility
export type Doctor = DoctorDto;

