import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SpecialtyDto {
  id: number;
  code: string;
  name: string;
  departmentId?: number;
}

export interface DepartmentDto {
  id: number;
  code: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class HrLookupsService {
  private baseUrl = 'http://localhost:8080/api/hr'; // hr-service

  constructor(private http: HttpClient) {}

  getSpecialties(): Observable<SpecialtyDto[]> {
    return this.http.get<SpecialtyDto[]>(`${this.baseUrl}/specialties`);
  }

  getDepartments(): Observable<DepartmentDto[]> {
    return this.http.get<DepartmentDto[]>(`${this.baseUrl}/departments`);
  }
}

