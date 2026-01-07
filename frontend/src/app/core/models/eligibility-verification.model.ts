export interface EligibilityVerification {
  id?: number;
  patientId: number;
  insuranceId?: number;
  appointmentId?: number;
  serviceType?: string;
  eligibilityStatus?: string; // Active Coverage, Inactive, Pending, etc.
  insuranceType?: string; // Primary, Secondary, Tertiary
  payerName?: string;
  memberId?: string;
  groupNumber?: string;
  verifiedDate?: string;
  verifiedByStaffId?: number;
  verificationMethod?: string; // Electronic, Manual, Phone
  coverageStartDate?: string;
  coverageEndDate?: string;
  copayAmount?: number;
  deductibleAmount?: number;
  isActive?: boolean;
  notes?: string;
  responseData?: string; // JSON response from eligibility check
}

