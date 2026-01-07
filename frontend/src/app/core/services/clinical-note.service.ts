import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ClinicalNote } from '../models/clinical-note.model';

@Injectable({
  providedIn: 'root'
})
export class ClinicalNoteService {
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
    console.error('ClinicalNoteService error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  getAll(): Observable<ClinicalNote[]> {
    return this.http.get<ClinicalNote[]>(`${this.apiUrl}/api/clinical-notes`).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<ClinicalNote> {
    return this.http.get<ClinicalNote>(`${this.apiUrl}/api/clinical-notes/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getByPatientId(patientId: number): Observable<ClinicalNote[]> {
    return this.http.get<ClinicalNote[]>(`${this.apiUrl}/api/clinical-notes/patient/${patientId}`).pipe(
      catchError(this.handleError)
    );
  }

  getByStaffId(staffId: number): Observable<ClinicalNote[]> {
    return this.http.get<ClinicalNote[]>(`${this.apiUrl}/api/clinical-notes/staff/${staffId}`).pipe(
      catchError(this.handleError)
    );
  }

  getByNoteType(noteType: string): Observable<ClinicalNote[]> {
    return this.http.get<ClinicalNote[]>(`${this.apiUrl}/api/clinical-notes/type/${noteType}`).pipe(
      catchError(this.handleError)
    );
  }

  create(note: Partial<ClinicalNote>): Observable<ClinicalNote> {
    return this.http.post<ClinicalNote>(`${this.apiUrl}/api/clinical-notes`, note).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, note: Partial<ClinicalNote>): Observable<ClinicalNote> {
    return this.http.put<ClinicalNote>(`${this.apiUrl}/api/clinical-notes/${id}`, note).pipe(
      catchError(this.handleError)
    );
  }

  sign(id: number, signedByStaffId: number): Observable<ClinicalNote> {
    return this.http.put<ClinicalNote>(`${this.apiUrl}/api/clinical-notes/${id}/sign`, { signedByStaffId }).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/clinical-notes/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}

