import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TreatmentTeam } from '../models/treatment-team.model';

@Injectable({
  providedIn: 'root'
})
export class TreatmentTeamService {
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
    console.error('TreatmentTeamService error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  getAll(): Observable<TreatmentTeam[]> {
    return this.http.get<TreatmentTeam[]>(`${this.apiUrl}/api/treatment-teams`).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<TreatmentTeam> {
    return this.http.get<TreatmentTeam>(`${this.apiUrl}/api/treatment-teams/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getByPatientId(patientId: number): Observable<TreatmentTeam[]> {
    return this.http.get<TreatmentTeam[]>(`${this.apiUrl}/api/treatment-teams/patient/${patientId}`).pipe(
      catchError(this.handleError)
    );
  }

  getByStaffId(staffId: number): Observable<TreatmentTeam[]> {
    return this.http.get<TreatmentTeam[]>(`${this.apiUrl}/api/treatment-teams/staff/${staffId}`).pipe(
      catchError(this.handleError)
    );
  }

  create(team: Partial<TreatmentTeam>): Observable<TreatmentTeam> {
    return this.http.post<TreatmentTeam>(`${this.apiUrl}/api/treatment-teams`, team).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, team: Partial<TreatmentTeam>): Observable<TreatmentTeam> {
    return this.http.put<TreatmentTeam>(`${this.apiUrl}/api/treatment-teams/${id}`, team).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/treatment-teams/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}

