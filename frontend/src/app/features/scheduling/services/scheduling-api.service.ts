import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PatientHeader, ProviderSchedule, AppointmentFormData, InsuranceSnapshot } from '../models/scheduling.model';
import { Patient } from '../../../core/models/patient.model';
import { Doctor } from '../../../core/models/doctor.model';
import { Department } from '../../../core/models/department.model';

@Injectable({
  providedIn: 'root'
})
export class SchedulingApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api';

  getPatientHeader(patientId: number): Observable<PatientHeader> {
    return this.http.get<PatientHeader>(`${this.baseUrl}/scheduling/patient/${patientId}/header`);
  }

  searchPatients(query: string): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.baseUrl}/patients/search`, {
      params: { q: query }
    });
  }

  getProviderSchedules(providerIds: number[], date: string): Observable<ProviderSchedule[]> {
    return this.http.post<ProviderSchedule[]>(`${this.baseUrl}/scheduling/provider-schedules`, {
      providerIds,
      date
    });
  }

  getProviders(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.baseUrl}/doctors`);
  }

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.baseUrl}/departments`);
  }

  getInsuranceSnapshot(patientId: number): Observable<InsuranceSnapshot> {
    return this.http.get<InsuranceSnapshot>(`${this.baseUrl}/scheduling/patient/${patientId}/insurance`);
  }

  saveAppointment(appointment: AppointmentFormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/appointments`, appointment);
  }

  updateAppointment(appointmentId: number, appointment: AppointmentFormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/appointments/${appointmentId}`, appointment);
  }

  cancelAppointment(appointmentId: number, reason: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/appointments/${appointmentId}/cancel`, { reason });
  }
}

