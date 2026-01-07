import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Patient } from '../models/patient.model';
import { PatientMockService } from './patient-mock.service';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private http = inject(HttpClient);
  private mockService = inject(PatientMockService);
  private apiUrl = environment.apiUrl || '';
  private useMock = environment.useMock !== false;

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }
    console.error('PatientService error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  getAll(): Observable<Patient[]> {
    if (this.useMock) {
      return this.mockService.getAll();
    }
    return this.http.get<any[]>(`${this.apiUrl}/api/patients`).pipe(
      map(patients => patients.map(p => this.mapPatient(p))),
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.getAll();
      })
    );
  }

  getById(id: number): Observable<Patient> {
    if (this.useMock) {
      return this.mockService.getById(id);
    }
    return this.http.get<any>(`${this.apiUrl}/api/patients/${id}`).pipe(
      map(patient => this.mapPatient(patient)),
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.getById(id);
      })
    );
  }

  private mapPatient(patient: any): Patient {
    return {
      ...patient,
      id: patient.patientId || patient.id,
      emailAddress: patient.email || patient.emailAddress,
      addressLine1: patient.address || patient.addressLine1,
      pincode: patient.zipCode || patient.pincode
    };
  }

  getByCode(code: string): Observable<Patient> {
    if (this.useMock) {
      return this.mockService.getByCode(code);
    }
    return this.http.get<Patient>(`${this.apiUrl}/api/patients/code/${code}`).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.getByCode(code);
      })
    );
  }

  create(patient: Partial<Patient>): Observable<Patient> {
    if (this.useMock) {
      return this.mockService.create(patient);
    }
    return this.http.post<Patient>(`${this.apiUrl}/api/patients`, patient).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.create(patient);
      })
    );
  }

  update(id: number, patient: Partial<Patient>): Observable<Patient> {
    if (this.useMock) {
      return this.mockService.update(id, patient);
    }
    return this.http.put<Patient>(`${this.apiUrl}/api/patients/${id}`, patient).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.update(id, patient);
      })
    );
  }

  delete(id: number): Observable<void> {
    if (this.useMock) {
      return this.mockService.delete(id);
    }
    return this.http.delete<void>(`${this.apiUrl}/api/patients/${id}`).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.delete(id);
      })
    );
  }

  searchPatients(query: string): Observable<Patient[]> {
    if (this.useMock) {
      return this.mockService.searchPatients(query);
    }
    return this.http.get<any[]>(`${this.apiUrl}/api/patients`, {
      params: { query: query }
    }).pipe(
      map(patients => patients.map(p => this.mapPatient(p))),
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.searchPatients(query);
      })
    );
  }
}

