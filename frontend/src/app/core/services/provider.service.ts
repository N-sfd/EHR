import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Provider } from '../models/provider.model';
import { api, unwrap } from '../api/api-base';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {
  private http = inject(HttpClient);

  getProviders(): Observable<Provider[]> {
    return this.http.get<any>(api('/api/providers'), { withCredentials: true }).pipe(
      map(response => (unwrap<any[]>(response) || []).map(d => this.mapApiDoctorToProvider(d))),
      catchError(err => throwError(() => err))
    );
  }

  getProviderById(id: number): Observable<Provider> {
    return this.http.get<any>(api(`/api/providers/${id}`), { withCredentials: true }).pipe(
      map(response => this.mapApiDoctorToProvider(unwrap<any>(response))),
      catchError(err => throwError(() => err))
    );
  }

  private mapApiDoctorToProvider(raw: any): Provider {
    if (!raw || typeof raw !== 'object') {
      return {
        id: 0,
        name: 'Unknown provider',
        specialty: '',
        department: '',
        active: true
      };
    }
    const id = Number(raw.staffId ?? raw.id ?? 0);
    const first = (raw.firstName ?? '').trim();
    const last = (raw.lastName ?? '').trim();
    const nameFromParts = [first, last].filter(Boolean).join(' ').trim();
    const name = nameFromParts || (raw.name ?? '').trim() || `Provider ${id || ''}`.trim();
    const specialty = (raw.specialization ?? raw.specialty ?? '').trim();
    const dept =
      (raw.department ?? '').trim() ||
      (raw.departmentName ?? '').trim() ||
      (raw.departmentId != null && raw.departmentId !== '' ? `Department #${raw.departmentId}` : '');
    const active =
      raw.active !== false &&
      raw.status !== 'INACTIVE' &&
      raw.status !== 'Inactive' &&
      raw.status !== 'TERMINATED';
    const photo = (raw.photoUrl ?? raw.imageUrl ?? '').trim();
    return {
      id,
      name,
      specialty,
      department: dept,
      active,
      imageUrl: photo || undefined,
      photoUrl: photo || undefined
    };
  }
}
