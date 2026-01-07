export interface Patient {
  id?: number;
  patientId?: number; // Backend field
  patientCode?: string;
  mrn?: string; // Medical Record Number
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string; // Backend field
  emailAddress?: string; // Frontend field (mapped from email)
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  sex?: 'MALE' | 'FEMALE' | 'INTERSEX' | 'UNKNOWN'; // Birth sex
  phone?: string; // Alternative to phoneNumber
  bloodGroup?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'DECEASED' | 'Available' | 'Unavailable';
  primaryDoctorId?: number;
  address?: string; // Backend field
  addressLine1?: string; // Frontend field
  addressLine2?: string;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string; // Backend field
  pincode?: string; // Frontend field (mapped from zipCode)
  photoUrl?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  medicalHistory?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
}

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailAddress?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  status?: string;
  primaryDoctorId?: number;
  addressLine1?: string;
  addressLine2?: string;
  country?: string;
  state?: string;
  city?: string;
  pincode?: string;
}

