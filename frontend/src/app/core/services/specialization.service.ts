import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { SpecializationDto } from '../models/specialization.model';

@Injectable({
  providedIn: 'root'
})
export class SpecializationService {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<SpecializationDto[]> {
    return this.apiService.get<SpecializationDto[]>('/api/specializations');
  }

  getById(id: number): Observable<SpecializationDto> {
    return this.apiService.get<SpecializationDto>(`/api/specializations/${id}`);
  }

  create(specialization: Partial<SpecializationDto>): Observable<SpecializationDto> {
    return this.apiService.post<SpecializationDto>('/api/specializations', specialization);
  }

  update(id: number, specialization: SpecializationDto): Observable<SpecializationDto> {
    return this.apiService.put<SpecializationDto>(`/api/specializations/${id}`, specialization);
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`/api/specializations/${id}`);
  }
}

