import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '../models/appointment.model';

export interface ProviderScheduleWeek {
  providerId: number;
  weekStart: string;
  weekEnd: string;
  appointments: Appointment[];
}

/**
 * Service for managing provider schedules and appointments.
 * Uses /api/schedules endpoints (relative URLs, proxy-friendly).
 */
@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private http = inject(HttpClient);

  /**
   * Get provider week schedule
   */
  getProviderWeek(providerId: number, weekStartIso: string): Observable<ProviderScheduleWeek> {
    return this.http.get<ProviderScheduleWeek>(
      `/api/schedules/provider/${providerId}/week?start=${encodeURIComponent(weekStartIso)}`,
      { withCredentials: true }
    );
  }
}

