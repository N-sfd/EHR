import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ProviderTemplate } from '../models/admin.model';
import { ProviderTemplatesMockService } from './provider-templates-mock.service';

@Injectable({
  providedIn: 'root'
})
export class ProviderTemplatesService {
  private apiUrl = '/api/admin/provider-templates';
  private useMock = true; // Always use mock for now, can be configured via environment
  private http = inject(HttpClient);
  private mockService = inject(ProviderTemplatesMockService);

  getByProvider(providerId: number): Observable<ProviderTemplate> {
    if (this.useMock) {
      return this.mockService.getByProvider(providerId);
    }

    return this.http.get<ProviderTemplate>(`${this.apiUrl}/${providerId}`).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.getByProvider(providerId);
      })
    );
  }

  save(providerId: number, template: ProviderTemplate): Observable<ProviderTemplate> {
    if (this.useMock) {
      return this.mockService.save(providerId, template);
    }

    return this.http.post<ProviderTemplate>(`${this.apiUrl}/${providerId}`, template).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.save(providerId, template);
      })
    );
  }

  getAll(): Observable<ProviderTemplate[]> {
    if (this.useMock) {
      return this.mockService.getAll();
    }

    return this.http.get<ProviderTemplate[]>(this.apiUrl).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.getAll();
      })
    );
  }
}

