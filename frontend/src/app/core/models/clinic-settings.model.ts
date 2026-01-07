export interface ClinicSettings {
  id?: number;
  clinicName: string;
  legalName?: string;
  logoUrl?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
  alternatePhoneNumber?: string;
  email?: string;
  website?: string;
  timeZone?: string; // e.g. "America/New_York"
  defaultWorkingHours?: string; // JSON string or simple string
  createdAt?: string;
  updatedAt?: string;
}

