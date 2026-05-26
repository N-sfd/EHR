import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SpecializationDto } from '../models/specialization.model';
import { MasterDataService } from './master-data.service';
import { MasterSpecialization } from '../models/master-data.model';

@Injectable({
  providedIn: 'root'
})
export class SpecializationService {
  private apiService = inject(ApiService);
  private masterDataService = inject(MasterDataService);
  private useMock = environment.useMock !== false; // Use environment configuration, default to true

  getAll(): Observable<SpecializationDto[]> {
    // Use MasterDataService for robust fallback
    return this.masterDataService.getSpecializations().pipe(
      map((masterSpecs: MasterSpecialization[]) => {
        // Convert MasterSpecialization to SpecializationDto format
        return masterSpecs.map(spec => ({
          id: Number(spec.id) || undefined,
          specializationId: Number(spec.id) || undefined,
          name: spec.name,
          code: spec.code,
          departmentId: spec.departmentId ? Number(spec.departmentId) : undefined,
          description: spec.description,
          status: spec.active ? 'ACTIVE' : 'INACTIVE'
        } as SpecializationDto));
      }),
      catchError(err => {
        console.warn('MasterDataService failed for specializations:', err);
        // Return empty array as last resort (shouldn't happen with seeded data)
        return of([]);
      })
    );
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

