import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { VitalSign } from '../models/vital-sign.model';

@Injectable({
  providedIn: 'root'
})
export class VitalSignService {
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
    console.error('VitalSignService error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  getAll(): Observable<VitalSign[]> {
    return this.http.get<VitalSign[]>(`${this.apiUrl}/api/vital-signs`).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<VitalSign> {
    return this.http.get<VitalSign>(`${this.apiUrl}/api/vital-signs/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getByPatientId(patientId: number): Observable<VitalSign[]> {
    return this.http.get<VitalSign[]>(`${this.apiUrl}/api/vital-signs/patient/${patientId}`).pipe(
      catchError(this.handleError)
    );
  }

  getLatestByPatientId(patientId: number): Observable<VitalSign> {
    return this.http.get<VitalSign>(`${this.apiUrl}/api/vital-signs/patient/${patientId}/latest`).pipe(
      catchError(this.handleError)
    );
  }

  create(vitalSign: Partial<VitalSign>): Observable<VitalSign> {
    return this.http.post<VitalSign>(`${this.apiUrl}/api/vital-signs`, vitalSign).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, vitalSign: Partial<VitalSign>): Observable<VitalSign> {
    return this.http.put<VitalSign>(`${this.apiUrl}/api/vital-signs/${id}`, vitalSign).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/vital-signs/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}

