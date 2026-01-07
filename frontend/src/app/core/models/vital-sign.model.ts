export interface VitalSign {
  vitalSignId?: number;
  patientId: number;
  recordedByStaffId?: number;
  recordedAt: string;
  temperatureF?: number;
  temperatureC?: number;
  heartRate?: number;
  systolicBp?: number;
  diastolicBp?: number;
  respiratoryRate?: number;
  spo2?: number;
  painScore?: number;
  weightKg?: number;
  weightLbs?: number;
  heightCm?: number;
  heightInches?: number;
  bmi?: number;
  notes?: string;
}

