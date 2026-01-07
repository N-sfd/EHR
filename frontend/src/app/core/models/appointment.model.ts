export interface Appointment {
  id?: number;
  appointmentId?: number;
  appointmentCode?: string; // AP544658 format
  patientId: number;
  doctorId: number;
  departmentId?: number;
  appointmentType: 'In Person' | 'Online';
  visitType?: 'New Patient' | 'Follow-up' | 'Consultation' | 'Procedure' | 'Annual Physical' | 'Urgent Care';
  appointmentDate?: string; // ISO date string (backend field)
  date?: string; // ISO date string (frontend field)
  appointmentTime?: string; // Time string (backend field)
  time?: string; // Time string like "09:00 AM" (frontend field)
  endTime?: string;
  durationMinutes?: number; // 15, 30, 45, 60
  slotStatus?: 'AVAILABLE' | 'BOOKED' | 'OVERBOOK' | 'BLOCKED';
  reason?: string;
  status: 'Checked Out' | 'Checked In' | 'Cancelled' | 'Schedule' | 'Confirmed';
  colorCode?: 'blue' | 'red' | 'yellow' | 'green';
  location?: string;
  notes?: string;
  isRecurring?: boolean;
  recurrencePattern?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  recurrenceEndDate?: string;
  recurrenceInterval?: number;
  parentAppointmentId?: number;
  createdAt?: string;
  updatedAt?: string;
  
  // Populated fields
  patientName?: string;
  patientPhone?: string;
  patientImage?: string;
  doctorName?: string;
  doctorImage?: string;
  departmentName?: string;
}

export interface CalendarView {
  startDate: string;
  endDate: string;
  viewType: 'WEEK' | 'MONTH' | 'DAY' | 'YEAR';
  appointments: Appointment[];
  appointmentsByDate?: { [key: string]: Appointment[] };
  availableSlots?: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  reason?: string;
}
