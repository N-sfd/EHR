import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Coverage } from '../models/coverage.model';
import { PatientConsent } from '../models/coverage.model';

@Injectable({
  providedIn: 'root'
})
export class CoverageService {
  private http = inject(HttpClient);
  private apiUrl = '/api/coverages';
  private useMock = true; // Always use mock for now

  getByPatientId(patientId: number): Observable<Coverage | null> {
    if (this.useMock) {
      return this.getMockCoverage(patientId);
    }

    return this.http.get<Coverage[]>(`${this.apiUrl}/patient/${patientId}`).pipe(
      map(coverages => coverages.find(c => c.isPrimary) || coverages[0] || null)
    );
  }

  save(patientId: number, coverage: Coverage): Observable<Coverage> {
    if (this.useMock) {
      return this.saveMockCoverage(patientId, coverage);
    }

    if (coverage.id) {
      return this.http.put<Coverage>(`${this.apiUrl}/${coverage.id}`, coverage);
    } else {
      return this.http.post<Coverage>(this.apiUrl, { ...coverage, patientId });
    }
  }

  getConsent(patientId: number): Observable<PatientConsent | null> {
    if (this.useMock) {
      return this.getMockConsent(patientId);
    }

    return this.http.get<PatientConsent>(`/api/consents/patient/${patientId}`);
  }

  saveConsent(patientId: number, consent: PatientConsent): Observable<PatientConsent> {
    if (this.useMock) {
      return this.saveMockConsent(patientId, consent);
    }

    return this.http.post<PatientConsent>('/api/consents', { ...consent, patientId });
  }

  // Mock methods
  private getMockCoverage(patientId: number): Observable<Coverage | null> {
    // Return mock coverage for some patients, null for others
    const mockCoverages: { [key: number]: Coverage } = {
      1: {
        id: 1,
        patientId: 1,
        payer: 'Blue Cross Blue Shield',
        memberId: 'BC123456789',
        eligibilityStatus: 'ACTIVE',
        isPrimary: true
      },
      2: {
        id: 2,
        patientId: 2,
        payer: 'Aetna',
        memberId: 'AE987654321',
        eligibilityStatus: 'ACTIVE',
        isPrimary: true
      },
      // Patient 3 has NOT_VERIFIED
      3: {
        id: 3,
        patientId: 3,
        payer: 'Cigna',
        memberId: 'CI555555555',
        eligibilityStatus: 'NOT_VERIFIED',
        isPrimary: true
      },
      // Patient 4 has EXPIRED
      4: {
        id: 4,
        patientId: 4,
        payer: 'United Healthcare',
        memberId: 'UH111111111',
        eligibilityStatus: 'EXPIRED',
        isPrimary: true
      }
      // Patients 5+ have no coverage (null)
    };

    const coverage = mockCoverages[patientId] || null;
    return of(coverage).pipe(delay(200));
  }

  private saveMockCoverage(patientId: number, coverage: Coverage): Observable<Coverage> {
    const saved: Coverage = {
      ...coverage,
      id: coverage.id || Math.floor(Math.random() * 1000),
      patientId
    };
    return of(saved).pipe(delay(300));
  }

  private getMockConsent(patientId: number): Observable<PatientConsent | null> {
    // Some patients have consent, some don't
    const mockConsents: { [key: number]: PatientConsent } = {
      1: {
        patientId: 1,
        consentSigned: true,
        consentDate: new Date().toISOString(),
        consentType: 'General Treatment'
      },
      2: {
        patientId: 2,
        consentSigned: true,
        consentDate: new Date().toISOString(),
        consentType: 'General Treatment'
      }
      // Patients 3+ have no consent (null)
    };

    const consent = mockConsents[patientId] || null;
    return of(consent).pipe(delay(200));
  }

  private saveMockConsent(patientId: number, consent: PatientConsent): Observable<PatientConsent> {
    const saved: PatientConsent = {
      ...consent,
      patientId,
      consentDate: consent.consentDate || new Date().toISOString()
    };
    return of(saved).pipe(delay(300));
  }
}

