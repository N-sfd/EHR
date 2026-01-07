import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PatientOverview } from '../models/patient-overview.model';

@Injectable({
  providedIn: 'root'
})
export class PatientOverviewService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl || '';

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }
    console.error('PatientOverviewService error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  getByPatientId(patientId: number): Observable<PatientOverview> {
    return this.http.get<PatientOverview>(`${this.apiUrl}/api/patient-overview/patient/${patientId}`).pipe(
      catchError(this.handleError)
    );
  }
}

