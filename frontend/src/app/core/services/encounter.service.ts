import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Encounter } from '../models/encounter.model';
import { EncounterMockService } from './encounter-mock.service';

@Injectable({
  providedIn: 'root'
})
export class EncounterService {
  private http = inject(HttpClient);
  private mockService = inject(EncounterMockService);
  private apiUrl = '/api/clinical/encounters';
  private useMock = environment.useMock !== false;

  create(encounter: Encounter): Observable<Encounter> {
    if (this.useMock) {
      return this.mockService.create(encounter);
    }
    return this.http.post<Encounter>(this.apiUrl, encounter, { withCredentials: true }).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.create(encounter);
      })
    );
  }

  update(id: number, encounter: Encounter): Observable<Encounter> {
    if (this.useMock) {
      return this.mockService.update(id, encounter);
    }
    // Backend returns ApiResponse wrapper, extract data
    return this.http.put<{ success: boolean; data: Encounter; message: string }>(`${this.apiUrl}/${id}`, encounter, { withCredentials: true }).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.update(id, encounter);
      }),
      // Map to extract data from ApiResponse
      map(response => (response as any).data || response)
    );
  }

  get(id: number): Observable<Encounter> {
    if (this.useMock) {
      return this.mockService.get(id);
    }
    // Backend returns ApiResponse wrapper, extract data
    return this.http.get<{ success: boolean; data: Encounter; message: string }>(`${this.apiUrl}/${id}`, { withCredentials: true }).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.get(id);
      }),
      // Map to extract data from ApiResponse
      map(response => (response as any).data || response)
    );
  }

  getByEncounterNumber(encounterNumber: string): Observable<Encounter> {
    if (this.useMock) {
      return this.mockService.get(1); // Mock fallback
    }
    return this.http.get<Encounter>(`${this.apiUrl}/number/${encounterNumber}`, { withCredentials: true }).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.get(1);
      })
    );
  }

  getAll(): Observable<Encounter[]> {
    if (this.useMock) {
      return this.mockService.getAll();
    }
    // Backend returns ApiResponse wrapper, extract data array
    return this.http.get<{ success: boolean; data: Encounter[]; message: string }>(this.apiUrl, { withCredentials: true }).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.getAll();
      }),
      // Map to extract data array from ApiResponse
      map(response => (response as any).data || (Array.isArray(response) ? response : []))
    );
  }

  getByPatientId(patientId: number): Observable<Encounter[]> {
    if (this.useMock) {
      return this.mockService.getByPatientId(patientId);
    }
    // Backend returns ApiResponse wrapper, extract data array
    return this.http.get<{ success: boolean; data: Encounter[]; message: string }>(`${this.apiUrl}/patient/${patientId}`, { withCredentials: true }).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.getByPatientId(patientId);
      }),
      // Map to extract data array from ApiResponse
      map(response => (response as any).data || (Array.isArray(response) ? response : []))
    );
  }

  createFromAppointment(appointmentId: number): Observable<Encounter> {
    if (this.useMock) {
      return this.mockService.createFromAppointment(appointmentId);
    }
    // Backend returns ApiResponse wrapper, extract data
    return this.http.post<{ success: boolean; data: Encounter; message: string }>(`${this.apiUrl}/from-appointment/${appointmentId}`, {}, { withCredentials: true }).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.createFromAppointment(appointmentId);
      }),
      // Map to extract data from ApiResponse
      map(response => (response as any).data || response)
    );
  }

  /**
   * Get encounter by appointment ID
   * @param appointmentId The appointment ID
   * @returns Observable of Encounter or null if not found
   */
  getByAppointmentId(appointmentId: number): Observable<Encounter | null> {
    if (this.useMock) {
      return this.mockService.getByAppointmentId(appointmentId);
    }
    // Backend returns ApiResponse wrapper, extract data
    return this.http.get<{ success: boolean; data: Encounter | null; message: string }>(`${this.apiUrl}/appointment/${appointmentId}`, { withCredentials: true }).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.getByAppointmentId(appointmentId);
      }),
      // Map to extract data from ApiResponse
      map(response => (response as any).data || null)
    );
  }

  checkIn(encounterId: number, staffId: number): Observable<Encounter> {
    return this.http.patch<Encounter>(`${this.apiUrl}/${encounterId}/check-in?staffId=${staffId}`, {}, { withCredentials: true });
  }

  checkOut(encounterId: number, staffId: number): Observable<Encounter> {
    return this.http.patch<Encounter>(`${this.apiUrl}/${encounterId}/check-out?staffId=${staffId}`, {}, { withCredentials: true });
  }

  completeRegistration(encounterId: number, staffId: number): Observable<Encounter> {
    return this.http.patch<Encounter>(`${this.apiUrl}/${encounterId}/complete-registration?staffId=${staffId}`, {}, { withCredentials: true });
  }

  updateStatus(encounterId: number, status: string): Observable<Encounter> {
    if (this.useMock) {
      return this.mockService.update(encounterId, { status } as Encounter);
    }
    // Backend returns ApiResponse wrapper, extract data
    return this.http.patch<{ success: boolean; data: Encounter; message: string }>(`${this.apiUrl}/${encounterId}/status?status=${encodeURIComponent(status)}`, {}, { withCredentials: true }).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.update(encounterId, { status } as Encounter);
      }),
      // Map to extract data from ApiResponse
      map(response => (response as any).data || response)
    );
  }
}

