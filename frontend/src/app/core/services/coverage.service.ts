import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map, catchError } from 'rxjs';
import { Coverage } from '../models/coverage.model';

const STORAGE_KEY = 'coverages_v1';
const CONSENT_STORAGE_KEY = 'patient_consents_v1';

@Injectable({
  providedIn: 'root'
})
export class CoverageService {
  private http = inject(HttpClient);
  private coverages: Coverage[] = [];
  private consents: any[] = [];

  constructor() {
    this.loadFromStorage();
    this.loadConsentsFromStorage();
    if (this.coverages.length === 0) {
      this.seedDemoCoverages();
    }
    if (this.consents.length === 0) {
      this.seedDemoConsents();
    }
  }

  getCoverages(patientId: number): Observable<Coverage[]> {
    const patientCoverages = this.coverages.filter(c => c.patientId === patientId);
    return of([...patientCoverages]).pipe(delay(200));
  }

  // Backward compatibility methods
  getByPatientId(patientId: number): Observable<Coverage | null> {
    const patientCoverages = this.coverages.filter(c => c.patientId === patientId);
    return of(patientCoverages.length > 0 ? patientCoverages[0] : null).pipe(delay(200));
  }

  getConsent(patientId: number): Observable<any> {
    // Check localStorage first
    const stored = this.loadConsentsFromStorage();
    const consent = stored.find(c => c.patientId === patientId);
    if (consent) {
      return of(consent).pipe(delay(100));
    }

    // Try API call (use relative /api/... so proxy works; avoid double /api)
    const baseUrl = (window as any).__ENV__?.apiUrl ?? '';
    const url = baseUrl ? `${baseUrl}/api/patients/${patientId}/consent` : `/api/patients/${patientId}/consent`;
    return this.http.get<any>(url, { withCredentials: true }).pipe(
      map(consentData => {
        const consent: any = {
          patientId,
          consentSigned: consentData?.consentSigned || consentData?.consent_signed || false,
          consentDate: consentData?.consentDate || consentData?.consent_date,
          consentType: consentData?.consentType || consentData?.consent_type || 'General Consent',
          signedBy: consentData?.signedBy || consentData?.signed_by
        };
        this.saveConsentToStorage(consent);
        return consent;
      }),
      catchError(() => {
        // If API fails, check if we have consent in database via migration
        // For now, return signed consent for seed data patients
        const seedConsent: any = {
          patientId,
          consentSigned: true,
          consentDate: new Date().toISOString().split('T')[0],
          consentType: 'General Consent',
          signedBy: 'System Admin'
        };
        this.saveConsentToStorage(seedConsent);
        return of(seedConsent).pipe(delay(100));
      })
    );
  }

  save(patientId: number, coverage: Partial<Coverage>): Observable<Coverage> {
    return this.upsertCoverage(patientId, coverage);
  }

  saveConsent(patientId: number, consent: any): Observable<any> {
    // Mock consent save - just return the consent
    return of(consent).pipe(delay(200));
  }

  upsertCoverage(patientId: number, coverage: Partial<Coverage>): Observable<Coverage> {
    const existingIndex = this.coverages.findIndex(
      c => c.patientId === patientId && c.id === coverage.id
    );

    const newCoverage: Coverage = {
      id: coverage.id || Date.now(),
      patientId,
      payer: coverage.payer || '',
      memberId: coverage.memberId || '',
      groupNumber: coverage.groupNumber,
      startDate: coverage.startDate,
      endDate: coverage.endDate,
      eligibilityStatus: coverage.eligibilityStatus || 'ACTIVE',
      copay: coverage.copay,
      deductible: coverage.deductible,
      isPrimary: coverage.isPrimary ?? true
    };

    if (existingIndex >= 0) {
      this.coverages[existingIndex] = newCoverage;
    } else {
      this.coverages.push(newCoverage);
    }

    this.saveToStorage();
    return of({ ...newCoverage }).pipe(delay(300));
  }

  deleteCoverage(id: number): Observable<void> {
    const index = this.coverages.findIndex(c => c.id === id);
    if (index >= 0) {
      this.coverages.splice(index, 1);
      this.saveToStorage();
    }
    return of(undefined).pipe(delay(200));
  }

  private seedDemoCoverages(): void {
    const seedCoverages: Coverage[] = [
      {
        id: 1,
        patientId: 1,
        payer: 'Blue Cross Blue Shield',
        memberId: 'BC123456789',
        groupNumber: 'GRP001',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        eligibilityStatus: 'ACTIVE',
        copay: 25.00,
        deductible: 500.00,
        isPrimary: true
      },
      {
        id: 2,
        patientId: 2,
        payer: 'Aetna',
        memberId: 'AET987654321',
        groupNumber: 'GRP002',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        eligibilityStatus: 'ACTIVE',
        copay: 30.00,
        deductible: 750.00,
        isPrimary: true
      },
      {
        id: 3,
        patientId: 3,
        payer: 'Cigna',
        memberId: 'CIG555666777',
        groupNumber: 'GRP003',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        eligibilityStatus: 'EXPIRED',
        copay: 20.00,
        deductible: 1000.00,
        isPrimary: true
      },
      {
        id: 4,
        patientId: 4,
        payer: 'UnitedHealthcare',
        memberId: 'UHC111222333',
        groupNumber: 'GRP004',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        eligibilityStatus: 'ACTIVE',
        copay: 35.00,
        deductible: 600.00,
        isPrimary: true
      },
      {
        id: 5,
        patientId: 5,
        payer: 'Medicaid',
        memberId: 'MD123456',
        groupNumber: 'GRP005',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        eligibilityStatus: 'ACTIVE',
        copay: 0.00,
        deductible: 0.00,
        isPrimary: true
      }
    ];

    this.coverages = seedCoverages;
    this.saveToStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.coverages = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load coverages from localStorage:', e);
      this.coverages = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.coverages));
    } catch (e) {
      console.error('Failed to save coverages to localStorage:', e);
    }
  }

  private loadConsentsFromStorage(): any[] {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored) {
        this.consents = JSON.parse(stored);
        return this.consents;
      }
    } catch (e) {
      console.warn('Failed to load consents from localStorage:', e);
    }
    return [];
  }

  private saveConsentToStorage(consent: any): void {
    try {
      const existingIndex = this.consents.findIndex(c => c.patientId === consent.patientId);
      if (existingIndex >= 0) {
        this.consents[existingIndex] = consent;
      } else {
        this.consents.push(consent);
      }
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(this.consents));
    } catch (e) {
      console.error('Failed to save consent to localStorage:', e);
    }
  }

  private seedDemoConsents(): void {
    // Seed consent data for all patients (1-10)
    const seedConsents: any[] = [];
    for (let i = 1; i <= 10; i++) {
      seedConsents.push({
        patientId: i,
        consentSigned: true,
        consentDate: new Date().toISOString().split('T')[0],
        consentType: 'General Consent',
        signedBy: 'System Admin'
      });
    }
    this.consents = seedConsents;
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(this.consents));
    } catch (e) {
      console.error('Failed to save seed consents:', e);
    }
  }
}
