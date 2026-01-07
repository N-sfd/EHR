export interface Coverage {
  id?: number;
  patientId: number;
  payer: string; // Insurance company name
  memberId: string;
  groupNumber?: string;
  startDate?: string;
  endDate?: string;
  eligibilityStatus: 'ACTIVE' | 'NOT_VERIFIED' | 'EXPIRED' | 'INACTIVE';
  copay?: number;
  deductible?: number;
  isPrimary?: boolean;
}

export interface PatientConsent {
  patientId: number;
  consentSigned: boolean;
  consentDate?: string;
  consentType?: string;
  signedBy?: string;
}

