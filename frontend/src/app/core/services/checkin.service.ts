import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Appointment } from '../models/appointment.model';

export interface CheckInResult {
  success: boolean;
  appointment?: Appointment;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CheckInService {
  private http = inject(HttpClient);
  private apiUrl = '/api/checkin';

  markArrived(appointmentId: number): Observable<Appointment> {
    return this.http.put<any>(`${this.apiUrl}/appointment/${appointmentId}/arrive`, {}).pipe(
      map((response: any) => {
        // Map backend response to Appointment
        const data = response.data || response;
        return {
          ...data,
          appointmentId: data.id || data.appointmentId,
          status: this.mapStatus(data.status)
        } as Appointment;
      })
    );
  }

  checkIn(appointmentId: number, notes?: string): Observable<CheckInResult> {
    return this.http.put<any>(`${this.apiUrl}/appointment/${appointmentId}/checkin`, { notes }).pipe(
      map((response: any) => {
        const data = response.data || response;
        if (data.appointment) {
          data.appointment.status = this.mapStatus(data.appointment.status);
        }
        return data as CheckInResult;
      })
    );
  }

  private mapStatus(status: string): string {
    // Map backend status to frontend status
    const statusMap: { [key: string]: string } = {
      'ARRIVED': 'Arrived',
      'CHECKED_IN': 'Checked In',
      'SCHEDULED': 'Schedule',
      'CANCELED': 'Cancelled',
      'COMPLETED': 'Checked Out',
      'IN_PROGRESS': 'Checked In'
    };
    return statusMap[status] || status;
  }
}

