import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Doctor } from '../models/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiService = inject(ApiService);

  private mapDoctorIdToId(doctor: any): Doctor {
    if (doctor) {
      if (doctor.staffId !== undefined && doctor.staffId !== null) {
        doctor.id = doctor.staffId;
      }
      if (typeof doctor.id === 'string' && /^\d+$/.test(doctor.id)) {
        doctor.id = Number(doctor.id);
      }
    }
    return doctor as Doctor;
  }

  getAll(): Observable<Doctor[]> {
    return this.apiService.get<any[]>('/api/doctors').pipe(
      map(doctors => doctors.map(d => this.mapDoctorIdToId(d))),
      catchError(err => throwError(() => err))
    );
  }

  getById(id: string): Observable<Doctor> {
    return this.apiService.get<any>(`/api/doctors/${id}`).pipe(
      map(doctor => this.mapDoctorIdToId(doctor)),
      catchError(err => throwError(() => err))
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
