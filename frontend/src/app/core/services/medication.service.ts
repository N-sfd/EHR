import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Medication } from '../models/medication.model';

@Injectable({
  providedIn: 'root'
})
export class MedicationService {
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
    console.error('MedicationService error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  getAll(): Observable<Medication[]> {
    return this.http.get<Medication[]>(`${this.apiUrl}/api/medications`).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<Medication> {
    return this.http.get<Medication>(`${this.apiUrl}/api/medications/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getByPatientId(patientId: number): Observable<Medication[]> {
    return this.http.get<Medication[]>(`${this.apiUrl}/api/medications/patient/${patientId}`).pipe(
      catchError(this.handleError)
    );
  }

  getActiveByPatientId(patientId: number): Observable<Medication[]> {
    return this.http.get<Medication[]>(`${this.apiUrl}/api/medications/patient/${patientId}/active`).pipe(
      catchError(this.handleError)
    );
  }

  create(medication: Partial<Medication>): Observable<Medication> {
    return this.http.post<Medication>(`${this.apiUrl}/api/medications`, medication).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, medication: Partial<Medication>): Observable<Medication> {
    return this.http.put<Medication>(`${this.apiUrl}/api/medications/${id}`, medication).pipe(
      catchError(this.handleError)
    );
  }

  discontinue(id: number, reason: string, discontinuedByStaffId: number): Observable<Medication> {
    return this.http.put<Medication>(`${this.apiUrl}/api/medications/${id}/discontinue`, { reason, discontinuedByStaffId }).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/medications/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}

