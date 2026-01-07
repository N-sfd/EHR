import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ScheduleGrid } from '../models/schedule-grid.model';

@Injectable({
  providedIn: 'root'
})
export class ScheduleGridService {
  private http = inject(HttpClient);
  private apiUrl = '/api/schedule-grid';

  getProviderScheduleGrid(providerId: number, date: string): Observable<ScheduleGrid> {
    return this.http.get<ScheduleGrid>(`${this.apiUrl}/provider/${providerId}/date/${date}`);
  }

  getProviderScheduleGridRange(providerId: number, startDate: string, endDate: string): Observable<ScheduleGrid[]> {
    return this.http.get<ScheduleGrid[]>(`${this.apiUrl}/provider/${providerId}/range?startDate=${startDate}&endDate=${endDate}`);
  }

  getMultiProviderScheduleGrid(providerIds: number[], date: string): Observable<ScheduleGrid[]> {
    const ids = providerIds.join(',');
    return this.http.get<ScheduleGrid[]>(`${this.apiUrl}/providers/date/${date}?providerIds=${ids}`);
  }
}

