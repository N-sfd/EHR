import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Rooming } from '../models/ambulatory.model';
import { RoomingMockService } from './rooming-mock.service';

@Injectable({
  providedIn: 'root'
})
export class RoomingService {
  private http = inject(HttpClient);
  private mockService = inject(RoomingMockService);
  private apiUrl = '/api/rooming';
  private useMock = environment.useMock !== false;

  create(rooming: Rooming): Observable<Rooming> {
    if (this.useMock) {
      return this.mockService.create(rooming);
    }
    return this.http.post<Rooming>(this.apiUrl, rooming).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.create(rooming);
      })
    );
  }

  update(id: number, rooming: Rooming): Observable<Rooming> {
    if (this.useMock) {
      return this.mockService.update(id, rooming);
    }
    return this.http.put<Rooming>(`${this.apiUrl}/${id}`, rooming).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.update(id, rooming);
      })
    );
  }

  get(id: number): Observable<Rooming> {
    if (this.useMock) {
      return this.mockService.get(id);
    }
    return this.http.get<Rooming>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.get(id);
      })
    );
  }

  getByEncounterId(encounterId: number): Observable<Rooming> {
    if (this.useMock) {
      return this.mockService.getByEncounterId(encounterId);
    }
    return this.http.get<Rooming>(`${this.apiUrl}/encounter/${encounterId}`).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.getByEncounterId(encounterId);
      })
    );
  }

  getByAppointmentId(appointmentId: number): Observable<Rooming> {
    return this.http.get<Rooming>(`${this.apiUrl}/appointment/${appointmentId}`);
  }

  complete(id: number): Observable<Rooming> {
    return this.http.patch<Rooming>(`${this.apiUrl}/${id}/complete`, {});
  }
}

