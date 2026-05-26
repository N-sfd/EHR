import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Appointment, CalendarView, TimeSlot } from '../models/appointment.model';
import { AppointmentMockService } from './appointment-mock.service';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private http = inject(HttpClient);
  private mockService = inject(AppointmentMockService);
  private baseUrl = '/api/appointments';
  private useMock = environment.useMock !== false;

  private mapAppointmentResponse(data: any): Appointment {
    return {
      id: data.appointmentId,
      appointmentId: data.appointmentId,
      appointmentCode: data.appointmentCode,
      patientId: data.patientId,
      doctorId: data.doctorId,
      departmentId: data.departmentId,
      appointmentType: data.appointmentType as 'In Person' | 'Online',
      appointmentDate: data.appointmentDate,
      date: data.appointmentDate ? data.appointmentDate.toString() : '',
      appointmentTime: data.appointmentTime,
      time: data.appointmentTime ? this.formatTime(data.appointmentTime) : '',
      endTime: data.endTime ? this.formatTime(data.endTime) : undefined,
      durationMinutes: data.durationMinutes,
      reason: data.reason,
      status: data.status as 'Checked Out' | 'Checked In' | 'Cancelled' | 'Schedule' | 'Confirmed',
      colorCode: data.colorCode,
      location: data.location,
      notes: data.notes,
      isRecurring: data.isRecurring,
      recurrencePattern: data.recurrencePattern,
      recurrenceEndDate: data.recurrenceEndDate,
      recurrenceInterval: data.recurrenceInterval,
      parentAppointmentId: data.parentAppointmentId,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      patientImage: data.patientImage,
      doctorName: data.doctorName,
      doctorImage: data.doctorImage,
      departmentName: data.departmentName,
      createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt).toISOString() : undefined
    };
  }

  private formatTime(time: string): string {
    // Handle LocalTime format from backend (HH:mm:ss or HH:mm)
    if (!time) return '';
    const parts = time.split(':');
    if (parts.length >= 2) {
      const hours = parseInt(parts[0]);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes} ${ampm}`;
    }
    return time;
  }

  getAll(): Observable<Appointment[]> {
    return this.http.get<any[]>(this.baseUrl, { withCredentials: true }).pipe(
      map(appointments => appointments.map(apt => this.mapAppointmentResponse(apt))),
      catchError(err => {
        console.warn('[AppointmentService] API failed, using mock data:', err);
        return this.mockService.getAll();
      })
    );
  }

  getById(id: number): Observable<Appointment> {
    return this.http.get<any>(`${this.baseUrl}/${id}`, { withCredentials: true }).pipe(
      map(apt => this.mapAppointmentResponse(apt)),
      catchError(err => {
        console.warn('[AppointmentService] getById API failed, using mock:', err);
        return this.mockService.getById(id);
      })
    );
  }

  create(appointment: Partial<Appointment>): Observable<Appointment> {
    return this.http.post<any>(this.baseUrl, appointment, { withCredentials: true }).pipe(
      map(apt => this.mapAppointmentResponse(apt))
    );
  }

  update(id: number, appointment: Partial<Appointment>): Observable<Appointment> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, appointment, { withCredentials: true }).pipe(
      map(apt => this.mapAppointmentResponse(apt))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  getByDoctor(doctorId: number): Observable<Appointment[]> {
    return this.http.get<any[]>(`${this.baseUrl}/doctors/${doctorId}`, { withCredentials: true }).pipe(
      map(appointments => appointments.map(apt => this.mapAppointmentResponse(apt)))
    );
  }

  getByPatient(patientId: number): Observable<Appointment[]> {
    return this.http.get<any[]>(`${this.baseUrl}/patients/${patientId}`, { withCredentials: true }).pipe(
      map(appointments => appointments.map(apt => this.mapAppointmentResponse(apt))),
      catchError(err => {
        console.warn('[AppointmentService] getByPatient API failed, using mock:', err);
        return this.mockService.getAll().pipe(
          map(apts => apts.filter(a => a.patientId === patientId))
        );
      })
    );
  }

  getByDateRange(startDate: string, endDate: string): Observable<Appointment[]> {
    return this.http.get<any[]>(`${this.baseUrl}/range?start=${startDate}&end=${endDate}`, { withCredentials: true }).pipe(
      map(appointments => appointments.map(apt => this.mapAppointmentResponse(apt)))
    );
  }

  // Calendar view methods
  getWeekView(weekStart: string, doctorId?: number): Observable<CalendarView> {
    if (this.useMock) {
      return this.mockService.getWeekView(weekStart, doctorId);
    }
    let params = new HttpParams().set('weekStart', weekStart);
    if (doctorId) {
      params = params.set('doctorId', doctorId.toString());
    }
    return this.http.get<any>(`${this.baseUrl}/calendar/week`, { params, withCredentials: true }).pipe(
      map(data => this.mapCalendarView(data)),
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.getWeekView(weekStart, doctorId);
      })
    );
  }

  getMonthView(monthStart: string, doctorId?: number): Observable<CalendarView> {
    let params = new HttpParams().set('monthStart', monthStart);
    if (doctorId) {
      params = params.set('doctorId', doctorId.toString());
    }
    return this.http.get<any>(`${this.baseUrl}/calendar/month`, { params, withCredentials: true }).pipe(
      map(data => this.mapCalendarView(data))
    );
  }

  getDayView(date: string, doctorId?: number): Observable<CalendarView> {
    let params = new HttpParams().set('date', date);
    if (doctorId) {
      params = params.set('doctorId', doctorId.toString());
    }
    return this.http.get<any>(`${this.baseUrl}/calendar/day`, { params, withCredentials: true }).pipe(
      map(data => this.mapCalendarView(data))
    );
  }

  getAvailableTimeSlots(date: string, doctorId?: number, slotDurationMinutes: number = 30): Observable<TimeSlot[]> {
    if (this.useMock) {
      return this.mockService.getAvailableTimeSlots(date, doctorId, slotDurationMinutes);
    }
    let params = new HttpParams()
      .set('date', date)
      .set('slotDurationMinutes', slotDurationMinutes.toString());
    if (doctorId) {
      params = params.set('doctorId', doctorId.toString());
    }
    return this.http.get<TimeSlot[]>(`${this.baseUrl}/calendar/available-slots`, { params, withCredentials: true }).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.getAvailableTimeSlots(date, doctorId, slotDurationMinutes);
      })
    );
  }

  checkAvailability(date: string, startTime: string, endTime: string, doctorId: number): Observable<boolean> {
    const params = new HttpParams()
      .set('date', date)
      .set('startTime', startTime)
      .set('endTime', endTime)
      .set('doctorId', doctorId.toString());
    return this.http.get<{ available: boolean }>(`${this.baseUrl}/calendar/check-availability`, { params, withCredentials: true }).pipe(
      map(response => response.available)
    );
  }

  private mapCalendarView(data: any): CalendarView {
    return {
      startDate: data.startDate,
      endDate: data.endDate,
      viewType: data.viewType,
      appointments: (data.appointments || []).map((apt: any) => this.mapAppointmentResponse(apt)),
      appointmentsByDate: data.appointmentsByDate ? 
        Object.keys(data.appointmentsByDate).reduce((acc: any, key: string) => {
          acc[key] = data.appointmentsByDate[key].map((apt: any) => this.mapAppointmentResponse(apt));
          return acc;
        }, {}) : undefined,
      availableSlots: data.availableSlots
    };
  }
}

