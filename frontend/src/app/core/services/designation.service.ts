import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DesignationDto } from '../models/designation.model';
import { MasterDataService } from './master-data.service';
import { MasterDesignation } from '../models/master-data.model';

@Injectable({
  providedIn: 'root'
})
export class DesignationService {
  private apiService = inject(ApiService);
  private masterDataService = inject(MasterDataService);
  private useMock = environment.useMock !== false; // Use environment configuration, default to true

  private convertToDesignation(masterDes: MasterDesignation): DesignationDto {
    return {
      id: Number(masterDes.id) || undefined,
      designationId: Number(masterDes.id) || undefined,
      title: masterDes.name,
      code: masterDes.code,
      description: masterDes.description,
      status: masterDes.active ? 'ACTIVE' : 'INACTIVE',
      active: masterDes.active
    } as DesignationDto;
  }

  getAll(): Observable<DesignationDto[]> {
    // First check localStorage for any user-created designations
    const storedDesignations = this.loadDesignationsFromLocalStorage();
    
    // Use MasterDataService for robust fallback
    return this.masterDataService.getDesignations().pipe(
      map((masterDes: MasterDesignation[]) => {
        // Convert MasterDesignation to DesignationDto format
        const masterDesList = masterDes.map(des => this.convertToDesignation(des));
        
        // Merge with stored designations (user-created ones take precedence)
        const merged = [...masterDesList];
        storedDesignations.forEach(stored => {
          const exists = merged.some(d => 
            d.id === stored.id || 
            d.designationId === stored.designationId ||
            (d.code && stored.code && d.code === stored.code) ||
            (d.title && stored.title && d.title === stored.title)
          );
          if (!exists) {
            merged.push(stored);
          }
        });
        
        return merged;
      })
    );
  }

  private loadDesignationsFromLocalStorage(): DesignationDto[] {
    try {
      const stored = localStorage.getItem('designations_v1');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load designations from localStorage:', e);
    }
    return [];
  }

  getById(id: number | string): Observable<DesignationDto> {
    // First check localStorage
    const storedDesignations = this.loadDesignationsFromLocalStorage();
    const storedDes = storedDesignations.find(d => 
      d.id === Number(id) || 
      d.designationId === Number(id) ||
      String(d.id) === String(id)
    );
    if (storedDes) {
      return of(storedDes);
    }

    if (this.useMock) {
      return this.masterDataService.getDesignations().pipe(
        map(designations => {
          const des = designations.find(d => String(d.id) === String(id));
          return des ? this.convertToDesignation(des) : null as any;
        })
      );
    }

    return this.apiService.get<DesignationDto>(`/api/designations/${id}`).pipe(
      catchError(err => {
        console.warn('API failed, using master data fallback:', err);
        return this.masterDataService.getDesignations().pipe(
          map(designations => {
            const des = designations.find(d => String(d.id) === String(id));
            return des ? this.convertToDesignation(des) : null as any;
          })
        );
      })
    );
  }

  create(designation: Partial<DesignationDto>): Observable<DesignationDto> {
    const newDes: DesignationDto = {
      ...designation as DesignationDto,
      id: Date.now(),
      designationId: Date.now(),
      status: designation.status || 'ACTIVE'
    };
    
    if (this.useMock) {
      // Persist to localStorage for mock mode
      this.persistDesignationToLocalStorage(newDes);
      return of(newDes);
    }

    return this.apiService.post<DesignationDto>('/api/designations', designation).pipe(
      catchError(err => {
        console.warn('API failed, saving locally:', err);
        this.persistDesignationToLocalStorage(newDes);
        return of(newDes);
      })
    );
  }

  private persistDesignationToLocalStorage(designation: DesignationDto): void {
    try {
      const storageKey = 'designations_v1';
      const stored = localStorage.getItem(storageKey);
      let designations: DesignationDto[] = stored ? JSON.parse(stored) : [];
      
      // Check if designation already exists
      const exists = designations.some(d => 
        d.id === designation.id || 
        d.designationId === designation.designationId ||
        (d.code && designation.code && d.code === designation.code) ||
        (d.title && designation.title && d.title === designation.title)
      );
      
      if (!exists) {
        designations.push(designation);
        localStorage.setItem(storageKey, JSON.stringify(designations));
      }
    } catch (e) {
      console.warn('Failed to persist designation to localStorage:', e);
    }
  }

  update(id: number | string, designation: DesignationDto): Observable<DesignationDto> {
    const updatedDes: DesignationDto = {
      ...designation,
      id: Number(id),
      designationId: Number(id)
    };
    
    if (this.useMock) {
      this.updateDesignationInLocalStorage(updatedDes);
      return of(updatedDes);
    }

    const updateDto: any = {
      title: designation.title,
      code: designation.code,
      category: designation.category,
      departmentId: designation.departmentId,
      managerial: designation.managerial,
      description: designation.description,
      status: designation.status || 'ACTIVE'
    };
    return this.apiService.put<DesignationDto>(`/api/designations/${id}`, updateDto).pipe(
      catchError(err => {
        console.warn('API failed, updating locally:', err);
        this.updateDesignationInLocalStorage(updatedDes);
        return of(updatedDes);
      })
    );
  }

  private updateDesignationInLocalStorage(designation: DesignationDto): void {
    try {
      const storageKey = 'designations_v1';
      const stored = localStorage.getItem(storageKey);
      let designations: DesignationDto[] = stored ? JSON.parse(stored) : [];
      
      const index = designations.findIndex(d => 
        d.id === designation.id || 
        d.designationId === designation.designationId ||
        String(d.id) === String(designation.id)
      );
      
      if (index >= 0) {
        designations[index] = designation;
      } else {
        designations.push(designation);
      }
      
      localStorage.setItem(storageKey, JSON.stringify(designations));
    } catch (e) {
      console.warn('Failed to update designation in localStorage:', e);
    }
  }

  delete(id: number | string): Observable<void> {
    if (this.useMock) {
      this.deleteDesignationFromLocalStorage(id);
      return of(undefined);
    }

    return this.apiService.delete<void>(`/api/designations/${id}`).pipe(
      catchError(err => {
        console.warn('API failed, deleting locally:', err);
        this.deleteDesignationFromLocalStorage(id);
        return of(undefined);
      })
    );
  }

  private deleteDesignationFromLocalStorage(id: number | string): void {
    try {
      const storageKey = 'designations_v1';
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        let designations: DesignationDto[] = JSON.parse(stored);
        designations = designations.filter(d => 
          d.id !== Number(id) && 
          d.designationId !== Number(id) &&
          String(d.id) !== String(id)
        );
        localStorage.setItem(storageKey, JSON.stringify(designations));
      }
    } catch (e) {
      console.warn('Failed to delete designation from localStorage:', e);
    }
  }

  seedDemoDesignations(): Observable<DesignationDto[]> {
    // MasterDataService already has seed data built-in
    return this.masterDataService.getDesignations().pipe(
      map((masterDes: MasterDesignation[]) => {
        return masterDes.map(des => this.convertToDesignation(des));
      })
    );
  }
}

