import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Patient } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientMockService {
  private mockPatients: Patient[] = [
    {
      id: 1,
      patientId: 1,
      patientCode: 'MRN001',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1980-05-15',
      gender: 'Male',
      phoneNumber: '555-0101',
      emailAddress: 'john.doe@example.com',
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces'
    },
    {
      id: 2,
      patientId: 2,
      patientCode: 'MRN002',
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: '1990-08-22',
      gender: 'Female',
      phoneNumber: '555-0102',
      emailAddress: 'jane.smith@example.com',
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces'
    },
    {
      id: 3,
      patientId: 3,
      patientCode: 'MRN003',
      firstName: 'Robert',
      lastName: 'Johnson',
      // Missing dateOfBirth - CRITICAL
      gender: 'Male',
      phoneNumber: '555-0103',
      emailAddress: 'robert.j@example.com',
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces'
    },
    {
      id: 4,
      patientId: 4,
      patientCode: 'MRN004',
      firstName: 'Maria',
      lastName: 'Garcia',
      dateOfBirth: '1985-11-30',
      gender: 'Female',
      phoneNumber: '555-0104',
      emailAddress: 'maria.garcia@example.com',
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces'
    },
    {
      id: 5,
      patientId: 5,
      patientCode: 'MRN005',
      firstName: 'William',
      lastName: 'Brown',
      dateOfBirth: '1972-07-18',
      gender: 'Male',
      phoneNumber: '', // Empty phoneNumber - CRITICAL
      emailAddress: 'william.brown@example.com',
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces'
      // Missing address fields - CRITICAL
    },
    {
      id: 6,
      patientId: 6,
      patientCode: 'MRN006',
      firstName: 'Patricia',
      lastName: 'Davis',
      dateOfBirth: '1992-04-25',
      gender: 'Female',
      phoneNumber: '555-0106',
      emailAddress: 'patricia.davis@example.com',
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces'
      // Missing addressLine1, city, state, zipCode - CRITICAL
    },
    {
      id: 6,
      patientId: 6,
      patientCode: 'MRN006',
      firstName: 'Patricia',
      lastName: 'Davis',
      dateOfBirth: '1992-04-25',
      gender: 'Female',
      phoneNumber: '555-0106',
      emailAddress: 'patricia.davis@example.com',
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces'
    },
    {
      id: 7,
      patientId: 7,
      patientCode: 'MRN007',
      firstName: 'Michael',
      lastName: 'Miller',
      // Missing dateOfBirth - CRITICAL
      gender: 'Male',
      phoneNumber: '555-0107',
      emailAddress: 'michael.miller@example.com',
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces'
    },
    {
      id: 8,
      patientId: 8,
      patientCode: 'MRN008',
      firstName: 'Jennifer',
      lastName: 'Wilson',
      dateOfBirth: '1995-01-08',
      gender: 'Female',
      phoneNumber: '', // Empty phoneNumber - CRITICAL
      emailAddress: 'jennifer.wilson@example.com',
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces'
    },
    {
      id: 9,
      patientId: 9,
      patientCode: 'MRN009',
      firstName: 'David',
      lastName: 'Moore',
      dateOfBirth: '1978-12-03',
      gender: 'Male',
      phoneNumber: '555-0109',
      emailAddress: 'david.moore@example.com',
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces'
      // Missing addressLine1, city, state, zipCode - CRITICAL
    },
    {
      id: 10,
      patientId: 10,
      patientCode: 'MRN010',
      firstName: 'Elizabeth',
      lastName: 'Taylor',
      // Missing dateOfBirth - CRITICAL
      gender: 'Female',
      phoneNumber: '555-0110',
      emailAddress: 'elizabeth.taylor@example.com',
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=faces'
    },
    {
      id: 11,
      patientId: 11,
      patientCode: 'MRN011',
      firstName: 'Christopher',
      lastName: 'Anderson',
      dateOfBirth: '1991-03-14',
      gender: 'Male',
      phoneNumber: '555-0111',
      emailAddress: 'christopher.anderson@example.com',
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces'
    },
    {
      id: 12,
      patientId: 12,
      patientCode: 'MRN012',
      firstName: 'Sarah',
      lastName: 'Thomas',
      dateOfBirth: '1987-10-05',
      gender: 'Female',
      phoneNumber: '555-0112',
      emailAddress: 'sarah.thomas@example.com',
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&crop=faces'
    },
    {
      id: 13,
      patientId: 13,
      patientCode: 'MRN013',
      firstName: 'Daniel',
      lastName: 'Jackson',
      dateOfBirth: '1976-02-28',
      gender: 'Male',
      phoneNumber: '555-0113',
      emailAddress: 'daniel.jackson@example.com',
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces'
    },
    {
      id: 14,
      patientId: 14,
      patientCode: 'MRN014',
      firstName: 'Jessica',
      lastName: 'White',
      dateOfBirth: '1993-08-17',
      gender: 'Female',
      phoneNumber: '555-0114',
      emailAddress: 'jessica.white@example.com',
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces'
    },
    {
      id: 15,
      patientId: 15,
      patientCode: 'MRN015',
      firstName: 'Matthew',
      lastName: 'Harris',
      dateOfBirth: '1989-05-22',
      gender: 'Male',
      phoneNumber: '555-0115',
      emailAddress: 'matthew.harris@example.com',
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces'
    }
  ];

  getAll(): Observable<Patient[]> {
    return of(this.mockPatients).pipe(delay(300));
  }

  getById(id: number): Observable<Patient> {
    const patient = this.mockPatients.find(p => p.id === id || p.patientId === id);
    return of(patient || this.mockPatients[0]).pipe(delay(200));
  }

  getByCode(code: string): Observable<Patient> {
    const patient = this.mockPatients.find(p => p.patientCode === code);
    return of(patient || this.mockPatients[0]).pipe(delay(200));
  }

  searchPatients(query: string): Observable<Patient[]> {
    const lowerQuery = query.toLowerCase();
    const results = this.mockPatients.filter(p => 
      p.firstName?.toLowerCase().includes(lowerQuery) ||
      p.lastName?.toLowerCase().includes(lowerQuery) ||
      p.patientCode?.toLowerCase().includes(lowerQuery) ||
      p.phoneNumber?.includes(query)
    );
    return of(results.length > 0 ? results : this.mockPatients).pipe(delay(300));
  }

  create(patient: Partial<Patient>): Observable<Patient> {
    const newPatient: Patient = {
      ...patient,
      id: this.mockPatients.length + 1,
      patientId: this.mockPatients.length + 1,
      patientCode: `MRN${String(this.mockPatients.length + 1).padStart(3, '0')}`,
      status: 'ACTIVE'
    } as Patient;
    this.mockPatients.push(newPatient);
    return of(newPatient).pipe(delay(400));
  }

  update(id: number, patient: Partial<Patient>): Observable<Patient> {
    const index = this.mockPatients.findIndex(p => p.id === id || p.patientId === id);
    if (index >= 0) {
      this.mockPatients[index] = { ...this.mockPatients[index], ...patient };
      return of(this.mockPatients[index]).pipe(delay(400));
    }
    return of(patient as Patient).pipe(delay(400));
  }

  delete(id: number): Observable<void> {
    const index = this.mockPatients.findIndex(p => p.id === id || p.patientId === id);
    if (index >= 0) {
      this.mockPatients.splice(index, 1);
    }
    return of(undefined).pipe(delay(300));
  }
}

