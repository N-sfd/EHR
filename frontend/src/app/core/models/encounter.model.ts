export interface Encounter {
  id?: number;
  encounterId?: number;
  encounterNumber?: string;
  patientId: number;
  appointmentId?: number;
  encounterType?: string;
  encounterStatus?: string;
  status?: string; // ROOMING, PROVIDER_ENCOUNTER, CHECKOUT, COMPLETED (for ambulatory encounters)
  checkInDateTime?: string;
  checkInByStaffId?: number;
  checkOutDateTime?: string;
  checkOutByStaffId?: number;
  arrivalDateTime?: string;
  roomAssigned?: string;
  location?: string;
  departmentId?: number;
  primaryProviderId?: number;
  chiefComplaint?: string;
  visitReason?: string;
  registrationComplete?: boolean;
  insuranceVerified?: boolean;
  eligibilityVerified?: boolean;
  copayCollected?: boolean;
  copayAmount?: number;
  waitTimeMinutes?: number;
  visitDurationMinutes?: number;
  dischargeDisposition?: string;
  notes?: string;
  
  // Ambulatory encounter specific fields
  roomingVitals?: string; // JSON string with vitals data
  medReconciliation?: string; // JSON string with medication reconciliation data
  diagnoses?: string[]; // ICD-10 codes
  orders?: string[]; // Order IDs or descriptions
  soapNote?: string; // SOAP note content
  
  // Audit fields
  createdAt?: string;
  updatedAt?: string;
}

