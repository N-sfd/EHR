export interface RegistrationRequirement {
  demographicsRequired: string[];
  coverageRequired: string[];
  consentRequired: boolean;
}

export interface MissingField {
  key: string; // Alias for field
  field: string;
  label: string;
  severity: 'WARN' | 'CRITICAL';
  section: 'Demographics' | 'Coverage' | 'Consent';
}

export interface RegistrationCompleteness {
  completenessPct: number;
  missing: MissingField[];
  blockers: MissingField[];
  warnings: MissingField[];
}

