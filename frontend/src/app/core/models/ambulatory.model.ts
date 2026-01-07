export interface Rooming {
  id?: number;
  encounterId: number;
  appointmentId?: number;
  patientId: number;
  roomedByStaffId: number;
  roomedDateTime?: string;
  roomNumber?: string;
  
  // Vitals
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  temperatureF?: number;
  temperatureC?: number;
  pulse?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  heightInches?: number;
  heightCm?: number;
  weightLbs?: number;
  weightKg?: number;
  bmi?: number;
  painScore?: number;
  
  // History
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  medicationsReviewed?: boolean;
  allergiesReviewed?: boolean;
  
  // Screening
  smokingStatus?: string;
  fallRiskAssessment?: boolean;
  fallRiskScore?: number;
  depressionScreening?: boolean;
  depressionScreeningScore?: number;
  alcoholScreening?: boolean;
  
  // Additional
  patientConcerns?: string;
  nursingNotes?: string;
  isComplete?: boolean;
  completedDateTime?: string;
}

export interface ProviderEncounter {
  id?: number;
  encounterId: number;
  appointmentId?: number;
  patientId: number;
  providerId: number;
  encounterDateTime?: string;
  
  // Assessment
  assessment?: string;
  diagnosisCodes?: string;
  diagnosisDescriptions?: string;
  primaryDiagnosis?: string;
  
  // Plan
  plan?: string;
  followUpInstructions?: string;
  followUpAppointmentNeeded?: boolean;
  followUpDays?: number;
  
  // SOAP Notes
  subjective?: string;
  objective?: string;
  assessmentSoap?: string;
  planSoap?: string;
  
  // Orders Summary
  ordersPlaced?: boolean;
  labOrdersCount?: number;
  imagingOrdersCount?: number;
  medicationOrdersCount?: number;
  
  // Status
  isSigned?: boolean;
  signedDateTime?: string;
  signedByStaffId?: number;
  isComplete?: boolean;
  completedDateTime?: string;
  notes?: string;
}

export interface Checkout {
  id?: number;
  encounterId: number;
  appointmentId?: number;
  patientId: number;
  checkedOutByStaffId: number;
  checkoutDateTime?: string;
  
  // Follow-up
  followUpAppointmentScheduled?: boolean;
  followUpAppointmentId?: number;
  followUpDate?: string;
  followUpProviderId?: number;
  followUpReason?: string;
  
  // Referrals
  referralsMade?: boolean;
  referralSpecialty?: string;
  referralProviderName?: string;
  referralNotes?: string;
  
  // Instructions
  patientInstructions?: string;
  medicationInstructions?: string;
  activityRestrictions?: string;
  dietInstructions?: string;
  whenToReturn?: string;
  
  // Billing
  billingCaptured?: boolean;
  billingCapturedByStaffId?: number;
  billingCapturedDateTime?: string;
  copayCollected?: boolean;
  copayAmount?: number;
  paymentMethod?: string;
  
  // Discharge
  dischargeDisposition?: string;
  dischargeInstructionsProvided?: boolean;
  patientUnderstoodInstructions?: boolean;
  isComplete?: boolean;
  completedDateTime?: string;
  notes?: string;
}

