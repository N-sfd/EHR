export interface Allergy {
  allergyId?: number;
  patientId: number;
  allergen: string;
  allergenType: string;
  reaction: string;
  severity: string;
  onsetDate?: string;
  status: string;
  verifiedByStaffId?: number;
  verifiedDate?: string;
  notes?: string;
  createdByStaffId?: number;
  createdAt?: string;
}

