export interface MedicationAdministration {
  administrationId?: number;
  medicationId: number;
  patientId: number;
  scheduledDateTime: string;
  administeredDateTime?: string;
  administeredByStaffId?: number;
  status: string;
  dosage?: string;
  route?: string;
  site?: string;
  reasonNotGiven?: string;
  notes?: string;
  verifiedByStaffId?: number;
  verifiedDateTime?: string;
}

