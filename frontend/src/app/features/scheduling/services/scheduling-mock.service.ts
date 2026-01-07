import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { PatientHeader, ProviderSchedule, ScheduleSlot, InsuranceSnapshot } from '../models/scheduling.model';
import { Patient } from '../../../core/models/patient.model';
import { Doctor } from '../../../core/models/doctor.model';
import { Department } from '../../../core/models/department.model';

@Injectable({
  providedIn: 'root'
})
export class SchedulingMockService {
  private mockPatients: Patient[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      patientCode: 'MRN001',
      dateOfBirth: '1980-05-15',
      gender: 'Male',
      phoneNumber: '555-0101',
      emailAddress: 'john.doe@example.com',
      status: 'ACTIVE'
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      patientCode: 'MRN002',
      dateOfBirth: '1990-08-22',
      gender: 'Female',
      phoneNumber: '555-0102',
      emailAddress: 'jane.smith@example.com',
      status: 'ACTIVE'
    }
  ];

  private mockProviders: Doctor[] = [
    { id: 1, firstName: 'Dr. Sarah', lastName: 'Johnson', doctorCode: 'DOC001', specializations: [] },
    { id: 2, firstName: 'Dr. Michael', lastName: 'Williams', doctorCode: 'DOC002', specializations: [] },
    { id: 3, firstName: 'Dr. Emily', lastName: 'Brown', doctorCode: 'DOC003', specializations: [] }
  ];

  private mockDepartments: Department[] = [
    { id: 1, name: 'Cardiology', code: 'CARD', type: 'CLINICAL' },
    { id: 2, name: 'Pediatrics', code: 'PEDS', type: 'CLINICAL' },
    { id: 3, name: 'Internal Medicine', code: 'IMED', type: 'CLINICAL' }
  ];

  getPatientHeader(patientId: number): Observable<PatientHeader> {
    const patient = this.mockPatients.find(p => p.id === patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    const dob = new Date(patient.dateOfBirth || '');
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    const alerts: PatientHeader['alerts'] = [];
    
    // Mock alerts
    if (patientId === 1) {
      alerts.push({
        type: 'error',
        message: 'Insurance eligibility expired',
        category: 'eligibility'
      });
    }
    if (!patient.emailAddress) {
      alerts.push({
        type: 'warning',
        message: 'Missing email address',
        category: 'demographics'
      });
    }

    const header: PatientHeader = {
      patientId: patient.id!,
      patientName: `${patient.firstName} ${patient.lastName}`,
      mrn: patient.patientCode || 'N/A',
      dob: patient.dateOfBirth || '',
      age,
      sex: patient.gender || 'N/A',
      alerts
    };

    return of(header).pipe(delay(300));
  }

  searchPatients(query: string): Observable<Patient[]> {
    const search = query.toLowerCase();
    const results = this.mockPatients.filter(p => {
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      const mrn = p.patientCode?.toLowerCase() || '';
      const phone = p.phoneNumber?.toLowerCase() || '';
      return fullName.includes(search) || mrn.includes(search) || phone.includes(search);
    });
    return of(results).pipe(delay(200));
  }

  getProviderSchedules(providerIds: number[], date: string): Observable<ProviderSchedule[]> {
    const schedules: ProviderSchedule[] = providerIds.map(providerId => {
      const provider = this.mockProviders.find(p => p.id === providerId);
      const slots: ScheduleSlot[] = [];

      // Generate time slots from 8 AM to 5 PM (30-minute intervals)
      for (let hour = 8; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const endHour = minute + 30 >= 60 ? hour + 1 : hour;
          const endMinute = (minute + 30) % 60;
          const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

          // Randomly assign status for demo
          const rand = Math.random();
          let status: ScheduleSlot['status'] = 'AVAILABLE';
          let appointmentId: number | undefined;
          let appointmentCode: string | undefined;
          let patientName: string | undefined;
          let visitType: string | undefined;

          if (rand < 0.25) {
            status = 'BOOKED';
            appointmentId = Math.floor(Math.random() * 1000);
            appointmentCode = `AP${appointmentId}`;
            patientName = this.mockPatients[Math.floor(Math.random() * this.mockPatients.length)].firstName + 
                         ' ' + this.mockPatients[Math.floor(Math.random() * this.mockPatients.length)].lastName;
            visitType = 'Follow-up';
          } else if (rand < 0.28) {
            status = 'OVERBOOK';
            appointmentId = Math.floor(Math.random() * 1000);
            appointmentCode = `AP${appointmentId}`;
            patientName = 'Sample Patient';
            visitType = 'Urgent Care';
          } else if (rand < 0.3) {
            status = 'BLOCKED';
          }

          slots.push({
            id: `${providerId}-${date}-${startTime}`,
            providerId,
            providerName: provider ? `${provider.firstName} ${provider.lastName}` : `Provider ${providerId}`,
            startTime,
            endTime,
            status,
            appointmentId,
            appointmentCode,
            patientName,
            visitType,
            isSelectable: status === 'AVAILABLE'
          });
        }
      }

      return {
        providerId,
        providerName: provider ? `${provider.firstName} ${provider.lastName}` : `Provider ${providerId}`,
        date,
        slots
      };
    });

    return of(schedules).pipe(delay(400));
  }

  getProviders(): Observable<Doctor[]> {
    return of(this.mockProviders).pipe(delay(200));
  }

  getDepartments(): Observable<Department[]> {
    return of(this.mockDepartments).pipe(delay(200));
  }

  getInsuranceSnapshot(patientId: number): Observable<InsuranceSnapshot> {
    const snapshot: InsuranceSnapshot = {
      payerName: 'Blue Cross Blue Shield',
      memberId: 'BC123456789',
      eligibilityStatus: patientId === 1 ? 'EXPIRED' : 'ACTIVE',
      eligibilityDate: patientId === 1 ? '2023-12-31' : '2024-12-31',
      copayAmount: 25,
      deductibleAmount: 500
    };

    return of(snapshot).pipe(delay(300));
  }

  saveAppointment(appointment: any): Observable<any> {
    // Simulate save
    const saved = {
      ...appointment,
      appointmentId: Math.floor(Math.random() * 10000),
      appointmentCode: `AP${Math.floor(Math.random() * 100000)}`,
      createdAt: new Date().toISOString()
    };
    return of(saved).pipe(delay(500));
  }
}

