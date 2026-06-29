import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Patient } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl || '';

  getAll(): Observable<Patient[]> {
    const url = `${this.apiUrl}/api/patients`;
    return this.http.get<any>(url, { withCredentials: true }).pipe(
      timeout(10000),
      map(response => this.unwrapPatients(response)),
      catchError(err => throwError(() => err))
    );
  }

  getById(id: number): Observable<Patient> {
    return this.http.get<any>(`${this.apiUrl}/api/patients/${id}`, { withCredentials: true }).pipe(
      map(patient => {
        if (patient == null) {
          throw new Error('Patient not found.');
        }
        return this.mapPatient(patient);
      }),
      catchError(err => throwError(() => err))
    );
  }

  getByCode(code: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/api/patients/code/${code}`, { withCredentials: true }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  create(patient: Partial<Patient>): Observable<Patient> {
    return this.http.post<Patient>(`${this.apiUrl}/api/patients`, patient, { withCredentials: true }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  update(id: number, patient: Partial<Patient>): Observable<Patient> {
    const payload = this.buildUpdatePayload(patient);
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

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/patients/${id}`, { withCredentials: true }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  searchPatients(query: string): Observable<Patient[]> {
    return this.http.get<any>(`${this.apiUrl}/api/patients`, {
      params: { query },
      withCredentials: true
    }).pipe(
      map(response => this.unwrapPatients(response)),
      catchError(err => throwError(() => err))
    );
  }

  private unwrapPatients(response: any): Patient[] {
    let patientsArray: any[] = [];
    if (response == null) {
      patientsArray = [];
    } else if (Array.isArray(response)) {
      patientsArray = response;
    } else if (response.ok === true && Array.isArray(response.data)) {
      patientsArray = response.data;
    } else if (Array.isArray(response.data)) {
      patientsArray = response.data;
    }
    return (patientsArray || []).map(p => this.mapPatient(p));
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
      insuranceProvider: anyP.insuranceProvider ?? null,
      insurancePolicyNumber: anyP.insurancePolicyNumber ?? null,
      primaryDoctorId: anyP.primaryDoctorId ?? null,
      status: p.status ?? 'ACTIVE'
    };
  }
}
