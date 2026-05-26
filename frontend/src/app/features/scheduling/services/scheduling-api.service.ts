import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PatientHeader, ProviderSchedule, AppointmentFormData, InsuranceSnapshot } from '../../appointment/models/appointment-scheduling.models';
import { Patient } from '../../../core/models/patient.model';
import { Doctor } from '../../../core/models/doctor.model';
import { Department } from '../../../core/models/department.model';

/**
 * Scheduling API Service
 * 
 * Provides a centralized service for all scheduling-related API calls.
 * Handles appointment creation, updates, cancellation, and scheduling queries.
 * 
 * @example
 * ```typescript
 * constructor(private schedulingApi: SchedulingApiService) {}
 * 
 * this.schedulingApi.getPatientHeader(patientId).subscribe(header => {
 *   // Use patient header data
 * });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class SchedulingApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  /**
   * Get patient header information for scheduling context
   * @param patientId - The patient identifier
   * @returns Observable of patient header data
   */
  getPatientHeader(patientId: number): Observable<PatientHeader> {
    if (!patientId || patientId <= 0) {
      throw new Error('Invalid patient ID provided');
    }
    return this.http.get<PatientHeader>(`${this.baseUrl}/scheduling/patient/${patientId}/header`, { withCredentials: true });
  }

  /**
   * Search for patients by query string
   * @param query - Search query (name, MRN, etc.)
   * @returns Observable of matching patients
   */
  searchPatients(query: string): Observable<Patient[]> {
    if (!query || query.trim().length === 0) {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }
    const params = new HttpParams().set('q', query.trim());
    return this.http.get<Patient[]>(`${this.baseUrl}/patients/search`, { params, withCredentials: true });
  }

  /**
   * Get provider schedules for specified providers and date
   * @param providerIds - Array of provider IDs
   * @param date - Date string in YYYY-MM-DD format
   * @returns Observable of provider schedules
   */
  getProviderSchedules(providerIds: number[], date: string): Observable<ProviderSchedule[]> {
    if (!providerIds || providerIds.length === 0) {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }
    return this.http.post<ProviderSchedule[]>(`${this.baseUrl}/scheduling/provider-schedules`, {
      providerIds,
      date
    }, { withCredentials: true });
  }

  /**
   * Get all available providers
   * @returns Observable of all providers
   */
  getProviders(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.baseUrl}/doctors`, { withCredentials: true });
  }

  /**
   * Get all departments
   * @returns Observable of all departments
   */
  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.baseUrl}/departments`, { withCredentials: true });
  }

  /**
   * Get insurance snapshot for a patient
   * @param patientId - The patient identifier
   * @returns Observable of insurance snapshot data
   */
  getInsuranceSnapshot(patientId: number): Observable<InsuranceSnapshot> {
    if (!patientId || patientId <= 0) {
      throw new Error('Invalid patient ID provided');
    }
    return this.http.get<InsuranceSnapshot>(`${this.baseUrl}/scheduling/patient/${patientId}/insurance`, { withCredentials: true });
  }

  /**
   * Create a new appointment
   * @param appointment - Appointment form data
   * @returns Observable of created appointment
   */
  saveAppointment(appointment: AppointmentFormData): Observable<any> {
    this.validateAppointmentData(appointment);
    const appointmentDto = this.mapToAppointmentDto(appointment);
    return this.http.post(`${this.baseUrl}/appointments`, appointmentDto, { withCredentials: true });
  }

  /**
   * Update an existing appointment
   * @param appointmentId - The appointment identifier
   * @param appointment - Updated appointment form data
   * @returns Observable of updated appointment
   */
  updateAppointment(appointmentId: number, appointment: AppointmentFormData): Observable<any> {
    if (!appointmentId || appointmentId <= 0) {
      throw new Error('Invalid appointment ID provided');
    }
    this.validateAppointmentData(appointment);
    const appointmentDto = this.mapToAppointmentDto(appointment);
    return this.http.put(`${this.baseUrl}/appointments/${appointmentId}`, appointmentDto, { withCredentials: true });
  }

  /**
   * Cancel an appointment
   * @param appointmentId - The appointment identifier
   * @param reason - Cancellation reason
   * @returns Observable that completes when cancellation is successful
   */
  cancelAppointment(appointmentId: number, reason: string): Observable<void> {
    if (!appointmentId || appointmentId <= 0) {
      throw new Error('Invalid appointment ID provided');
    }
    if (!reason || reason.trim().length === 0) {
      throw new Error('Cancellation reason is required');
    }
    return this.http.put<void>(`${this.baseUrl}/scheduling/appointments/${appointmentId}/cancel`, { 
      reason: reason.trim() 
    }, { withCredentials: true });
  }

  /**
   * Update appointment status (Epic-style: cancel, no-show, check-in)
   * @param appointmentId - The appointment identifier
   * @param status - New status (CANCELLED, NO_SHOW, CHECKED_IN, etc.)
   * @param reason - Optional reason for status change
   * @returns Observable of updated appointment
   */
  updateAppointmentStatus(appointmentId: number, status: string, reason?: string): Observable<any> {
    if (!appointmentId || appointmentId <= 0) {
      throw new Error('Invalid appointment ID provided');
    }
    if (!status || status.trim().length === 0) {
      throw new Error('Status is required');
    }
    const body: any = { status: status.trim() };
    if (reason && reason.trim().length > 0) {
      body.reason = reason.trim();
    }
    return this.http.patch<any>(`${this.baseUrl}/appointments/${appointmentId}/status`, body, { withCredentials: true });
  }

  /**
   * Get visit types for quick book modal
   * @returns Observable of visit types
   */
  getVisitTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/visit-types`, { withCredentials: true });
  }

  /**
   * Get appointment by ID
   * @param id - The appointment identifier
   * @returns Observable of appointment data
   */
  getAppointmentById(id: number): Observable<any> {
    if (!id || id <= 0) {
      throw new Error('Invalid appointment ID provided');
    }
    return this.http.get<any>(`${this.baseUrl}/appointments/${id}`, { withCredentials: true });
  }

  /**
   * Get appointments within a date range
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   * @param providerIds - Optional array of provider IDs to filter by
   * @param roomIds - Optional array of room IDs to filter by
   * @returns Observable of appointments array
   */
  getAppointmentsByRange(startDate: string, endDate: string, providerIds?: number[], roomIds?: number[]): Observable<any[]> {
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }
    
    let params = new HttpParams()
      .set('start', startDate)
      .set('end', endDate);
    
    if (providerIds && providerIds.length > 0) {
      params = params.set('doctorIds', providerIds.join(','));
    }
    
    if (roomIds && roomIds.length > 0) {
      params = params.set('roomIds', roomIds.join(','));
    }
    
    return this.http.get<any[]>(`${this.baseUrl}/appointments/range`, { params, withCredentials: true });
  }

  /**
   * Move an appointment to a new date/time or provider
   * @param id - The appointment identifier
   * @param patch - Partial update data (date, startTime, providerId)
   * @returns Observable of updated appointment
   */
  moveAppointment(id: number, patch: { date?: string; startTime?: string; providerId?: number }): Observable<any> {
    if (!id || id <= 0) {
      throw new Error('Invalid appointment ID provided');
    }
    
    const request: any = {};
    
    if (patch.date && patch.startTime) {
      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(patch.date)) {
        throw new Error('Invalid date format. Expected YYYY-MM-DD');
      }
      // Validate time format
      if (!/^\d{2}:\d{2}$/.test(patch.startTime)) {
        throw new Error('Invalid time format. Expected HH:mm');
      }
      // Create ISO-8601 format: YYYY-MM-DDTHH:mm:ss
      request.startAt = `${patch.date}T${patch.startTime}:00`;
    } else if (patch.date || patch.startTime) {
      throw new Error('Both date and startTime must be provided together');
    }
    
    if (patch.providerId) {
      if (patch.providerId <= 0) {
        throw new Error('Invalid provider ID');
      }
      request.doctorId = patch.providerId;
    }
    
    if (Object.keys(request).length === 0) {
      throw new Error('At least one field (date/time or providerId) must be provided');
    }
    
    return this.http.put<any>(`${this.baseUrl}/appointments/${id}/move`, request, { withCredentials: true });
  }

  /**
   * Resize an appointment (change duration)
   * @param id - The appointment identifier
   * @param patch - Duration update data
   * @returns Observable of updated appointment
   */
  resizeAppointment(id: number, patch: { durationMinutes: number }): Observable<any> {
    if (!id || id <= 0) {
      throw new Error('Invalid appointment ID provided');
    }
    if (!patch.durationMinutes || patch.durationMinutes <= 0) {
      throw new Error('Duration must be a positive number');
    }
    return this.http.put<any>(`${this.baseUrl}/appointments/${id}/resize`, {
      durationMinutes: patch.durationMinutes
    }, { withCredentials: true });
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Validate appointment form data
   * @private
   */
  private validateAppointmentData(appointment: AppointmentFormData): void {
    if (!appointment.patientId || appointment.patientId <= 0) {
      throw new Error('Valid patient ID is required');
    }
    if (!appointment.providerId || appointment.providerId <= 0) {
      throw new Error('Valid provider ID is required');
    }
    if (!appointment.appointmentDate || !/^\d{4}-\d{2}-\d{2}$/.test(appointment.appointmentDate)) {
      throw new Error('Valid appointment date (YYYY-MM-DD) is required');
    }
    if (!appointment.appointmentTime || !/^\d{2}:\d{2}$/.test(appointment.appointmentTime)) {
      throw new Error('Valid appointment time (HH:mm) is required');
    }
    if (!appointment.durationMinutes || appointment.durationMinutes <= 0) {
      throw new Error('Valid duration (positive number) is required');
    }
  }

  /**
   * Map AppointmentFormData to backend AppointmentDto format
   * @private
   */
  private mapToAppointmentDto(appointment: AppointmentFormData): any {
    const appointmentDate = appointment.appointmentDate!;
    const appointmentTime = appointment.appointmentTime!;
    // Create ISO-8601 format: YYYY-MM-DDTHH:mm:ss (LocalDateTime format, no timezone)
    // Spring Boot Jackson will deserialize this to LocalDateTime automatically
    const startDateTime = `${appointmentDate}T${appointmentTime}:00`;
    
    return {
      patientId: appointment.patientId,
      doctorId: appointment.providerId, // Map providerId to doctorId
      departmentId: appointment.departmentId || null,
      startDateTime: startDateTime, // ISO-8601 format: "2024-01-15T09:00:00"
      durationMinutes: appointment.durationMinutes,
      visitTypeId: null, // TODO: Map visitType string to visitTypeId if needed
      visitType: appointment.visitType || null,
      status: appointment.status || 'SCHEDULED',
      priority: 'NORMAL', // Default priority, can be enhanced later
      reason: appointment.visitReason || null,
      notes: appointment.schedulingNotes || null,
      locationId: null // TODO: Map location string to locationId if needed
    };
  }
}

