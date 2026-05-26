import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ProviderTemplate } from '../models/admin.model';
import { ProviderTemplatesMockService } from './provider-templates-mock.service';
import { api, unwrap } from '../../../core/api/api-base';

@Injectable({
  providedIn: 'root'
})
export class ProviderTemplatesService {
  private useMock = environment.useMock === true; // Only use mock if explicitly set to true
  private http = inject(HttpClient);
  private mockService = inject(ProviderTemplatesMockService);

  getByProvider(providerId: number): Observable<ProviderTemplate> {
    if (this.useMock) {
      return this.mockService.getByProvider(providerId);
    }

    return this.http.get<any>(api(`/api/admin/provider-templates/${providerId}`), { withCredentials: true }).pipe(
      map(response => unwrap<ProviderTemplate>(response)),
      catchError(err => {
        console.error('[ProviderTemplatesService] API call failed:', err);
        return throwError(() => err);
      })
    );
  }

  save(providerId: number, template: ProviderTemplate): Observable<ProviderTemplate> {
    if (this.useMock) {
      return this.mockService.save(providerId, template);
    }

    return this.http.post<any>(api(`/api/admin/provider-templates/${providerId}`), template, { withCredentials: true }).pipe(
      map(response => unwrap<ProviderTemplate>(response)),
      catchError(err => {
        console.error('[ProviderTemplatesService] Save API call failed:', err);
        return throwError(() => err);
      })
    );
  }

  getAll(): Observable<ProviderTemplate[]> {
    if (this.useMock) {
      return this.mockService.getAll();
    }

    return this.http.get<any>(api('/api/admin/provider-templates'), { withCredentials: true }).pipe(
      map(response => unwrap<ProviderTemplate[]>(response) || []),
      catchError(err => {
        console.error('[ProviderTemplatesService] GetAll API call failed:', err);
        return throwError(() => err);
      })
    );
  }
}

