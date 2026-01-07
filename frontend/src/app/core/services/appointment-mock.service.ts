import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Appointment, CalendarView, TimeSlot } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentMockService {
  private mockAppointments: Appointment[] = [
    {
      id: 1,
      appointmentId: 1,
      appointmentCode: 'AP001',
      patientId: 1,
      doctorId: 1,
      departmentId: 1,
      appointmentType: 'In Person',
      date: '2026-01-10',
      appointmentDate: '2026-01-10',
      time: '10:00 AM',
      appointmentTime: '10:00',
      durationMinutes: 30,
      status: 'Schedule',
      reason: 'Follow-up',
      patientName: 'John Doe',
      doctorName: 'Dr. Amelia Carter',
      departmentName: 'Primary Care'
    },
    {
      id: 2,
      appointmentId: 2,
      appointmentCode: 'AP002',
      patientId: 2,
      doctorId: 2,
      departmentId: 2,
      appointmentType: 'In Person',
      date: '2026-01-10',
      appointmentDate: '2026-01-10',
      time: '02:00 PM',
      appointmentTime: '14:00',
      durationMinutes: 60,
      status: 'Schedule',
      reason: 'New patient',
      patientName: 'Jane Smith',
      doctorName: 'Dr. Ryan Patel',
      departmentName: 'Cardiology'
    },
    {
      id: 3,
      appointmentId: 3,
      appointmentCode: 'AP003',
      patientId: 3,
      doctorId: 3,
      departmentId: 3,
      appointmentType: 'In Person',
      date: '2026-01-10',
      appointmentDate: '2026-01-10',
      time: '09:00 AM',
      appointmentTime: '09:00',
      durationMinutes: 30,
      status: 'Schedule',
      reason: 'Well child visit',
      patientName: 'Robert Johnson',
      doctorName: 'Dr. Sophia Nguyen',
      departmentName: 'Pediatrics'
    },
    {
      id: 4,
      appointmentId: 4,
      appointmentCode: 'AP004',
      patientId: 4,
      doctorId: 4,
      departmentId: 4,
      appointmentType: 'In Person',
      date: '2026-01-10',
      appointmentDate: '2026-01-10',
      time: '11:30 AM',
      appointmentTime: '11:30',
      durationMinutes: 45,
      status: 'Schedule',
      reason: 'Follow-up',
      patientName: 'Maria Garcia',
      doctorName: 'Dr. Noah Kim',
      departmentName: 'Orthopedics'
    },
    {
      id: 5,
      appointmentId: 5,
      appointmentCode: 'AP005',
      patientId: 5,
      doctorId: 5,
      departmentId: 5,
      appointmentType: 'In Person',
      date: '2026-01-10',
      appointmentDate: '2026-01-10',
      time: '03:00 PM',
      appointmentTime: '15:00',
      durationMinutes: 30,
      status: 'Schedule',
      reason: 'New patient',
      patientName: 'William Brown',
      doctorName: 'Dr. Olivia Garcia',
      departmentName: 'Dermatology'
    },
    {
      id: 6,
      appointmentId: 6,
      appointmentCode: 'AP006',
      patientId: 6,
      doctorId: 3,
      departmentId: 3,
      appointmentType: 'In Person',
      date: '2026-01-10',
      appointmentDate: '2026-01-10',
      time: '10:30 AM',
      appointmentTime: '10:30',
      durationMinutes: 30,
      status: 'Schedule',
      reason: 'Routine checkup',
      patientName: 'Patricia Davis',
      doctorName: 'Dr. Sophia Nguyen',
      departmentName: 'Pediatrics'
    },
    {
      id: 7,
      appointmentId: 7,
      appointmentCode: 'AP007',
      patientId: 7,
      doctorId: 4,
      departmentId: 4,
      appointmentType: 'In Person',
      date: '2026-01-10',
      appointmentDate: '2026-01-10',
      time: '01:00 PM',
      appointmentTime: '13:00',
      durationMinutes: 60,
      status: 'Schedule',
      reason: 'Follow-up',
      patientName: 'Michael Miller',
      doctorName: 'Dr. Noah Kim',
      departmentName: 'Orthopedics'
    },
    {
      id: 8,
      appointmentId: 8,
      appointmentCode: 'AP008',
      patientId: 8,
      doctorId: 5,
      departmentId: 5,
      appointmentType: 'In Person',
      date: '2026-01-10',
      appointmentDate: '2026-01-10',
      time: '02:30 PM',
      appointmentTime: '14:30',
      durationMinutes: 20,
      status: 'Schedule',
      reason: 'New patient',
      patientName: 'Jennifer Wilson',
      doctorName: 'Dr. Olivia Garcia',
      departmentName: 'Dermatology'
    },
    {
      id: 9,
      appointmentId: 9,
      appointmentCode: 'AP009',
      patientId: 9,
      doctorId: 6,
      departmentId: 1,
      appointmentType: 'In Person',
      date: '2026-01-10',
      appointmentDate: '2026-01-10',
      time: '08:00 AM',
      appointmentTime: '08:00',
      durationMinutes: 45,
      status: 'Schedule',
      reason: 'Annual physical',
      patientName: 'David Moore',
      doctorName: 'Dr. James Wilson',
      departmentName: 'Internal Medicine'
    },
    {
      id: 10,
      appointmentId: 10,
      appointmentCode: 'AP010',
      patientId: 10,
      doctorId: 7,
      departmentId: 6,
      appointmentType: 'In Person',
      date: '2026-01-10',
      appointmentDate: '2026-01-10',
      time: '11:00 AM',
      appointmentTime: '11:00',
      durationMinutes: 30,
      status: 'Schedule',
      reason: 'Follow-up',
      patientName: 'Elizabeth Taylor',
      doctorName: 'Dr. Emily Martinez',
      departmentName: 'Endocrinology'
    },
    {
      id: 11,
      appointmentId: 11,
      appointmentCode: 'AP011',
      patientId: 11,
      doctorId: 8,
      departmentId: 7,
      appointmentType: 'In Person',
      date: '2026-01-10',
      appointmentDate: '2026-01-10',
      time: '09:30 AM',
      appointmentTime: '09:30',
      durationMinutes: 60,
      status: 'Schedule',
      reason: 'New patient',
      patientName: 'Christopher Anderson',
      doctorName: 'Dr. Michael Chen',
      departmentName: 'Neurology'
    },
    {
      id: 12,
      appointmentId: 12,
      appointmentCode: 'AP012',
      patientId: 12,
      doctorId: 9,
      departmentId: 8,
      appointmentType: 'In Person',
      date: '2026-01-10',
      appointmentDate: '2026-01-10',
      time: '01:30 PM',
      appointmentTime: '13:30',
      durationMinutes: 30,
      status: 'Schedule',
      reason: 'Routine checkup',
      patientName: 'Sarah Thomas',
      doctorName: 'Dr. Sarah Thompson',
      departmentName: 'Women\'s Health'
    },
    {
      id: 13,
      appointmentId: 13,
      appointmentCode: 'AP013',
      patientId: 13,
      doctorId: 10,
      departmentId: 9,
      appointmentType: 'In Person',
      date: '2026-01-10',
      appointmentDate: '2026-01-10',
      time: '10:00 AM',
      appointmentTime: '10:00',
      durationMinutes: 45,
      status: 'Schedule',
      reason: 'Follow-up',
      patientName: 'Daniel Jackson',
      doctorName: 'Dr. David Rodriguez',
      departmentName: 'Pulmonology'
    },
    {
      id: 14,
      appointmentId: 14,
      appointmentCode: 'AP014',
      patientId: 14,
      doctorId: 11,
      departmentId: 10,
      appointmentType: 'In Person',
      date: '2026-01-10',
      appointmentDate: '2026-01-10',
      time: '03:30 PM',
      appointmentTime: '15:30',
      durationMinutes: 60,
      status: 'Schedule',
      reason: 'Follow-up',
      patientName: 'Jessica White',
      doctorName: 'Dr. Lisa Anderson',
      departmentName: 'Mental Health'
    },
    {
      id: 15,
      appointmentId: 15,
      appointmentCode: 'AP015',
      patientId: 15,
      doctorId: 12,
      departmentId: 11,
      appointmentType: 'In Person',
      date: '2026-01-10',
      appointmentDate: '2026-01-10',
      time: '12:00 PM',
      appointmentTime: '12:00',
      durationMinutes: 30,
      status: 'Schedule',
      reason: 'Sick visit',
      patientName: 'Matthew Harris',
      doctorName: 'Dr. Robert Taylor',
      departmentName: 'Gastroenterology'
    }
  ];

  getAll(): Observable<Appointment[]> {
    return of(this.mockAppointments).pipe(delay(300));
  }

  getById(id: number): Observable<Appointment> {
    const appointment = this.mockAppointments.find(a => a.id === id || a.appointmentId === id);
    return of(appointment || this.mockAppointments[0]).pipe(delay(200));
  }

  create(appointment: Partial<Appointment>): Observable<Appointment> {
    const newAppointment: Appointment = {
      ...appointment,
      id: this.mockAppointments.length + 1,
      appointmentId: this.mockAppointments.length + 1,
      appointmentCode: `AP${String(this.mockAppointments.length + 1).padStart(3, '0')}`,
      status: 'Schedule'
    } as Appointment;
    this.mockAppointments.push(newAppointment);
    return of(newAppointment).pipe(delay(400));
  }

  update(id: number, appointment: Partial<Appointment>): Observable<Appointment> {
    const index = this.mockAppointments.findIndex(a => a.id === id || a.appointmentId === id);
    if (index >= 0) {
      this.mockAppointments[index] = { ...this.mockAppointments[index], ...appointment };
      return of(this.mockAppointments[index]).pipe(delay(400));
    }
    return of(appointment as Appointment).pipe(delay(400));
  }

  delete(id: number): Observable<void> {
    const index = this.mockAppointments.findIndex(a => a.id === id || a.appointmentId === id);
    if (index >= 0) {
      this.mockAppointments.splice(index, 1);
    }
    return of(undefined).pipe(delay(300));
  }

  getByPatient(patientId: number): Observable<Appointment[]> {
    const appointments = this.mockAppointments.filter(a => a.patientId === patientId);
    return of(appointments.length > 0 ? appointments : this.mockAppointments).pipe(delay(300));
  }

  getWeekView(weekStart: string, doctorId?: number): Observable<CalendarView> {
    const calendarView: CalendarView = {
      startDate: weekStart,
      endDate: weekStart,
      viewType: 'WEEK' as const,
      appointments: doctorId 
        ? this.mockAppointments.filter(a => a.doctorId === doctorId)
        : this.mockAppointments
    };
    return of(calendarView).pipe(delay(300));
  }

  getAvailableTimeSlots(date: string, doctorId?: number, slotDurationMinutes: number = 30): Observable<TimeSlot[]> {
    const slots: TimeSlot[] = [];
    for (let hour = 8; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += slotDurationMinutes) {
        const startTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const endMinute = minute + slotDurationMinutes;
        const endHour = endMinute >= 60 ? hour + 1 : hour;
        const endMin = endMinute >= 60 ? endMinute - 60 : endMinute;
        const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
        
        slots.push({
          startTime,
          endTime,
          available: true
        });
      }
    }
    return of(slots).pipe(delay(200));
  }
}

