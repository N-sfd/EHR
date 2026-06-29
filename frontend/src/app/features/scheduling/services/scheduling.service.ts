import { Injectable, inject } from '@angular/core';
import { Observable, of, catchError, map, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { SchedulingApiService } from './scheduling-api.service';
import { MasterDataService } from '../../../core/services/master-data.service';
import { PatientHeader, ProviderSchedule, AppointmentFormData, InsuranceSnapshot, AppointmentBlock, WaitlistItem, TimeBlock } from '../../appointment/models/appointment-scheduling.models';
import { Patient } from '../../../core/models/patient.model';
import { Doctor } from '../../../core/models/doctor.model';
import { Department } from '../../../core/models/department.model';
import { MasterDepartment } from '../../../core/models/master-data.model';
import { ScheduleGrid } from '../../../core/models/schedule-grid.model';
import { Appointment } from '../../../core/models/appointment.model';

/** Scheduling facade — all calls go to the backend API. */
@Injectable({
  providedIn: 'root'
})
export class SchedulingService {
  private apiService = inject(SchedulingApiService);
  private masterDataService = inject(MasterDataService);
  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl || '/api';

  getPatientHeader(patientId: number): Observable<PatientHeader> {
    return this.apiService.getPatientHeader(patientId);
  }

  searchPatients(query: string): Observable<Patient[]> {
    return this.apiService.searchPatients(query);
  }

  getProviderSchedules(providerIds: number[], date: string): Observable<ProviderSchedule[]> {
    return this.apiService.getProviderSchedules(providerIds, date);
  }

  getProviders(): Observable<Doctor[]> {
    return this.apiService.getProviders();
  }

  getDepartments(): Observable<Department[]> {
    return this.masterDataService.getDepartments().pipe(
      map((masterDepts: MasterDepartment[]) =>
        masterDepts.map(dept => ({
          id: dept.id,
          departmentId: Number(dept.id) || undefined,
          name: dept.name,
          code: dept.code,
          description: dept.description,
          active: dept.active,
          status: dept.active ? 'ACTIVE' : 'INACTIVE',
          specialtyGroup: dept.specialtyGroup
        } as Department))
      ),
      catchError(() => of([]))
    );
  }

  getInsuranceSnapshot(patientId: number): Observable<InsuranceSnapshot> {
    return this.apiService.getInsuranceSnapshot(patientId);
  }

  saveAppointment(appointment: AppointmentFormData): Observable<any> {
    return this.apiService.saveAppointment(appointment);
  }

  updateAppointment(appointmentId: number, appointment: AppointmentFormData): Observable<any> {
    return this.apiService.updateAppointment(appointmentId, appointment);
  }

  cancelAppointment(appointmentId: number, reason: string): Observable<void> {
    return this.apiService.cancelAppointment(appointmentId, reason);
  }

  updateAppointmentStatus(appointmentId: number, status: string, reason?: string): Observable<unknown> {
    return this.apiService.updateAppointmentStatus(appointmentId, status, reason);
  }

  getVisitTypes(): Observable<unknown[]> {
    return this.apiService.getVisitTypes();
  }

  getAppointmentsByRange(startDate: string, endDate: string, providerIds?: number[], roomIds?: number[]): Observable<AppointmentBlock[]> {
    return this.apiService.getAppointmentsByRange(startDate, endDate, providerIds, roomIds).pipe(
      map((appointments: unknown[]) => (appointments as Record<string, unknown>[]).map(apt => this.mapApiAppointmentToBlock(apt))),
      catchError(err => throwError(() => err))
    );
  }

  moveAppointment(id: number, patch: { date?: string; startTime?: string; providerId?: number }): Observable<AppointmentBlock> {
    return this.apiService.moveAppointment(id, patch).pipe(
      map((response: unknown) => this.mapToAppointmentBlock(response))
    );
  }

  resizeAppointment(id: number, patch: { durationMinutes: number }): Observable<AppointmentBlock> {
    return this.apiService.resizeAppointment(id, patch).pipe(
      map((response: unknown) => this.mapToAppointmentBlock(response))
    );
  }

  getWaitlist(): Observable<WaitlistItem[]> {
    return of([]);
  }

  createAppointmentFromWaitlist(_waitlistItem: WaitlistItem, _slot: { date: string; startTime: string; providerId: number }): Observable<AppointmentBlock> {
    return throwError(() => new Error('Waitlist booking is not available'));
  }

  getTimeBlocks(_providerId: number, _date: string): Observable<TimeBlock[]> {
    return of([]);
  }

  getRooms(): Observable<Array<{ id: number; name: string; locationId?: number }>> {
    return this.http.get<Array<{ id: number; name: string; locationId?: number }>>(`${this.apiUrl}/rooms`, { withCredentials: true }).pipe(
      catchError(() => of([]))
    );
  }

  getMultiProviderScheduleGrid(providerIds: number[], date: string): Observable<ScheduleGrid[]> {
    const ids = providerIds.join(',');
    return this.http.get<ScheduleGrid[]>(
      `${this.apiUrl}/schedule-grid/providers/date/${date}?providerIds=${ids}`,
      { withCredentials: true }
    ).pipe(catchError(() => of([])));
  }

  getAppointmentById(appointmentId: number): Observable<Appointment> {
    return (this.apiService as { getAppointmentById(id: number): Observable<Appointment> }).getAppointmentById(appointmentId);
  }

  private mapApiAppointmentToBlock(apt: Record<string, unknown>): AppointmentBlock {
    let startDateTime = apt['startDateTime'] as string | undefined;
    if (!startDateTime && apt['startDatetime']) {
      startDateTime = apt['startDatetime'] as string;
    }
    if (!startDateTime && apt['appointmentDate'] && apt['appointmentTime']) {
      startDateTime = `${apt['appointmentDate']}T${apt['appointmentTime']}:00`;
    }

    let endDateTime = apt['endDateTime'] as string | undefined;
    if (!endDateTime && apt['endDatetime']) {
      endDateTime = apt['endDatetime'] as string;
    }
    if (!endDateTime && startDateTime && apt['durationMinutes']) {
      const start = new Date(startDateTime);
      const end = new Date(start.getTime() + (apt['durationMinutes'] as number) * 60000);
      endDateTime = end.toISOString();
    }

    const statusMap: Record<string, string> = {
      SCHEDULED: 'Schedule',
      CONFIRMED: 'Confirmed',
      ARRIVED: 'Arrived',
      CHECKED_IN: 'Checked In',
      CHECKED_OUT: 'Checked Out',
      CANCELLED: 'Cancelled'
    };
    const patient = apt['patient'] as { firstName?: string; lastName?: string } | undefined;

    return {
      id: (apt['id'] ?? apt['appointmentId']) as number,
      appointmentId: (apt['id'] ?? apt['appointmentId']) as number,
      patientId: apt['patientId'] as number,
      providerId: (apt['doctorId'] ?? apt['providerId']) as number,
      providerName: (apt['doctorName'] ?? apt['providerName'] ?? '') as string,
      patientName: (apt['patientName'] as string) || `${patient?.firstName ?? ''} ${patient?.lastName ?? ''}`.trim() || 'Unknown Patient',
      startDateTime: startDateTime || new Date().toISOString(),
      endDateTime: endDateTime || new Date().toISOString(),
      durationMinutes: (apt['durationMinutes'] as number) || 30,
      visitType: (apt['visitType'] as string) || 'Follow-up',
      status: statusMap[apt['status'] as string] || (apt['status'] as string) || 'Schedule',
      priority: (apt['priority'] as string) || 'NORMAL',
      departmentId: apt['departmentId'] as number | undefined,
      departmentName: (apt['departmentName'] as string) || (apt['department'] as { name?: string })?.name,
      reason: (apt['reason'] ?? apt['visitReason']) as string | undefined,
      notes: (apt['notes'] ?? apt['schedulingNotes']) as string | undefined
    } as AppointmentBlock;
  }

  private mapToAppointmentBlock(dto: unknown): AppointmentBlock {
    const d = dto as Record<string, unknown>;
    return {
      id: d['id'] as number,
      appointmentId: d['id'] as number,
      patientId: d['patientId'] as number,
      patientName: (d['patientName'] as string) || 'Unknown Patient',
      providerId: (d['doctorId'] ?? d['providerId']) as number,
      providerName: (d['doctorName'] ?? d['providerName'] ?? 'Unknown Provider') as string,
      departmentId: d['departmentId'] as number | undefined,
      departmentName: d['departmentName'] as string | undefined,
      startDateTime: (d['startAt'] ?? d['startDateTime']) as string,
      endDateTime: (d['endAt'] ?? d['endDateTime']) as string,
      durationMinutes: d['durationMinutes'] as number,
      visitType: (d['visitType'] as string) || 'Follow-up',
      status: (d['status'] as string) || 'SCHEDULED',
      priority: (d['priority'] as string) || 'NORMAL',
      notes: d['notes'] as string | undefined,
      reason: d['reason'] as string | undefined
    } as AppointmentBlock;
  }
}
