import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LabResult } from '../models/lab-result.model';

@Injectable({
  providedIn: 'root'
})
export class LabResultService {
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
    console.error('LabResultService error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  getAll(): Observable<LabResult[]> {
    return this.http.get<LabResult[]>(`${this.apiUrl}/api/lab-results`).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<LabResult> {
    return this.http.get<LabResult>(`${this.apiUrl}/api/lab-results/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getByPatientId(patientId: number): Observable<LabResult[]> {
    return this.http.get<LabResult[]>(`${this.apiUrl}/api/lab-results/patient/${patientId}`).pipe(
      catchError(this.handleError)
    );
  }

  getRecentByPatientId(patientId: number, days?: number): Observable<LabResult[]> {
    const params: Record<string, string> = days ? { days: days.toString() } : {};
    return this.http.get<LabResult[]>(`${this.apiUrl}/api/lab-results/patient/${patientId}/recent`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getByTestName(patientId: number, testName: string): Observable<LabResult[]> {
    return this.http.get<LabResult[]>(`${this.apiUrl}/api/lab-results/patient/${patientId}/test/${testName}`).pipe(
      catchError(this.handleError)
    );
  }

  getAbnormalByPatientId(patientId: number): Observable<LabResult[]> {
    return this.http.get<LabResult[]>(`${this.apiUrl}/api/lab-results/patient/${patientId}/abnormal`).pipe(
      catchError(this.handleError)
    );
  }

  create(labResult: Partial<LabResult>): Observable<LabResult> {
    return this.http.post<LabResult>(`${this.apiUrl}/api/lab-results`, labResult).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, labResult: Partial<LabResult>): Observable<LabResult> {
    return this.http.put<LabResult>(`${this.apiUrl}/api/lab-results/${id}`, labResult).pipe(
      catchError(this.handleError)
    );
  }

  verify(id: number, verifiedByStaffId: number): Observable<LabResult> {
    return this.http.put<LabResult>(`${this.apiUrl}/api/lab-results/${id}/verify`, { verifiedByStaffId }).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/lab-results/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}

