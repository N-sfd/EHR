export interface Encounter {
  id?: number;
  encounterId?: number;
  encounterNumber?: string;
  patientId: number;
  appointmentId?: number;
  encounterType?: string;
  encounterStatus?: string;
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
}

