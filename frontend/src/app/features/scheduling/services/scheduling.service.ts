import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SchedulingMockService } from './scheduling-mock.service';
import { SchedulingApiService } from './scheduling-api.service';
import { PatientHeader, ProviderSchedule, AppointmentFormData, InsuranceSnapshot } from '../models/scheduling.model';
import { Patient } from '../../../core/models/patient.model';
import { Doctor } from '../../../core/models/doctor.model';
import { Department } from '../../../core/models/department.model';

/**
 * Unified scheduling service that switches between mock and API based on environment
 */
@Injectable({
  providedIn: 'root'
})
export class SchedulingService {
  private mockService = inject(SchedulingMockService);
  private apiService = inject(SchedulingApiService);
  
  private useMock = (environment as any).useMock !== false; // Default to true if not set

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
    return this.useMock
      ? this.mockService.getDepartments()
      : this.apiService.getDepartments();
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
      return new Observable(observer => {
        observer.next();
        observer.complete();
      });
    }
    return this.apiService.cancelAppointment(appointmentId, reason);
  }
}

