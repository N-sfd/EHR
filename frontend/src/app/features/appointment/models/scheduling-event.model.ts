/**
 * Scheduling Event Interface
 * Used for communication between ScheduleGridComponent and SchedulerComponent
 */
export interface SchedulingEvent {
  type: 'CREATE' | 'EDIT';
  appointmentId?: number;
  providerId: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes?: number;
  patientId?: number; // Optional, for edit events
}

