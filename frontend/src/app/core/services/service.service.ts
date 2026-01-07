import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Service, CreateServiceDto } from '../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<Service[]> {
    return this.apiService.get<Service[]>('/api/services');
  }

  getById(id: number): Observable<Service> {
    return this.apiService.get<Service>(`/api/services/${id}`);
  }

  create(service: CreateServiceDto): Observable<Service> {
    return this.apiService.post<Service>('/api/services', service);
  }

  update(id: number, service: Partial<CreateServiceDto>): Observable<Service> {
    return this.apiService.put<Service>(`/api/services/${id}`, service);
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`/api/services/${id}`);
  }
}

