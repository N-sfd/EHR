import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Patient } from '../models/patient.model';
import { PatientMockService } from './patient-mock.service';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private http = inject(HttpClient);
  private mockService = inject(PatientMockService);
  private apiUrl = environment.apiUrl || '';
  private useMock = environment.useMock === true;
  private readonly STORAGE_KEY = 'patients_v1';

  constructor() {
    // Only seed localStorage when useMock is true
    if (this.useMock) {
      this.initializeStorage();
    }
  }

  private initializeStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        // Seed demo data from mock service
        this.mockService.getAll().subscribe(patients => {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(patients));
        });
      }
    } catch (e) {
      console.warn('Failed to initialize patient storage:', e);
    }
  }

  // Note: This method is no longer used - all methods use catchError directly
  // Keeping it for reference but it should not wrap errors in new Error()
  // as that loses HttpErrorResponse details (status, headers, etc.)

  getAll(): Observable<Patient[]> {
    if (this.useMock) {
      console.log('[PatientService] Using mock data (useMock=true)');
      return this.mockService.getAll();
    }
    
    const url = `${this.apiUrl}/api/patients`;
    console.log('[PatientService] Fetching patients from:', url);
    
    return this.http.get<any>(url, { withCredentials: true }).pipe(
      timeout(10000), // 10 second timeout
      map(response => {
        // Handle direct array, wrapped { data }, or null/empty (rebuild from scratch: show empty list)
        let patientsArray: any[] = [];
        if (response == null) {
          patientsArray = [];
        } else if (Array.isArray(response)) {
          patientsArray = response;
        } else if (response.ok === true && Array.isArray(response.data)) {
          patientsArray = response.data;
        } else if (Array.isArray(response.data)) {
          patientsArray = response.data;
        } else {
          console.warn('[PatientService] Unexpected response shape, treating as empty list:', typeof response);
          patientsArray = [];
        }
        const mapped = (patientsArray || []).map(p => this.mapPatient(p));
        return mapped;
      }),
      catchError(err => {
        console.error('[PatientService] API call failed:', err);
        if (err.name === 'TimeoutError') {
          console.error('[PatientService] Request timed out after 10 seconds');
        }
        console.error('[PatientService] Error details:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          name: err.name,
          url: url
        });
        // Throw error instead of falling back to mock
        return throwError(() => err);
      })
    );
  }

  getById(id: number): Observable<Patient> {
    if (this.useMock) {
      return this.mockService.getById(id);
    }
    return this.http.get<any>(`${this.apiUrl}/api/patients/${id}`, { withCredentials: true }).pipe(
      map(patient => {
        if (patient == null) {
          throw new Error('Patient not found.');
        }
        return this.mapPatient(patient);
      }),
      catchError(err => {
        console.error('[PatientService] getById API call failed:', err);
        return throwError(() => err);
      })
    );
  }

  private mapPatient(patient: any): Patient {
    if (patient == null) {
      return {} as Patient;
    }
    return {
      ...patient,
      id: patient.patientId ?? patient.id,
      patientId: patient.patientId || patient.id,
      patientCode: patient.patientCode || patient.mrn,
      firstName: patient.firstName || patient.first_name,
      lastName: patient.lastName || patient.last_name,
      dateOfBirth: patient.dateOfBirth || patient.date_of_birth,
      gender: patient.gender || (patient.sex === 'MALE' ? 'Male' : patient.sex === 'FEMALE' ? 'Female' : patient.sex),
      phoneNumber: patient.phoneNumber || patient.phone_number || patient.phone,
      emailAddress: patient.email || patient.emailAddress || patient.email_address,
      address: patient.address || patient.addressLine1 || patient.address_line1,
      addressLine1: patient.address || patient.addressLine1 || patient.address_line1,
      city: patient.city,
      state: patient.state,
      zipCode: patient.zipCode || patient.zip_code,
      pincode: patient.zipCode || patient.zip_code || patient.pincode,
      status: patient.status || 'ACTIVE'
    };
  }

  getByCode(code: string): Observable<Patient> {
    if (this.useMock) {
      return this.mockService.getByCode(code);
    }
    return this.http.get<Patient>(`${this.apiUrl}/api/patients/code/${code}`, { withCredentials: true }).pipe(
      catchError(err => {
        console.error('[PatientService] getByCode API call failed:', err);
        return throwError(() => err);
      })
    );
  }

  create(patient: Partial<Patient>): Observable<Patient> {
    if (this.useMock) {
      return this.mockService.create(patient);
    }
    return this.http.post<Patient>(`${this.apiUrl}/api/patients`, patient, { withCredentials: true }).pipe(
      catchError(err => {
        console.error('[PatientService] create API call failed:', err);
        return throwError(() => err);
      })
    );
  }

  private toIsoDate(d: any): string | null {
    if (!d) return null;

    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;

    if (typeof d === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
      const [mm, dd, yyyy] = d.split('/');
      return `${yyyy}-${mm}-${dd}`;
    }

    const t = Date.parse(d);
    if (Number.isNaN(t)) return null;
    return new Date(t).toISOString().slice(0, 10);
  }

  private normalizeGender(g?: string | null): string | null {
    if (!g) return null;
    const v = g.toLowerCase();
    if (v === 'male') return 'MALE';
    if (v === 'female') return 'FEMALE';
    return g.toUpperCase();
  }

  private buildUpdatePayload(p: Partial<Patient>): any {
    // Backend DTO field names differ slightly from our frontend model (e.g. `email` vs `emailAddress`).
    // Keep this mapping robust so the "Insurance Info" tab can update without backend errors.
    const anyP = p as any;
    const email = anyP.email ?? anyP.emailAddress;
    const addressLine1 = anyP.addressLine1 ?? anyP.address;
    const zip = anyP.zipCode ?? anyP.pincode;
    const phone = anyP.phoneNumber ?? anyP.phone;
    const gender = p.gender ?? anyP.sex;

    return {
      firstName: p.firstName?.trim() ?? null,
      lastName: p.lastName?.trim() ?? null,
      dateOfBirth: this.toIsoDate(p.dateOfBirth),
      gender: this.normalizeGender(gender),
      phoneNumber: phone ?? null,
      email: email?.trim() ?? null,
      addressLine1: typeof addressLine1 === 'string' ? addressLine1.trim() : null,
      addressLine2: typeof anyP.addressLine2 === 'string' ? anyP.addressLine2.trim() : null,
      city: typeof anyP.city === 'string' ? anyP.city.trim() : null,
      state: anyP.state ?? null,
      zipCode: zip ?? null,
      country: anyP.country ?? null,
      emergencyContactName: anyP.emergencyContactName ?? null,
      emergencyContactPhone: anyP.emergencyContactPhone ?? null,
      bloodGroup: anyP.bloodGroup ?? null,
      allergies: anyP.allergies ?? null,
      medicalHistory: anyP.medicalHistory ?? null,
      photoUrl: anyP.photoUrl ?? undefined,

      // Insurance fields (needed by the backend PatientDto)
      insuranceProvider: anyP.insuranceProvider ?? null,
      insurancePolicyNumber: anyP.insurancePolicyNumber ?? null,
      primaryDoctorId: anyP.primaryDoctorId ?? null,

      status: p.status ?? 'ACTIVE'
    };
  }

  update(id: number, patient: Partial<Patient>): Observable<Patient> {
    if (this.useMock) return this.mockService.update(id, patient);

    const payload = this.buildUpdatePayload(patient);
    console.debug('[PatientService] update payload:', payload);

    return this.http.put<any>(`${this.apiUrl}/api/patients/${id}`, payload, { withCredentials: true }).pipe(
      map(updated => this.mapPatient(updated)),
      catchError(err => throwError(() => err))
    );
  }

  getPatient(id: number): Observable<Patient> {
    return this.getById(id);
  }

  updatePatient(id: number, patch: Partial<Patient>): Observable<Patient> {
    return this.update(id, patch);
  }

  private loadFromStorage(): Patient[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Failed to load patients from localStorage:', e);
      return [];
    }
  }

  private saveToStorage(patients: Patient[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(patients));
    } catch (e) {
      console.error('Failed to save patients to localStorage:', e);
    }
  }

  private persistToLocalStorage(id: number, patient: Partial<Patient> | Patient): void {
    try {
      const patients = this.loadFromStorage();
      const index = patients.findIndex(p => (p.id === id || p.patientId === id));
      
      if (index >= 0) {
        // Update existing patient
        patients[index] = { ...patients[index], ...patient, id: id, patientId: id };
      } else {
        // If not found, add new patient (should have all required fields from update/create)
        const newPatient = { ...patient, id: id, patientId: id } as Patient;
        patients.push(newPatient);
      }
      
      this.saveToStorage(patients);
    } catch (e) {
      console.warn('Failed to persist patient to localStorage:', e);
    }
  }

  delete(id: number): Observable<void> {
    if (this.useMock) {
      return this.mockService.delete(id);
    }
    return this.http.delete<void>(`${this.apiUrl}/api/patients/${id}`, { withCredentials: true }).pipe(
      catchError(err => {
        console.error('[PatientService] delete API call failed:', err);
        return throwError(() => err);
      })
    );
  }

  searchPatients(query: string): Observable<Patient[]> {
    if (this.useMock) {
      return this.mockService.searchPatients(query);
    }
    return this.http.get<any>(`${this.apiUrl}/api/patients`, {
      params: { query: query },
      withCredentials: true
    }).pipe(
      map(response => {
        let patientsArray: any[] = [];
        if (response == null) {
          patientsArray = [];
        } else if (Array.isArray(response)) {
          patientsArray = response;
        } else if (response.ok === true && Array.isArray(response.data)) {
          patientsArray = response.data;
        } else if (Array.isArray(response.data)) {
          patientsArray = response.data;
        } else {
          patientsArray = [];
        }
        return (patientsArray || []).map(p => this.mapPatient(p));
      }),
      catchError(err => {
        console.error('[PatientService] Search API call failed:', err);
        // Throw error instead of falling back to mock
        return throwError(() => err);
      })
    );
  }
}

