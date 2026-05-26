import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, BehaviorSubject } from 'rxjs';
import { catchError, map, tap, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MasterDepartment, MasterSpecialization, MasterDesignation } from '../models/master-data.model';
import { SEED_DEPARTMENTS, SEED_SPECIALIZATIONS, SEED_DESIGNATIONS } from './master-data.seed';

const CACHE_VERSION = 'masterdata_v1';
const CACHE_KEY_DEPARTMENTS = `${CACHE_VERSION}_departments`;
const CACHE_KEY_SPECIALIZATIONS = `${CACHE_VERSION}_specializations`;
const CACHE_KEY_DESIGNATIONS = `${CACHE_VERSION}_designations`;
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry<T> {
  data: T[];
  timestamp: number;
  isSeeded: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MasterDataService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl || '';
  private useMock = environment.useMock !== false; // Use environment configuration, default to true

  private departmentsCache$ = new BehaviorSubject<MasterDepartment[] | null>(null);
  private specializationsCache$ = new BehaviorSubject<MasterSpecialization[] | null>(null);
  private designationsCache$ = new BehaviorSubject<MasterDesignation[] | null>(null);
  private isOfflineMode$ = new BehaviorSubject<boolean>(false);

  constructor() {
    // Load from cache on init
    this.loadFromCache();
  }

  getDepartments(): Observable<MasterDepartment[]> {
    // Return cached if available
    if (this.departmentsCache$.value) {
      return of(this.departmentsCache$.value);
    }

    if (this.useMock) {
      return this.getSeededDepartments();
    }

    return this.http.get<any[]>(`${this.apiUrl}/api/departments`, { withCredentials: true }).pipe(
      map(departments => {
        if (!departments || departments.length === 0) {
          // Don't throw, fall back to seeded data
          return [];
        }
        return this.mapToMasterDepartments(departments);
      }),
      tap(departments => {
        if (departments.length > 0) {
          this.departmentsCache$.next(departments);
          this.saveToCache(CACHE_KEY_DEPARTMENTS, departments, false);
          this.isOfflineMode$.next(false);
        } else {
          // Empty response, use seeded data
          this.getSeededDepartments().subscribe(seeded => {
            this.departmentsCache$.next(seeded);
          });
        }
      }),
      catchError(err => {
        console.warn('API failed, using seeded data:', err);
        this.isOfflineMode$.next(true);
        return this.getSeededDepartments();
      }),
      shareReplay(1)
    );
  }

  getSpecializations(): Observable<MasterSpecialization[]> {
    // Return cached if available
    if (this.specializationsCache$.value) {
      return of(this.specializationsCache$.value);
    }

    if (this.useMock) {
      return this.getSeededSpecializations();
    }

    return this.http.get<any[]>(`${this.apiUrl}/api/specializations`, { withCredentials: true }).pipe(
      map(specializations => {
        if (!specializations || specializations.length === 0) {
          // Don't throw, fall back to seeded data
          return [];
        }
        return this.mapToMasterSpecializations(specializations);
      }),
      tap(specializations => {
        if (specializations.length > 0) {
          this.specializationsCache$.next(specializations);
          this.saveToCache(CACHE_KEY_SPECIALIZATIONS, specializations, false);
          this.isOfflineMode$.next(false);
        } else {
          // Empty response, use seeded data
          this.getSeededSpecializations().subscribe(seeded => {
            this.specializationsCache$.next(seeded);
          });
        }
      }),
      catchError(err => {
        console.warn('API failed, using seeded data:', err);
        this.isOfflineMode$.next(true);
        return this.getSeededSpecializations();
      }),
      shareReplay(1)
    );
  }

  getDesignations(): Observable<MasterDesignation[]> {
    // Return cached if available
    if (this.designationsCache$.value) {
      return of(this.designationsCache$.value);
    }

    if (this.useMock) {
      return this.getSeededDesignations();
    }

    return this.http.get<any[]>(`${this.apiUrl}/api/designations`, { withCredentials: true }).pipe(
      map(designations => {
        if (!designations || designations.length === 0) {
          // Don't throw, fall back to seeded data
          return [];
        }
        return this.mapToMasterDesignations(designations);
      }),
      tap(designations => {
        if (designations.length > 0) {
          this.designationsCache$.next(designations);
          this.saveToCache(CACHE_KEY_DESIGNATIONS, designations, false);
          this.isOfflineMode$.next(false);
        } else {
          // Empty response, use seeded data
          this.getSeededDesignations().subscribe(seeded => {
            this.designationsCache$.next(seeded);
          });
        }
      }),
      catchError(err => {
        console.warn('API failed, using seeded data:', err);
        this.isOfflineMode$.next(true);
        return this.getSeededDesignations();
      }),
      shareReplay(1)
    );
  }

  loadAll(): Observable<{ departments: MasterDepartment[]; specializations: MasterSpecialization[]; designations: MasterDesignation[] }> {
    return forkJoin({
      departments: this.getDepartments(),
      specializations: this.getSpecializations(),
      designations: this.getDesignations()
    });
  }

  refresh(): void {
    this.departmentsCache$.next(null);
    this.specializationsCache$.next(null);
    this.designationsCache$.next(null);
    localStorage.removeItem(CACHE_KEY_DEPARTMENTS);
    localStorage.removeItem(CACHE_KEY_SPECIALIZATIONS);
    localStorage.removeItem(CACHE_KEY_DESIGNATIONS);
  }

  isOfflineMode(): Observable<boolean> {
    return this.isOfflineMode$.asObservable();
  }

  // Providers - always returns data, never throws
  getProviders(): Observable<any[]> {
    try {
      const cached = localStorage.getItem('providers_v1');
      if (cached) {
        const providers = JSON.parse(cached);
        if (providers && providers.length > 0) {
          return of(providers);
        }
      }
    } catch (e) {
      console.warn('Failed to load providers from cache:', e);
    }

    // Seed demo providers
    const seededProviders = this.getSeededProviders();
    try {
      localStorage.setItem('providers_v1', JSON.stringify(seededProviders));
    } catch (e) {
      console.warn('Failed to save providers to cache:', e);
    }
    return of(seededProviders);
  }

  // Locations - always returns data, never throws
  getLocations(): Observable<any[]> {
    try {
      const cached = localStorage.getItem('locations_v1');
      if (cached) {
        const locations = JSON.parse(cached);
        if (locations && locations.length > 0) {
          return of(locations);
        }
      }
    } catch (e) {
      console.warn('Failed to load locations from cache:', e);
    }

    // Seed demo locations
    const seededLocations = this.getSeededLocations();
    try {
      localStorage.setItem('locations_v1', JSON.stringify(seededLocations));
    } catch (e) {
      console.warn('Failed to save locations to cache:', e);
    }
    return of(seededLocations);
  }

  // Rooms - always returns data, never throws
  getRooms(): Observable<any[]> {
    try {
      const cached = localStorage.getItem('rooms_v1');
      if (cached) {
        const rooms = JSON.parse(cached);
        if (rooms && rooms.length > 0) {
          return of(rooms);
        }
      }
    } catch (e) {
      console.warn('Failed to load rooms from cache:', e);
    }

    // Seed demo rooms
    const seededRooms = this.getSeededRooms();
    try {
      localStorage.setItem('rooms_v1', JSON.stringify(seededRooms));
    } catch (e) {
      console.warn('Failed to save rooms to cache:', e);
    }
    return of(seededRooms);
  }

  private getSeededProviders(): any[] {
    return [
      { id: 1, name: 'Dr. Sarah Johnson', departmentId: 1, color: '#4A90E2' },
      { id: 2, name: 'Dr. Michael Williams', departmentId: 1, color: '#50C878' },
      { id: 3, name: 'Dr. Emily Brown', departmentId: 2, color: '#FF6B6B' },
      { id: 4, name: 'Dr. James Wilson', departmentId: 2, color: '#FFD93D' },
      { id: 5, name: 'Dr. Lisa Anderson', departmentId: 3, color: '#9B59B6' },
      { id: 6, name: 'Dr. Robert Taylor', departmentId: 3, color: '#3498DB' }
    ];
  }

  private getSeededLocations(): any[] {
    return [
      { id: 1, name: 'Main Office', address: '123 Main St, City, State 12345' },
      { id: 2, name: 'Branch Office', address: '456 Oak Ave, City, State 12345' }
    ];
  }

  private getSeededRooms(): any[] {
    return [
      { id: 1, name: 'Room 101', locationId: 1, capacity: 1 },
      { id: 2, name: 'Room 102', locationId: 1, capacity: 1 },
      { id: 3, name: 'Room 201', locationId: 2, capacity: 1 },
      { id: 4, name: 'Room 202', locationId: 2, capacity: 1 }
    ];
  }

  private getSeededDepartments(): Observable<MasterDepartment[]> {
    const seeded = [...SEED_DEPARTMENTS];
    this.departmentsCache$.next(seeded);
    this.saveToCache(CACHE_KEY_DEPARTMENTS, seeded, true);
    return of(seeded);
  }

  private getSeededSpecializations(): Observable<MasterSpecialization[]> {
    const seeded = [...SEED_SPECIALIZATIONS];
    this.specializationsCache$.next(seeded);
    this.saveToCache(CACHE_KEY_SPECIALIZATIONS, seeded, true);
    return of(seeded);
  }

  private getSeededDesignations(): Observable<MasterDesignation[]> {
    const seeded = [...SEED_DESIGNATIONS];
    this.designationsCache$.next(seeded);
    this.saveToCache(CACHE_KEY_DESIGNATIONS, seeded, true);
    return of(seeded);
  }

  private mapToMasterDepartments(departments: any[]): MasterDepartment[] {
    return departments.map(dept => ({
      id: String(dept.departmentId || dept.id || ''),
      name: dept.name || '',
      description: dept.description,
      active: dept.status === 'ACTIVE' || dept.active !== false,
      code: dept.code,
      specialtyGroup: dept.specialtyGroup
    }));
  }

  private mapToMasterSpecializations(specializations: any[]): MasterSpecialization[] {
    return specializations.map(spec => ({
      id: String(spec.specializationId || spec.id || ''),
      name: spec.name || '',
      departmentId: spec.departmentId ? String(spec.departmentId) : undefined,
      active: spec.status === 'ACTIVE' || spec.active !== false,
      code: spec.code,
      description: spec.description
    }));
  }

  private mapToMasterDesignations(designations: any[]): MasterDesignation[] {
    return designations.map(des => ({
      id: String(des.designationId || des.id || ''),
      name: des.title || des.name || '',
      active: des.status === 'ACTIVE' || des.active !== false,
      code: des.code,
      description: des.description
    }));
  }

  private saveToCache<T>(key: string, data: T[], isSeeded: boolean): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        isSeeded
      };
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (e) {
      console.warn('Failed to save to cache:', e);
    }
  }

  private loadFromCache(): void {
    try {
      const deptEntry = localStorage.getItem(CACHE_KEY_DEPARTMENTS);
      const specEntry = localStorage.getItem(CACHE_KEY_SPECIALIZATIONS);

      if (deptEntry) {
        const entry: CacheEntry<MasterDepartment> = JSON.parse(deptEntry);
        if (Date.now() - entry.timestamp < CACHE_EXPIRY) {
          this.departmentsCache$.next(entry.data);
          if (entry.isSeeded) {
            this.isOfflineMode$.next(true);
          }
        }
      }

      if (specEntry) {
        const entry: CacheEntry<MasterSpecialization> = JSON.parse(specEntry);
        if (Date.now() - entry.timestamp < CACHE_EXPIRY) {
          this.specializationsCache$.next(entry.data);
          if (entry.isSeeded) {
            this.isOfflineMode$.next(true);
          }
        }
      }

      const desEntry = localStorage.getItem(CACHE_KEY_DESIGNATIONS);
      if (desEntry) {
        const entry: CacheEntry<MasterDesignation> = JSON.parse(desEntry);
        if (Date.now() - entry.timestamp < CACHE_EXPIRY) {
          this.designationsCache$.next(entry.data);
          if (entry.isSeeded) {
            this.isOfflineMode$.next(true);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load from cache:', e);
    }
  }
}

