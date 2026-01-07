import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Encounter } from '../models/encounter.model';
import { EncounterMockService } from './encounter-mock.service';

@Injectable({
  providedIn: 'root'
})
export class EncounterService {
  private http = inject(HttpClient);
  private mockService = inject(EncounterMockService);
  private apiUrl = '/api/encounters';
  private useMock = environment.useMock !== false;

  create(encounter: Encounter): Observable<Encounter> {
    if (this.useMock) {
      return this.mockService.create(encounter);
    }
    return this.http.post<Encounter>(this.apiUrl, encounter).pipe(
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
    return this.http.put<Encounter>(`${this.apiUrl}/${id}`, encounter).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.update(id, encounter);
      })
    );
  }

  get(id: number): Observable<Encounter> {
    if (this.useMock) {
      return this.mockService.get(id);
    }
    return this.http.get<Encounter>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.get(id);
      })
    );
  }

  getByEncounterNumber(encounterNumber: string): Observable<Encounter> {
    if (this.useMock) {
      return this.mockService.get(1); // Mock fallback
    }
    return this.http.get<Encounter>(`${this.apiUrl}/number/${encounterNumber}`).pipe(
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
    return this.http.get<Encounter[]>(this.apiUrl).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.getAll();
      })
    );
  }

  getByPatientId(patientId: number): Observable<Encounter[]> {
    if (this.useMock) {
      return this.mockService.getByPatientId(patientId);
    }
    return this.http.get<Encounter[]>(`${this.apiUrl}/patient/${patientId}`).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.getByPatientId(patientId);
      })
    );
  }

  createFromAppointment(appointmentId: number): Observable<Encounter> {
    if (this.useMock) {
      return this.mockService.createFromAppointment(appointmentId);
    }
    return this.http.post<Encounter>(`${this.apiUrl}/from-appointment/${appointmentId}`, {}).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.createFromAppointment(appointmentId);
      })
    );
  }

  getByAppointmentId(appointmentId: number): Observable<Encounter[]> {
    return this.http.get<Encounter[]>(`${this.apiUrl}/appointment/${appointmentId}`);
  }

  checkIn(encounterId: number, staffId: number): Observable<Encounter> {
    return this.http.patch<Encounter>(`${this.apiUrl}/${encounterId}/check-in?staffId=${staffId}`, {});
  }

  checkOut(encounterId: number, staffId: number): Observable<Encounter> {
    return this.http.patch<Encounter>(`${this.apiUrl}/${encounterId}/check-out?staffId=${staffId}`, {});
  }

  completeRegistration(encounterId: number, staffId: number): Observable<Encounter> {
    return this.http.patch<Encounter>(`${this.apiUrl}/${encounterId}/complete-registration?staffId=${staffId}`, {});
  }
}

