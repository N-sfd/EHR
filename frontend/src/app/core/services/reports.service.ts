import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface HeatmapBucket {
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  hour: number; // 0-23
  count: number;
}

export interface SchedulingSummary {
  totalAppointments: number;
  urgentCount: number;
  statusCounts: {
    scheduled: number;
    confirmed: number;
    arrived: number;
    cancelled: number;
    noshow: number;
  };
  dailyCounts: Array<{
    date: string;
    count: number;
  }>;
  heatmapBuckets?: HeatmapBucket[]; // Optional - backend provides this
}

export interface ProviderUtilization {
  doctorId: number;
  doctorName: string;
  totalAppointments: number;
  totalMinutesBooked: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private http = inject(HttpClient);
  private baseUrl = '/api/reports/scheduling';
  private isDev = !environment.production;

  /**
   * Format date to yyyy-MM-dd (no time, no timezone)
   */
  private formatDate(date: string): string {
    if (!date) return '';
    // Ensure format is yyyy-MM-dd (remove time if present)
    return date.split('T')[0];
  }

  /**
   * Build HttpParams with only non-empty values
   * NEVER sends empty arrays, blank strings, or "All" selections
   */
  private buildParams(params: {
    start: string;
    end: string;
    doctorIds?: number[];
    statuses?: string[];
    appointmentTypes?: string[];
    departmentIds?: number[];
    includeCancelled?: boolean;
    businessHoursOnly?: boolean;
  }): HttpParams {
    let httpParams = new HttpParams()
      .set('start', this.formatDate(params.start))
      .set('end', this.formatDate(params.end));
    
    // Only add doctorIds if provided and not empty
    if (params.doctorIds && params.doctorIds.length > 0) {
      params.doctorIds.forEach(id => {
        httpParams = httpParams.append('doctorIds', id.toString());
      });
    }
    
    // Only add statuses if provided and not empty
    if (params.statuses && params.statuses.length > 0) {
      params.statuses.forEach(status => {
        httpParams = httpParams.append('statuses', status);
      });
    }
    
    // Only add appointmentTypes if provided and not empty
    if (params.appointmentTypes && params.appointmentTypes.length > 0) {
      params.appointmentTypes.forEach(type => {
        httpParams = httpParams.append('appointmentTypes', type);
      });
    }
    
    // Only add departmentIds if provided and not empty
    if (params.departmentIds && params.departmentIds.length > 0) {
      params.departmentIds.forEach(id => {
        httpParams = httpParams.append('departmentIds', id.toString());
      });
    }
    
    // Only add includeCancelled if true
    if (params.includeCancelled === true) {
      httpParams = httpParams.set('includeCancelled', 'true');
    }
    
    // Only add businessHoursOnly if true
    if (params.businessHoursOnly === true) {
      httpParams = httpParams.set('businessHoursOnly', 'true');
    }
    
    return httpParams;
  }

  /**
   * Debug log request URL and params (dev only)
   */
  private logRequest(method: string, url: string, params: HttpParams): void {
    if (this.isDev) {
      const paramMap = params.keys().reduce((acc, key) => {
        const values = params.getAll(key);
        if (values !== null && values.length > 0) {
          acc[key] = values.length === 1 ? values[0] : values;
        }
        return acc;
      }, {} as Record<string, any>);
      
      const fullUrl = `${url}?${params.toString()}`;
      console.log(`[ReportsService] ${method} Request:`, {
        url: fullUrl,
        params: paramMap
      });
    }
  }

  /**
   * Get scheduling summary report
   * GET /api/reports/scheduling/summary?start=YYYY-MM-DD&end=YYYY-MM-DD&doctorIds=1&doctorIds=2
   */
  getSchedulingSummary(
    startDate: string,
    endDate: string,
    doctorIds?: number[]
  ): Observable<SchedulingSummary> {
    const params = this.buildParams({
      start: startDate,
      end: endDate,
      doctorIds: doctorIds && doctorIds.length > 0 ? doctorIds : undefined
    });
    
    const url = `${this.baseUrl}/summary`;
    this.logRequest('GET', url, params);
    
    return this.http.get<SchedulingSummary>(url, { params, withCredentials: true }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('ReportsService.getSchedulingSummary error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get provider utilization report
   * GET /api/reports/scheduling/provider-utilization?start=YYYY-MM-DD&end=YYYY-MM-DD&doctorIds=1&doctorIds=2
   */
  getProviderUtilization(
    startDate: string,
    endDate: string,
    doctorIds?: number[]
  ): Observable<ProviderUtilization[]> {
    const params = this.buildParams({
      start: startDate,
      end: endDate,
      doctorIds: doctorIds && doctorIds.length > 0 ? doctorIds : undefined
    });
    
    const url = `${this.baseUrl}/provider-utilization`;
    this.logRequest('GET', url, params);
    
    return this.http.get<ProviderUtilization[]>(url, { params, withCredentials: true }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('ReportsService.getProviderUtilization error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get detailed appointments for analysis (heatmap, no-show rate, etc.)
   * Uses existing /api/appointments endpoint (same endpoint pattern as ScheduleGridComponent)
   * Alternative: /api/appointments/range (used by AppointmentService.getByDateRange)
   * Both endpoints work the same way, this uses the main GET endpoint
   * GET /api/appointments?start=YYYY-MM-DD&end=YYYY-MM-DD&doctorIds=1&doctorIds=2&statuses=SCHEDULED
   */
  getDetailedAppointments(
    startDate: string,
    endDate: string,
    doctorIds?: number[],
    statuses?: string[],
    appointmentTypes?: string[],
    includeCancelled?: boolean,
    businessHoursOnly?: boolean
  ): Observable<any[]> {
    const params = this.buildParams({
      start: startDate,
      end: endDate,
      doctorIds: doctorIds && doctorIds.length > 0 ? doctorIds : undefined,
      statuses: statuses && statuses.length > 0 ? statuses : undefined,
      appointmentTypes: appointmentTypes && appointmentTypes.length > 0 ? appointmentTypes : undefined,
      includeCancelled,
      businessHoursOnly
    });
    
    // Use /api/appointments (main GET endpoint) - same as ScheduleGridComponent uses
    // Alternative: /api/appointments/range (used by AppointmentService.getByDateRange)
    const url = '/api/appointments';
    this.logRequest('GET', url, params);
    
    return this.http.get<any[]>(url, { params, withCredentials: true }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('ReportsService.getDetailedAppointments error:', error);
        return throwError(() => error);
      })
    );
  }
}

