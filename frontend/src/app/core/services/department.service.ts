import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Department, CreateDepartmentDto } from '../models/department.model';
import { MasterDataService } from './master-data.service';
import { MasterDepartment } from '../models/master-data.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiService = inject(ApiService);
  private masterDataService = inject(MasterDataService);
  private useMock = environment.useMock !== false; // Use environment configuration, default to true

  private convertToDepartment(masterDept: MasterDepartment): Department {
    return {
      id: masterDept.id,
      departmentId: Number(masterDept.id) || undefined,
      name: masterDept.name,
      code: masterDept.code,
      description: masterDept.description,
      active: masterDept.active,
      status: masterDept.active ? 'ACTIVE' : 'INACTIVE',
      specialtyGroup: masterDept.specialtyGroup
    } as Department;
  }

  getAll(): Observable<Department[]> {
    // Always load fresh from localStorage (don't rely on cached MasterDataService)
    const storedDepartments = this.loadDepartmentsFromLocalStorage();
    
    // Use MasterDataService for robust fallback, but always merge fresh localStorage data
    return this.masterDataService.getDepartments().pipe(
      map((masterDepts: MasterDepartment[]) => {
        // Convert MasterDepartment to Department format
        const masterDeptList = masterDepts.map(dept => this.convertToDepartment(dept));
        
        // Merge with stored departments (user-created ones take precedence)
        // Always reload from localStorage to get latest data
        const freshStored = this.loadDepartmentsFromLocalStorage();
        const merged = [...masterDeptList];
        
        freshStored.forEach(stored => {
          const exists = merged.some(d => 
            String(d.id) === String(stored.id) || 
            d.departmentId === stored.departmentId ||
            (d.code && stored.code && d.code === stored.code) ||
            (d.name && stored.name && d.name === stored.name)
          );
          if (!exists) {
            merged.push(stored);
          }
        });
        
        return merged;
      })
    );
  }

  private loadDepartmentsFromLocalStorage(): Department[] {
    try {
      const stored = localStorage.getItem('departments_v1');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load departments from localStorage:', e);
    }
    return [];
  }

  getById(id: number | string): Observable<Department> {
    // First check localStorage
    const storedDepartments = this.loadDepartmentsFromLocalStorage();
    const storedDept = storedDepartments.find(d => 
      d.id === String(id) || 
      d.departmentId === Number(id) ||
      String(d.id) === String(id)
    );
    if (storedDept) {
      return of(storedDept);
    }

    if (this.useMock) {
      return this.masterDataService.getDepartments().pipe(
        map(departments => {
          const dept = departments.find(d => String(d.id) === String(id));
          return dept ? this.convertToDepartment(dept) : null as any;
        })
      );
    }

    return this.apiService.get<Department>(`/api/departments/${id}`).pipe(
      catchError(err => {
        console.warn('API failed, using master data fallback:', err);
        return this.masterDataService.getDepartments().pipe(
          map(departments => {
            const dept = departments.find(d => String(d.id) === String(id));
            return dept ? this.convertToDepartment(dept) : null as any;
          })
        );
      })
    );
  }

  create(department: CreateDepartmentDto): Observable<Department> {
    if (this.useMock) {
      const newDept: Department = {
        ...department,
        id: Date.now().toString(),
        departmentId: Date.now(),
        active: department.status !== 'INACTIVE',
        status: department.status || 'ACTIVE'
      };
      
      // Persist to localStorage for mock mode
      this.persistDepartmentToLocalStorage(newDept);
      
      return of(newDept);
    }

    return this.apiService.post<Department>('/api/departments', department).pipe(
      catchError(err => {
        console.warn('API failed, saving locally:', err);
        const newDept: Department = {
          ...department,
          id: Date.now().toString(),
          departmentId: Date.now(),
          active: department.status !== 'INACTIVE',
          status: department.status || 'ACTIVE'
        };
        this.persistDepartmentToLocalStorage(newDept);
        return of(newDept);
      })
    );
  }

  private persistDepartmentToLocalStorage(department: Department): void {
    try {
      const storageKey = 'departments_v1';
      const stored = localStorage.getItem(storageKey);
      let departments: Department[] = stored ? JSON.parse(stored) : [];
      
      // Check if department already exists
      const exists = departments.some(d => 
        d.id === department.id || 
        d.departmentId === department.departmentId ||
        (d.code && department.code && d.code === department.code)
      );
      
      if (!exists) {
        departments.push(department);
        localStorage.setItem(storageKey, JSON.stringify(departments));
      }
    } catch (e) {
      console.warn('Failed to persist department to localStorage:', e);
    }
  }

  update(id: number | string, department: Department): Observable<Department> {
    const updatedDept: Department = {
      ...department,
      id: String(id),
      departmentId: typeof id === 'number' ? id : Number(id) || undefined,
      active: department.status !== 'INACTIVE'
    };
    
    if (this.useMock) {
      this.updateDepartmentInLocalStorage(updatedDept);
      return of(updatedDept);
    }

    const updateDto: any = {
      name: department.name,
      code: department.code,
      type: department.type,
      description: department.description,
      phoneNumber: department.phoneNumber,
      email: department.email,
      status: department.status || (department.active ? 'ACTIVE' : 'INACTIVE')
    };
    return this.apiService.put<Department>(`/api/departments/${id}`, updateDto).pipe(
      catchError(err => {
        console.warn('API failed, updating locally:', err);
        this.updateDepartmentInLocalStorage(updatedDept);
        return of(updatedDept);
      })
    );
  }

  private updateDepartmentInLocalStorage(department: Department): void {
    try {
      const storageKey = 'departments_v1';
      const stored = localStorage.getItem(storageKey);
      let departments: Department[] = stored ? JSON.parse(stored) : [];
      
      const index = departments.findIndex(d => 
        d.id === department.id || 
        d.departmentId === department.departmentId ||
        String(d.id) === String(department.id)
      );
      
      if (index >= 0) {
        departments[index] = department;
      } else {
        departments.push(department);
      }
      
      localStorage.setItem(storageKey, JSON.stringify(departments));
    } catch (e) {
      console.warn('Failed to update department in localStorage:', e);
    }
  }

  delete(id: number | string): Observable<void> {
    if (this.useMock) {
      this.deleteDepartmentFromLocalStorage(id);
      return of(undefined);
    }

    return this.apiService.delete<void>(`/api/departments/${id}`).pipe(
      catchError(err => {
        console.warn('API failed, deleting locally:', err);
        this.deleteDepartmentFromLocalStorage(id);
        return of(undefined);
      })
    );
  }

  private deleteDepartmentFromLocalStorage(id: number | string): void {
    try {
      const storageKey = 'departments_v1';
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        let departments: Department[] = JSON.parse(stored);
        departments = departments.filter(d => 
          d.id !== String(id) && 
          d.departmentId !== Number(id) &&
          String(d.id) !== String(id)
        );
        localStorage.setItem(storageKey, JSON.stringify(departments));
      }
    } catch (e) {
      console.warn('Failed to delete department from localStorage:', e);
    }
  }

  seedDemoDepartments(): Observable<Department[]> {
    // MasterDataService already has seed data built-in
    return this.masterDataService.getDepartments().pipe(
      map((masterDepts: MasterDepartment[]) => {
        return masterDepts.map(dept => this.convertToDepartment(dept));
      })
    );
  }
}

