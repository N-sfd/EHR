import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Staff } from '../models/staff.model';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private baseUrl = `${environment.apiUrl || ''}/api/staff`;
  private http = inject(HttpClient);

  private mapStaffIdToId(staff: any): Staff {
    if (staff) {
      if (staff.staffId !== undefined && staff.staffId !== null) {
        staff.id = staff.staffId;
      }
      if (typeof staff.id === 'string' && /^\d+$/.test(staff.id)) {
        staff.id = Number(staff.id);
      }
    }
    return staff as Staff;
  }

  getAll(): Observable<Staff[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      map(staffs => staffs.map(s => this.mapStaffIdToId(s))),
      catchError(err => throwError(() => err))
    );
  }

  getById(id: string): Observable<Staff> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map(staff => this.mapStaffIdToId(staff)),
      catchError(err => throwError(() => err))
    );
  }

  create(staff: Staff): Observable<Staff> {
    return this.http.post<any>(this.baseUrl, staff).pipe(
      map(result => this.mapStaffIdToId(result)),
      catchError(err => throwError(() => err))
    );
  }

  update(id: string, staff: Staff): Observable<Staff> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, staff).pipe(
      map(result => this.mapStaffIdToId(result)),
      catchError(err => throwError(() => err))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
