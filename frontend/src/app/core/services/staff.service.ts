import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Staff } from '../models/staff.model';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { StaffMockService } from './staff-mock.service';

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private baseUrl = `${environment.apiUrl || ''}/api/staff`;
  private http = inject(HttpClient);
  private mockService = inject(StaffMockService);
  private useMock = true; // Always use mock for now, can be configured via environment

  constructor() {}

  // Helper to map backend staffId to frontend id
  private mapStaffIdToId(staff: any): Staff {
    if (staff) {
      // Always map staffId to id if staffId exists
      if (staff.staffId !== undefined && staff.staffId !== null) {
        staff.id = staff.staffId;
      }
      // Ensure id is a number, not a string
      if (typeof staff.id === 'string' && /^\d+$/.test(staff.id)) {
        staff.id = Number(staff.id);
      }
    }
    return staff as Staff;
  }

  getAll(): Observable<Staff[]> {
    if (this.useMock) {
      return this.mockService.getAll();
    }

    return this.http.get<any[]>(this.baseUrl).pipe(
      map(staffs => staffs.map(s => this.mapStaffIdToId(s))),
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.getAll();
      })
    );
  }

  getById(id: string): Observable<Staff> {
    if (this.useMock) {
      return this.mockService.getById(id);
    }

    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map(staff => this.mapStaffIdToId(staff)),
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.getById(id);
      })
    );
  }

  create(staff: Staff): Observable<Staff> {
    if (this.useMock) {
      return this.mockService.create(staff);
    }

    return this.http.post<any>(this.baseUrl, staff).pipe(
      map(result => this.mapStaffIdToId(result)),
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.create(staff);
      })
    );
  }

  update(id: string, staff: Staff): Observable<Staff> {
    if (this.useMock) {
      return this.mockService.update(id, staff);
    }

    return this.http.put<any>(`${this.baseUrl}/${id}`, staff).pipe(
      map(result => this.mapStaffIdToId(result)),
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.update(id, staff);
      })
    );
  }

  delete(id: string): Observable<void> {
    if (this.useMock) {
      return this.mockService.delete(id);
    }

    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.delete(id);
      })
    );
  }
}


