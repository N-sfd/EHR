import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CarePlan } from '../models/care-plan.model';

@Injectable({
  providedIn: 'root'
})
export class CarePlanService {
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
    console.error('CarePlanService error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  getAll(): Observable<CarePlan[]> {
    return this.http.get<CarePlan[]>(`${this.apiUrl}/api/care-plans`).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<CarePlan> {
    return this.http.get<CarePlan>(`${this.apiUrl}/api/care-plans/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getByPatientId(patientId: number): Observable<CarePlan[]> {
    return this.http.get<CarePlan[]>(`${this.apiUrl}/api/care-plans/patient/${patientId}`).pipe(
      catchError(this.handleError)
    );
  }

  getActiveByPatientId(patientId: number): Observable<CarePlan[]> {
    return this.http.get<CarePlan[]>(`${this.apiUrl}/api/care-plans/patient/${patientId}/active`).pipe(
      catchError(this.handleError)
    );
  }

  create(carePlan: Partial<CarePlan>): Observable<CarePlan> {
    return this.http.post<CarePlan>(`${this.apiUrl}/api/care-plans`, carePlan).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, carePlan: Partial<CarePlan>): Observable<CarePlan> {
    return this.http.put<CarePlan>(`${this.apiUrl}/api/care-plans/${id}`, carePlan).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/care-plans/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}

