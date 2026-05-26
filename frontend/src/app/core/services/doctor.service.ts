import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Doctor } from '../models/doctor.model';
import { StaffMockService } from './staff-mock.service';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiService = inject(ApiService);
  private mockService = inject(StaffMockService);
  private useMock = environment.useMock !== false; // Use environment configuration, default to true

  constructor() {}

  // Helper to map backend staffId to frontend id (same as Staff)
  private mapDoctorIdToId(doctor: any): Doctor {
    if (doctor) {
      // Always map staffId to id if staffId exists (doctors use staffId from Staff entity)
      if (doctor.staffId !== undefined && doctor.staffId !== null) {
        doctor.id = doctor.staffId;
      }
      // Ensure id is a number, not a string
      if (typeof doctor.id === 'string' && /^\d+$/.test(doctor.id)) {
        doctor.id = Number(doctor.id);
      }
    }
    return doctor as Doctor;
  }

  getAll(): Observable<Doctor[]> {
    if (this.useMock) {
      return this.mockService.getAll().pipe(
        map(staff => staff.filter(s => s.isDoctor).map(s => s as unknown as Doctor))
      );
    }

    return this.apiService.get<any[]>('/api/doctors').pipe(
      map(doctors => doctors.map(d => this.mapDoctorIdToId(d))),
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.getAll().pipe(
          map(staff => staff.filter(s => s.isDoctor).map(s => s as unknown as Doctor))
        );
      })
    );
  }

  getById(id: string): Observable<Doctor> {
    if (this.useMock) {
      return this.mockService.getById(id).pipe(
        map(staff => staff as unknown as Doctor)
      );
    }

    return this.apiService.get<any>(`/api/doctors/${id}`).pipe(
      map(doctor => this.mapDoctorIdToId(doctor)),
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.getById(id).pipe(
          map(staff => staff as unknown as Doctor)
        );
      })
    );
  }

  create(doctor: Doctor): Observable<Doctor> {
    return this.apiService.post<any>('/api/doctors', doctor).pipe(
      map(result => this.mapDoctorIdToId(result))
    );
  }

  update(id: string, doctor: Doctor): Observable<Doctor> {
    return this.apiService.put<any>(`/api/doctors/${id}`, doctor).pipe(
      map(result => this.mapDoctorIdToId(result))
    );
  }

  delete(id: string): Observable<void> {
    return this.apiService.delete<void>(`/api/doctors/${id}`);
  }
}


