import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ImagingStudy } from '../models/imaging-study.model';

@Injectable({
  providedIn: 'root'
})
export class ImagingStudyService {
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
    console.error('ImagingStudyService error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  getAll(): Observable<ImagingStudy[]> {
    return this.http.get<ImagingStudy[]>(`${this.apiUrl}/api/imaging-studies`).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<ImagingStudy> {
    return this.http.get<ImagingStudy>(`${this.apiUrl}/api/imaging-studies/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getByPatientId(patientId: number): Observable<ImagingStudy[]> {
    return this.http.get<ImagingStudy[]>(`${this.apiUrl}/api/imaging-studies/patient/${patientId}`).pipe(
      catchError(this.handleError)
    );
  }

  getRecentByPatientId(patientId: number, days?: number): Observable<ImagingStudy[]> {
    const params = days ? { days: days.toString() } : {};
    return this.http.get<ImagingStudy[]>(`${this.apiUrl}/api/imaging-studies/patient/${patientId}/recent`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getByStudyType(patientId: number, studyType: string): Observable<ImagingStudy[]> {
    return this.http.get<ImagingStudy[]>(`${this.apiUrl}/api/imaging-studies/patient/${patientId}/type/${studyType}`).pipe(
      catchError(this.handleError)
    );
  }

  create(study: Partial<ImagingStudy>): Observable<ImagingStudy> {
    return this.http.post<ImagingStudy>(`${this.apiUrl}/api/imaging-studies`, study).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, study: Partial<ImagingStudy>): Observable<ImagingStudy> {
    return this.http.put<ImagingStudy>(`${this.apiUrl}/api/imaging-studies/${id}`, study).pipe(
      catchError(this.handleError)
    );
  }

  addReport(id: number, report: string, reportedByStaffId: number, findings?: string, impression?: string, recommendations?: string): Observable<ImagingStudy> {
    return this.http.put<ImagingStudy>(`${this.apiUrl}/api/imaging-studies/${id}/report`, {
      report,
      reportedByStaffId,
      findings,
      impression,
      recommendations
    }).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/imaging-studies/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}

