export interface ScheduleGrid {
  providerId: number;
  providerName?: string;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  slotIntervalMinutes: number;
  location?: string;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'BOOKED' | 'OVERBOOK' | 'BLOCKED';
  colorCode: 'blue' | 'red' | 'yellow' | 'green';
  appointment?: AppointmentSlot;
  isSelectable: boolean;
}

export interface AppointmentSlot {
  appointmentId: number;
  appointmentCode: string;
  patientId: number;
  patientName: string;
  visitType?: string;
  durationMinutes?: number;
  status: string;
}

