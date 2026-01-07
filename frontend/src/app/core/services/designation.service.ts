import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { DesignationDto } from '../models/designation.model';

@Injectable({
  providedIn: 'root'
})
export class DesignationService {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<DesignationDto[]> {
    return this.apiService.get<DesignationDto[]>('/api/designations');
  }

  getById(id: number): Observable<DesignationDto> {
    return this.apiService.get<DesignationDto>(`/api/designations/${id}`);
  }

  create(designation: Partial<DesignationDto>): Observable<DesignationDto> {
    return this.apiService.post<DesignationDto>('/api/designations', designation);
  }

  update(id: number, designation: DesignationDto): Observable<DesignationDto> {
    return this.apiService.put<DesignationDto>(`/api/designations/${id}`, designation);
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`/api/designations/${id}`);
  }
}

