export interface Insurance {
  id?: number;
  patientId: number;
  insuranceType?: string; // Primary, Secondary, Tertiary
  payerName?: string;
  payerId?: string;
  memberId?: string;
  groupNumber?: string;
  groupName?: string;
  subscriberName?: string;
  subscriberId?: string;
  subscriberRelationship?: string; // Self, Spouse, Child, etc.
  effectiveDate?: string;
  expirationDate?: string;
  copayAmount?: number;
  deductibleAmount?: number;
  phoneNumber?: string;
  faxNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isActive?: boolean;
  notes?: string;
}

