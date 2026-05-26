import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MedicationAdministration } from '../models/medication-administration.model';

@Injectable({
  providedIn: 'root'
})
export class MedicationAdministrationService {
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
    console.error('MedicationAdministrationService error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  getAll(): Observable<MedicationAdministration[]> {
    return this.http.get<MedicationAdministration[]>(`${this.apiUrl}/api/medication-administrations`).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<MedicationAdministration> {
    return this.http.get<MedicationAdministration>(`${this.apiUrl}/api/medication-administrations/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getByPatientId(patientId: number): Observable<MedicationAdministration[]> {
    return this.http.get<MedicationAdministration[]>(`${this.apiUrl}/api/medication-administrations/patient/${patientId}`).pipe(
      catchError(this.handleError)
    );
  }

  getByMedicationId(medicationId: number): Observable<MedicationAdministration[]> {
    return this.http.get<MedicationAdministration[]>(`${this.apiUrl}/api/medication-administrations/medication/${medicationId}`).pipe(
      catchError(this.handleError)
    );
  }

  getMarByPatientId(patientId: number, date?: string): Observable<MedicationAdministration[]> {
    const params: Record<string, string> = date ? { date } : {};
    return this.http.get<MedicationAdministration[]>(`${this.apiUrl}/api/medication-administrations/patient/${patientId}/mar`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  create(administration: Partial<MedicationAdministration>): Observable<MedicationAdministration> {
    return this.http.post<MedicationAdministration>(`${this.apiUrl}/api/medication-administrations`, administration).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, administration: Partial<MedicationAdministration>): Observable<MedicationAdministration> {
    return this.http.put<MedicationAdministration>(`${this.apiUrl}/api/medication-administrations/${id}`, administration).pipe(
      catchError(this.handleError)
    );
  }

  administer(id: number, administeredByStaffId: number, dosage?: string, route?: string, site?: string): Observable<MedicationAdministration> {
    return this.http.put<MedicationAdministration>(`${this.apiUrl}/api/medication-administrations/${id}/administer`, {
      administeredByStaffId,
      dosage,
      route,
      site
    }).pipe(
      catchError(this.handleError)
    );
  }

  hold(id: number, reason: string): Observable<MedicationAdministration> {
    return this.http.put<MedicationAdministration>(`${this.apiUrl}/api/medication-administrations/${id}/hold`, { reason }).pipe(
      catchError(this.handleError)
    );
  }

  refuse(id: number, reason: string): Observable<MedicationAdministration> {
    return this.http.put<MedicationAdministration>(`${this.apiUrl}/api/medication-administrations/${id}/refuse`, { reason }).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/medication-administrations/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}

