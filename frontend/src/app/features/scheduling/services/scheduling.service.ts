import { Injectable, inject } from '@angular/core';
import { Observable, of, catchError, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { SchedulingMockService } from './scheduling-mock.service';
import { SchedulingApiService } from './scheduling-api.service';
import { MasterDataService } from '../../../core/services/master-data.service';
import { PatientHeader, ProviderSchedule, AppointmentFormData, InsuranceSnapshot, AppointmentBlock, WaitlistItem, TimeBlock } from '../../appointment/models/appointment-scheduling.models';
import { Patient } from '../../../core/models/patient.model';
import { Doctor } from '../../../core/models/doctor.model';
import { Department } from '../../../core/models/department.model';
import { MasterDepartment } from '../../../core/models/master-data.model';
import { ScheduleGrid } from '../../../core/models/schedule-grid.model';
import { Appointment } from '../../../core/models/appointment.model';

/**
 * Unified scheduling service that switches between mock and API based on environment
 */
@Injectable({
  providedIn: 'root'
})
export class SchedulingService {
  private mockService = inject(SchedulingMockService);
  private apiService = inject(SchedulingApiService);
  private masterDataService = inject(MasterDataService);
  private http = inject(HttpClient);
  
  private useMock = (environment as any).useMock !== false; // Default to true if not set
  private apiUrl = (environment as any).apiUrl || '/api';

  getPatientHeader(patientId: number): Observable<PatientHeader> {
    return this.useMock 
      ? this.mockService.getPatientHeader(patientId)
      : this.apiService.getPatientHeader(patientId);
  }

  searchPatients(query: string): Observable<Patient[]> {
    return this.useMock
      ? this.mockService.searchPatients(query)
      : this.apiService.searchPatients(query);
  }

  getProviderSchedules(providerIds: number[], date: string): Observable<ProviderSchedule[]> {
    return this.useMock
      ? this.mockService.getProviderSchedules(providerIds, date)
      : this.apiService.getProviderSchedules(providerIds, date);
  }

  getProviders(): Observable<Doctor[]> {
    return this.useMock
      ? this.mockService.getProviders()
      : this.apiService.getProviders();
  }

  getDepartments(): Observable<Department[]> {
    // Always use MasterDataService for departments - it handles mock/API switching
    return this.masterDataService.getDepartments().pipe(
      map((masterDepts: MasterDepartment[]) => {
        // Convert MasterDepartment to Department format
        return masterDepts.map(dept => ({
          id: dept.id,
          departmentId: Number(dept.id) || undefined,
          name: dept.name,
          code: dept.code,
          description: dept.description,
          active: dept.active,
          status: dept.active ? 'ACTIVE' : 'INACTIVE',
          specialtyGroup: dept.specialtyGroup
        } as Department));
      }),
      catchError(err => {
        console.warn('MasterDataService failed for departments, using empty array:', err);
        return of([]);
      })
    );
  }

  getInsuranceSnapshot(patientId: number): Observable<InsuranceSnapshot> {
    return this.useMock
      ? this.mockService.getInsuranceSnapshot(patientId)
      : this.apiService.getInsuranceSnapshot(patientId);
  }

  saveAppointment(appointment: AppointmentFormData): Observable<any> {
    return this.useMock
      ? this.mockService.saveAppointment(appointment)
      : this.apiService.saveAppointment(appointment);
  }

  updateAppointment(appointmentId: number, appointment: AppointmentFormData): Observable<any> {
    return this.useMock
      ? this.mockService.saveAppointment({ ...appointment, appointmentId })
      : this.apiService.updateAppointment(appointmentId, appointment);
  }

  cancelAppointment(appointmentId: number, reason: string): Observable<void> {
    if (this.useMock) {
      return this.mockService.cancelAppointment(appointmentId, reason);
    }
    return this.apiService.cancelAppointment(appointmentId, reason).pipe(
      catchError(() => this.mockService.cancelAppointment(appointmentId, reason))
    );
  }

  /**
   * Update appointment status (Epic-style: cancel, no-show, check-in)
   */
  updateAppointmentStatus(appointmentId: number, status: string, reason?: string): Observable<any> {
    if (this.useMock) {
      // Mock implementation: just return success
      return of({ id: appointmentId, status, reason });
    }
    return this.apiService.updateAppointmentStatus(appointmentId, status, reason);
  }

  /**
   * Get visit types for quick book modal
   */
  getVisitTypes(): Observable<any[]> {
    if (this.useMock) {
      return of([
        { id: 1, name: 'Office Visit', durationMinutes: 15 },
        { id: 2, name: 'Follow-up', durationMinutes: 30 },
        { id: 3, name: 'Consultation', durationMinutes: 60 }
      ]);
    }
    return this.apiService.getVisitTypes();
  }

  getAppointmentsByRange(startDate: string, endDate: string, providerIds?: number[], roomIds?: number[]): Observable<AppointmentBlock[]> {
    if (this.useMock) {
      return this.mockService.getAppointmentsByRange(startDate, endDate, providerIds);
    }
    return this.apiService.getAppointmentsByRange(startDate, endDate, providerIds, roomIds).pipe(
      map((appointments: any[]) => {
        // Convert API response to AppointmentBlock format
        return appointments.map(apt => {
          // Handle startDateTime - backend sends LocalDateTime as ISO string
          let startDateTime = apt.startDateTime;
          if (!startDateTime && apt.startDatetime) {
            startDateTime = apt.startDatetime;
          }
          if (!startDateTime && apt.appointmentDate && apt.appointmentTime) {
            startDateTime = `${apt.appointmentDate}T${apt.appointmentTime}:00`;
          }
          
          // Handle endDateTime - backend sends LocalDateTime as ISO string or computes it
          let endDateTime = apt.endDateTime;
          if (!endDateTime && apt.endDatetime) {
            endDateTime = apt.endDatetime;
          }
          if (!endDateTime && startDateTime && apt.durationMinutes) {
            // Compute endDateTime from startDateTime + duration
            const start = new Date(startDateTime);
            const end = new Date(start.getTime() + apt.durationMinutes * 60000);
            endDateTime = end.toISOString();
          }
          
          // Map status from backend format to frontend format
          const statusMap: Record<string, string> = {
            'SCHEDULED': 'Schedule',
            'CONFIRMED': 'Confirmed',
            'ARRIVED': 'Arrived',
            'CHECKED_IN': 'Checked In',
            'CHECKED_OUT': 'Checked Out',
            'CANCELLED': 'Cancelled'
          };
          
          return {
            id: apt.id || apt.appointmentId,
            appointmentId: apt.id || apt.appointmentId,
            patientId: apt.patientId,
            providerId: apt.doctorId || apt.providerId,
            providerName: apt.doctorName || apt.providerName || '',
            patientName: apt.patientName || `${apt.patient?.firstName || ''} ${apt.patient?.lastName || ''}`.trim() || 'Unknown Patient',
            startDateTime: startDateTime || new Date().toISOString(),
            endDateTime: endDateTime || new Date().toISOString(),
            durationMinutes: apt.durationMinutes || 30,
            visitType: apt.visitType || 'Follow-up',
            status: statusMap[apt.status] || apt.status || 'Schedule',
            priority: apt.priority || 'NORMAL',
            departmentId: apt.departmentId,
            departmentName: apt.departmentName || apt.department?.name,
            reason: apt.reason || apt.visitReason,
            notes: apt.notes || apt.schedulingNotes
          } as AppointmentBlock;
        });
      }),
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.getAppointmentsByRange(startDate, endDate, providerIds);
      })
    );
  }

  moveAppointment(id: number, patch: { date?: string; startTime?: string; providerId?: number }): Observable<AppointmentBlock> {
    return this.useMock
      ? this.mockService.moveAppointment(id, patch)
      : this.apiService.moveAppointment(id, patch).pipe(
          map((response: any) => this.mapToAppointmentBlock(response)),
          catchError((err) => {
            // Re-throw to let component handle it
            throw err;
          })
        );
  }

  resizeAppointment(id: number, patch: { durationMinutes: number }): Observable<AppointmentBlock> {
    return this.useMock
      ? this.mockService.resizeAppointment(id, patch)
      : this.apiService.resizeAppointment(id, patch).pipe(
          map((response: any) => this.mapToAppointmentBlock(response)),
          catchError((err) => {
            // Re-throw to let component handle it
            throw err;
          })
        );
  }

  private mapToAppointmentBlock(dto: any): AppointmentBlock {
    return {
      id: dto.id,
      appointmentId: dto.id,
      patientId: dto.patientId,
      patientName: dto.patientName || 'Unknown Patient',
      providerId: dto.doctorId || dto.providerId,
      providerName: dto.doctorName || dto.providerName || 'Unknown Provider',
      departmentId: dto.departmentId,
      departmentName: dto.departmentName,
      startDateTime: dto.startAt || dto.startDateTime,
      endDateTime: dto.endAt || dto.endDateTime,
      durationMinutes: dto.durationMinutes,
      visitType: dto.visitType || 'Follow-up',
      status: dto.status || 'SCHEDULED',
      priority: dto.priority || 'NORMAL',
      notes: dto.notes,
      reason: dto.reason
    };
  }

  getWaitlist(): Observable<WaitlistItem[]> {
    // Always use mock service for now since API methods don't exist yet
    return this.mockService.getWaitlist();
  }

  createAppointmentFromWaitlist(waitlistItem: WaitlistItem, slot: { date: string; startTime: string; providerId: number }): Observable<AppointmentBlock> {
    // Always use mock service for now since API methods don't exist yet
    return this.mockService.createAppointmentFromWaitlist(waitlistItem, slot);
  }

  getTimeBlocks(providerId: number, date: string): Observable<TimeBlock[]> {
    // Always use mock service for now since API methods don't exist yet
    return this.mockService.getTimeBlocks(providerId, date);
  }

  // ---------- Additional methods for unified access ----------

  /**
   * Get rooms for schedule grid
   */
  getRooms(): Observable<any[]> {
    if (this.useMock) {
      // Return mock rooms
      return of([
        { id: 1, name: 'Room 101', locationId: 1 },
        { id: 2, name: 'Room 102', locationId: 1 },
        { id: 3, name: 'Room 201', locationId: 2 }
      ]);
    }
    return this.http.get<any[]>(`${this.apiUrl}/rooms`, { withCredentials: true }).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Get multi-provider schedule grid (for scheduler component)
   */
  getMultiProviderScheduleGrid(providerIds: number[], date: string): Observable<ScheduleGrid[]> {
    if (this.useMock) {
      // Use mock service to generate schedule grids
      return this.mockService.getProviderSchedules(providerIds, date).pipe(
        map((schedules: ProviderSchedule[]) => {
          // Convert ProviderSchedule[] to ScheduleGrid[]
          return schedules.map(schedule => ({
            providerId: schedule.providerId,
            providerName: schedule.providerName,
            scheduleDate: schedule.date,
            startTime: '07:00',
            endTime: '19:00',
            slotIntervalMinutes: 15,
            timeSlots: schedule.slots.map(slot => ({
              startTime: slot.startTime,
              endTime: slot.endTime,
              status: slot.status,
              colorCode: slot.status === 'BOOKED' ? 'blue' : slot.status === 'BLOCKED' ? 'red' : 'green',
              appointment: slot.appointmentId ? {
                appointmentId: slot.appointmentId,
                appointmentCode: slot.appointmentCode || '',
                patientId: 0,
                patientName: slot.patientName || '',
                visitType: slot.visitType,
                durationMinutes: 30,
                status: 'Schedule'
              } : undefined,
              isSelectable: slot.isSelectable
            }))
          } as ScheduleGrid));
        })
      );
    }
    const ids = providerIds.join(',');
    return this.http.get<ScheduleGrid[]>(`${this.apiUrl}/schedule-grid/providers/date/${date}?providerIds=${ids}`, { withCredentials: true }).pipe(
      catchError(() => {
        // Fallback to mock on error
        return this.getMultiProviderScheduleGrid(providerIds, date);
      })
    );
  }

  /**
   * Get appointment by ID
   */
  getAppointmentById(appointmentId: number): Observable<Appointment> {
    return this.useMock
      ? (this.mockService as any).getAppointmentById(appointmentId)
      : (this.apiService as any).getAppointmentById(appointmentId);
  }
}

