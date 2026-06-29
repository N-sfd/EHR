import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ProviderTemplate } from '../models/admin.model';
import { api, unwrap } from '../../../core/api/api-base';

@Injectable({
  providedIn: 'root'
})
export class ProviderTemplatesService {
  private http = inject(HttpClient);

  getByProvider(providerId: number): Observable<ProviderTemplate> {
    return this.http.get<any>(api(`/api/admin/provider-templates/${providerId}`), { withCredentials: true }).pipe(
      map(response => unwrap<ProviderTemplate>(response)),
      catchError(err => throwError(() => err))
    );
  }

  save(providerId: number, template: ProviderTemplate): Observable<ProviderTemplate> {
    return this.http.post<any>(api(`/api/admin/provider-templates/${providerId}`), template, { withCredentials: true }).pipe(
      map(response => unwrap<ProviderTemplate>(response)),
      catchError(err => throwError(() => err))
    );
  }

  getAll(): Observable<ProviderTemplate[]> {
    return this.http.get<any>(api('/api/admin/provider-templates'), { withCredentials: true }).pipe(
      map(response => unwrap<ProviderTemplate[]>(response) || []),
      catchError(err => throwError(() => err))
    );
  }
}
