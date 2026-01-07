import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Allergy } from '../models/allergy.model';

@Injectable({
  providedIn: 'root'
})
export class AllergyService {
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
    console.error('AllergyService error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  getAll(): Observable<Allergy[]> {
    return this.http.get<Allergy[]>(`${this.apiUrl}/api/allergies`).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<Allergy> {
    return this.http.get<Allergy>(`${this.apiUrl}/api/allergies/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getByPatientId(patientId: number): Observable<Allergy[]> {
    return this.http.get<Allergy[]>(`${this.apiUrl}/api/allergies/patient/${patientId}`).pipe(
      catchError(this.handleError)
    );
  }

  getActiveByPatientId(patientId: number): Observable<Allergy[]> {
    return this.http.get<Allergy[]>(`${this.apiUrl}/api/allergies/patient/${patientId}/active`).pipe(
      catchError(this.handleError)
    );
  }

  create(allergy: Partial<Allergy>): Observable<Allergy> {
    return this.http.post<Allergy>(`${this.apiUrl}/api/allergies`, allergy).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, allergy: Partial<Allergy>): Observable<Allergy> {
    return this.http.put<Allergy>(`${this.apiUrl}/api/allergies/${id}`, allergy).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/allergies/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}

