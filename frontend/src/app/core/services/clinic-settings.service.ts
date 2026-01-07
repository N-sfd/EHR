import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { ClinicSettings } from '../models/clinic-settings.model';

@Injectable({
  providedIn: 'root'
})
export class ClinicSettingsService {
  constructor(private apiService: ApiService) {}

  get(): Observable<ClinicSettings> {
    return this.apiService.get<ClinicSettings>('/api/clinic-settings');
  }

  create(settings: ClinicSettings): Observable<ClinicSettings> {
    return this.apiService.post<ClinicSettings>('/api/clinic-settings', settings);
  }

  update(id: number, settings: ClinicSettings): Observable<ClinicSettings> {
    return this.apiService.put<ClinicSettings>(`/api/clinic-settings/${id}`, settings);
  }
}

