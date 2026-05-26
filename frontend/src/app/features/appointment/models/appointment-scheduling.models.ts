// ============================================================================
// PATIENT & HEADER MODELS
// ============================================================================

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

// ============================================================================
// INSURANCE MODELS
// ============================================================================

export interface InsuranceSnapshot {
  payerName: string;
  memberId: string;
  eligibilityStatus: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'PENDING';
  eligibilityDate?: string;
  copayAmount?: number;
  deductibleAmount?: number;
}

// ============================================================================
// SCHEDULE SLOT & PROVIDER MODELS
// ============================================================================

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

// ============================================================================
// APPOINTMENT MODELS
// ============================================================================

export interface AppointmentBlock {
  id?: number;
  appointmentId?: number;
  appointmentCode?: string;
  patientId: number;
  patientName: string;
  providerId: number;
  providerName: string;
  departmentId?: number;
  departmentName?: string;
  startDateTime: string; // ISO datetime
  endDateTime: string; // ISO datetime
  durationMinutes: number;
  visitType: 'New Patient' | 'Follow-up' | 'Consultation' | 'Procedure' | 'Annual Physical' | 'Urgent Care';
  status: 'Schedule' | 'Confirmed' | 'Arrived' | 'Checked In' | 'Checked Out' | 'Cancelled';
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  slotStatus?: 'AVAILABLE' | 'BOOKED' | 'BLOCKED' | 'OVERBOOK';
  location?: string;
  notes?: string;
  reason?: string;
}

// Enhanced appointment model for Appointment Book component
export type AppointmentStatus = 'REQUESTED' | 'SCHEDULED' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type AppointmentType = 'FOLLOW_UP' | 'ILLNESS' | 'LAB' | 'NEW_PATIENT' | 'PROCEDURE' | 'VIRTUAL';
export type AppointmentPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type AppointmentLevel = 'L0' | 'L1' | 'L2' | 'L3'; // Complexity level

export interface AppointmentBookAppointment {
  id?: number;
  appointmentId?: number;
  appointmentCode?: string;
  patientId: number;
  providerId: number; // doctorId/providerId
  departmentId?: number;
  locationId?: number;
  roomId?: number;
  
  // Date/Time
  startDateTime: string; // ISO datetime
  endDateTime?: string; // ISO datetime
  durationMinutes: number; // 15, 30, 45, 60, etc.
  
  // Classification
  status: AppointmentStatus;
  type: AppointmentType;
  priority: AppointmentPriority;
  level: AppointmentLevel;
  
  // Details
  reason?: string;
  notes?: string;
  allowOverbook?: boolean; // Allow overlapping appointments
  
  // Recurring
  isRecurring?: boolean;
  recurrencePattern?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  recurrenceEndDate?: string;
  parentAppointmentId?: number;
  
  // Populated fields
  patientName?: string;
  patientMrn?: string;
  providerName?: string;
  departmentName?: string;
  locationName?: string;
  roomName?: string;
  
  // UI helpers
  conflicts?: AppointmentBookAppointment[]; // Conflicting appointments
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

export interface AppointmentFilters {
  providerIds?: number[];
  locationIds?: number[];
  departmentIds?: number[];
  statuses?: AppointmentStatus[];
  types?: AppointmentType[];
  dateRange?: {
    start: string;
    end: string;
  };
}

// ============================================================================
// WAITLIST MODELS
// ============================================================================

export interface WaitlistItem {
  id?: string;
  patientId: number;
  patientName: string;
  patientMrn?: string;
  reason: string;
  preferredDate?: string;
  preferredTime?: string;
  preferredProviderId?: number;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt: string;
}

// Alias for backward compatibility
export type WaitlistEntry = WaitlistItem;

// ============================================================================
// TIME BLOCK MODELS
// ============================================================================

export interface TimeBlock {
  type: 'BLOCKED' | 'OUT_OF_OFFICE' | 'LUNCH' | 'BREAK' | 'APPOINTMENT';
  providerId: number;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  date: string; // YYYY-MM-DD
  roomId?: number; // Optional for room-based blocks
  isRecurring?: boolean;
  recurrencePattern?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  title?: string;
}

// ============================================================================
// UI HELPER TYPES
// ============================================================================

export type ViewType = 'DAY' | 'WORK_WEEK' | 'WEEK' | 'MONTH';
export type ColumnType = 'PROVIDERS' | 'ROOMS';

export interface Provider {
  id: number;
  name: string;
  departmentId?: number;
  color?: string; // For UI display
}

export interface Location {
  id: number;
  name: string;
  address?: string;
}

export interface Room {
  id: number;
  name: string;
  locationId: number;
  capacity?: number;
}

