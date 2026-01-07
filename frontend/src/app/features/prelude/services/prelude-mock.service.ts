import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Patient } from '../../../core/models/patient.model';
import { Insurance } from '../../../core/models/insurance.model';

export interface Guarantor {
  id?: number;
  firstName: string;
  lastName: string;
  relationship: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface Appointment {
  id: number;
  date: string;
  time: string;
  provider: string;
  location: string;
  type: string;
  status: string;
}

export interface Document {
  id: number;
  name: string;
  type: string;
  uploadedDate: string;
  status: string;
  size?: string;
}

export interface Alert {
  id: number;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  category: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class PreludeMockService {
  private mockPatients: { [mrn: string]: Patient } = {
    'MRN001': {
      id: 1,
      mrn: 'MRN001',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1980-05-15',
      sex: 'MALE',
      phone: '555-0101',
      phoneNumber: '555-0101',
      email: 'john.doe@example.com',
      addressLine1: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701'
    },
    'MRN002': {
      id: 2,
      mrn: 'MRN002',
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: '1990-08-22',
      sex: 'FEMALE',
      phone: '555-0102',
      phoneNumber: '555-0102',
      email: 'jane.smith@example.com',
      addressLine1: '456 Oak Ave',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62702'
    }
  };

  private mockCoverage: { [mrn: string]: Insurance[] } = {
    'MRN001': [
      {
        id: 1,
        patientId: 1,
        payerName: 'Blue Cross Blue Shield',
        memberId: 'BC123456789',
        groupNumber: 'GRP001',
        effectiveDate: '2024-01-01',
        expirationDate: '2024-12-31',
        copayAmount: 25.00,
        deductibleAmount: 500.00,
        isActive: true,
        insuranceType: 'Primary'
      }
    ],
    'MRN002': [
      {
        id: 2,
        patientId: 2,
        payerName: 'Aetna',
        memberId: 'AET987654321',
        groupNumber: 'GRP002',
        effectiveDate: '2024-01-01',
        expirationDate: '2024-12-31',
        copayAmount: 30.00,
        deductibleAmount: 750.00,
        isActive: false,
        insuranceType: 'Primary'
      }
    ]
  };

  private mockGuarantors: { [mrn: string]: Guarantor } = {
    'MRN001': {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      relationship: 'Self',
      phone: '555-0101',
      email: 'john.doe@example.com',
      address: '123 Main St, Springfield, IL 62701'
    },
    'MRN002': {
      id: 2,
      firstName: 'Robert',
      lastName: 'Smith',
      relationship: 'Spouse',
      phone: '555-0103',
      email: 'robert.smith@example.com',
      address: '456 Oak Ave, Springfield, IL 62702'
    }
  };

  private mockAppointments: { [mrn: string]: Appointment[] } = {
    'MRN001': [
      {
        id: 1,
        date: '2026-01-10',
        time: '10:00 AM',
        provider: 'Dr. Sarah Johnson',
        location: 'Cardiology - Main Building, Floor 2',
        type: 'Follow-up',
        status: 'Scheduled'
      }
    ],
    'MRN002': [
      {
        id: 2,
        date: '2026-01-15',
        time: '2:00 PM',
        provider: 'Dr. Michael Williams',
        location: 'Pediatrics - Main Building, Floor 1',
        type: 'New Patient',
        status: 'Scheduled'
      }
    ]
  };

  private mockDocuments: { [mrn: string]: Document[] } = {
    'MRN001': [
      {
        id: 1,
        name: 'Insurance Card - Front',
        type: 'Image',
        uploadedDate: '2024-01-15',
        status: 'Verified',
        size: '2.3 MB'
      },
      {
        id: 2,
        name: 'Consent Form',
        type: 'PDF',
        uploadedDate: '2024-01-10',
        status: 'Pending',
        size: '156 KB'
      }
    ],
    'MRN002': []
  };

  private mockAlerts: { [mrn: string]: Alert[] } = {
    'MRN001': [
      {
        id: 1,
        severity: 'warning',
        message: 'Insurance eligibility not verified',
        category: 'Insurance',
        date: '2024-01-05'
      }
    ],
    'MRN002': [
      {
        id: 2,
        severity: 'critical',
        message: 'Missing required consent forms',
        category: 'Documents',
        date: '2024-01-08'
      },
      {
        id: 3,
        severity: 'info',
        message: 'Patient prefers email communication',
        category: 'Preferences',
        date: '2024-01-01'
      }
    ]
  };

  getPatientByMrn(mrn: string): Observable<Patient | null> {
    const patient = this.mockPatients[mrn] || null;
    return of(patient).pipe(delay(300));
  }

  updatePatient(mrn: string, updates: Partial<Patient>): Observable<Patient> {
    const patient = this.mockPatients[mrn];
    if (patient) {
      const updated = { ...patient, ...updates };
      this.mockPatients[mrn] = updated;
      return of(updated).pipe(delay(500));
    }
    return of(null as any).pipe(delay(500));
  }

  getCoverage(mrn: string): Observable<Insurance[]> {
    const coverage = this.mockCoverage[mrn] || [];
    return of(coverage).pipe(delay(200));
  }

  getGuarantor(mrn: string): Observable<Guarantor | null> {
    const guarantor = this.mockGuarantors[mrn] || null;
    return of(guarantor).pipe(delay(200));
  }

  getAppointments(mrn: string): Observable<Appointment[]> {
    const appointments = this.mockAppointments[mrn] || [];
    return of(appointments).pipe(delay(200));
  }

  getDocuments(mrn: string): Observable<Document[]> {
    const documents = this.mockDocuments[mrn] || [];
    return of(documents).pipe(delay(200));
  }

  getAlerts(mrn: string): Observable<Alert[]> {
    const alerts = this.mockAlerts[mrn] || [];
    return of(alerts).pipe(delay(200));
  }
}

