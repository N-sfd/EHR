export interface PatientHeader {
  patientId: number;
  patientName: string;
  mrn: string;
  dob: string;
  age: number;
  sex: string;
  alerts: PatientAlert[];
}

export interface PatientAlert {
  type: 'warning' | 'error' | 'info';
  message: string;
  category: 'insurance' | 'allergy' | 'demographics' | 'eligibility' | 'other';
}

export interface ScheduleSlot {
  id: string;
  providerId: number;
  providerName: string;
  startTime: string; // HH:mm format
  endTime: string;
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED' | 'OVERBOOK';
  appointmentId?: number;
  appointmentCode?: string;
  patientName?: string;
  visitType?: string;
  isSelectable: boolean;
}

export interface ProviderSchedule {
  providerId: number;
  providerName: string;
  date: string;
  slots: ScheduleSlot[];
}

export interface AppointmentFormData {
  appointmentId?: number;
  patientId: number;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  visitType: string;
  status: string;
  providerId: number;
  departmentId: number;
  location?: string;
  resource?: string;
  visitReason?: string;
  chiefComplaint?: string;
  schedulingNotes?: string;
}

export interface InsuranceSnapshot {
  payerName: string;
  memberId: string;
  eligibilityStatus: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'PENDING';
  eligibilityDate?: string;
  copayAmount?: number;
  deductibleAmount?: number;
}

