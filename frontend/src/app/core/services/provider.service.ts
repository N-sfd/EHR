import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Provider } from '../models/provider.model';
import { ProviderMockService } from './provider-mock.service';
import { api, unwrap } from '../api/api-base';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {
  private useMock = environment.useMock === true; // Only use mock if explicitly set to true

  constructor(
    private http: HttpClient,
    private mockService: ProviderMockService
  ) {}

  getProviders(): Observable<Provider[]> {
    if (this.useMock) {
      return this.mockService.getProviders();
    }

    return this.http.get<any>(api('/api/providers'), { withCredentials: true }).pipe(
      map(response => (unwrap<any[]>(response) || []).map(d => this.mapApiDoctorToProvider(d))),
      catchError(err => {
        console.error('[ProviderService] API call failed:', err);
        return throwError(() => err);
      })
    );
  }

  getProviderById(id: number): Observable<Provider> {
    if (this.useMock) {
      return this.mockService.getProviderById(id);
    }

    return this.http.get<any>(api(`/api/providers/${id}`), { withCredentials: true }).pipe(
      map(response => this.mapApiDoctorToProvider(unwrap<any>(response))),
      catchError(err => {
        console.error('[ProviderService] getProviderById API call failed:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Backend {@code /api/providers} returns doctor JSON (firstName, lastName, staffId, specialization),
   * not the UI {@link Provider} shape. Map here for admin schedules and provider templates.
   */
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

  seedDemoProviders(): Observable<Provider[]> {
    return this.mockService.seedDemoProviders();
  }
}

