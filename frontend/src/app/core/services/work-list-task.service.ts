import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { WorkListTask } from '../models/work-list-task.model';

@Injectable({
  providedIn: 'root'
})
export class WorkListTaskService {
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
    console.error('WorkListTaskService error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  getAll(): Observable<WorkListTask[]> {
    return this.http.get<WorkListTask[]>(`${this.apiUrl}/api/work-list-tasks`).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<WorkListTask> {
    return this.http.get<WorkListTask>(`${this.apiUrl}/api/work-list-tasks/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getByPatientId(patientId: number): Observable<WorkListTask[]> {
    return this.http.get<WorkListTask[]>(`${this.apiUrl}/api/work-list-tasks/patient/${patientId}`).pipe(
      catchError(this.handleError)
    );
  }

  getByStaffId(staffId: number): Observable<WorkListTask[]> {
    return this.http.get<WorkListTask[]>(`${this.apiUrl}/api/work-list-tasks/staff/${staffId}`).pipe(
      catchError(this.handleError)
    );
  }

  getByStatus(status: string): Observable<WorkListTask[]> {
    return this.http.get<WorkListTask[]>(`${this.apiUrl}/api/work-list-tasks/status/${status}`).pipe(
      catchError(this.handleError)
    );
  }

  create(task: Partial<WorkListTask>): Observable<WorkListTask> {
    return this.http.post<WorkListTask>(`${this.apiUrl}/api/work-list-tasks`, task).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, task: Partial<WorkListTask>): Observable<WorkListTask> {
    return this.http.put<WorkListTask>(`${this.apiUrl}/api/work-list-tasks/${id}`, task).pipe(
      catchError(this.handleError)
    );
  }

  complete(id: number, completedByStaffId: number): Observable<WorkListTask> {
    return this.http.put<WorkListTask>(`${this.apiUrl}/api/work-list-tasks/${id}/complete`, { completedByStaffId }).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/work-list-tasks/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}

