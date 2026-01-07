import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Department, CreateDepartmentDto } from '../models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<Department[]> {
    return this.apiService.get<Department[]>('/api/departments');
  }

  getById(id: number): Observable<Department> {
    return this.apiService.get<Department>(`/api/departments/${id}`);
  }

  create(department: CreateDepartmentDto): Observable<Department> {
    return this.apiService.post<Department>('/api/departments', department);
  }

  update(id: number, department: Department): Observable<Department> {
    // Map to backend DTO structure
    const updateDto: any = {
      name: department.name,
      code: department.code,
      type: department.type,
      description: department.description,
      phoneNumber: department.phoneNumber,
      email: department.email,
      status: department.status
    };
    return this.apiService.put<Department>(`/api/departments/${id}`, updateDto);
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`/api/departments/${id}`);
  }
}

