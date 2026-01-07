import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ProviderEncounter } from '../models/ambulatory.model';
import { ProviderEncounterMockService } from './provider-encounter-mock.service';

@Injectable({
  providedIn: 'root'
})
export class ProviderEncounterService {
  private http = inject(HttpClient);
  private mockService = inject(ProviderEncounterMockService);
  private apiUrl = '/api/provider-encounters';
  private useMock = environment.useMock !== false;

  create(encounter: ProviderEncounter): Observable<ProviderEncounter> {
    if (this.useMock) {
      return this.mockService.create(encounter);
    }
    return this.http.post<ProviderEncounter>(this.apiUrl, encounter).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.create(encounter);
      })
    );
  }

  update(id: number, encounter: ProviderEncounter): Observable<ProviderEncounter> {
    if (this.useMock) {
      return this.mockService.update(id, encounter);
    }
    return this.http.put<ProviderEncounter>(`${this.apiUrl}/${id}`, encounter).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.update(id, encounter);
      })
    );
  }

  get(id: number): Observable<ProviderEncounter> {
    if (this.useMock) {
      return this.mockService.get(id);
    }
    return this.http.get<ProviderEncounter>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.get(id);
      })
    );
  }

  getByEncounterId(encounterId: number): Observable<ProviderEncounter> {
    if (this.useMock) {
      return this.mockService.getByEncounterId(encounterId);
    }
    return this.http.get<ProviderEncounter>(`${this.apiUrl}/encounter/${encounterId}`).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.getByEncounterId(encounterId);
      })
    );
  }

  sign(id: number, staffId: number): Observable<ProviderEncounter> {
    if (this.useMock) {
      return this.mockService.sign(id, staffId);
    }
    return this.http.patch<ProviderEncounter>(`${this.apiUrl}/${id}/sign?staffId=${staffId}`, {}).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.sign(id, staffId);
      })
    );
  }

  complete(id: number): Observable<ProviderEncounter> {
    return this.http.patch<ProviderEncounter>(`${this.apiUrl}/${id}/complete`, {});
  }
}

