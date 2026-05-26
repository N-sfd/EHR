import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Encounter } from '../models/encounter.model';

@Injectable({
  providedIn: 'root'
})
export class EncounterMockService {
  private mockEncounters: Encounter[] = [
    {
      id: 1,
      encounterId: 1,
      encounterNumber: 'ENC001',
      patientId: 1,
      appointmentId: 1,
      encounterType: 'Office Visit',
      encounterStatus: 'ARRIVED',
      checkInDateTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      arrivalDateTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      checkInByStaffId: 1,
      primaryProviderId: 1,
      departmentId: 1,
      chiefComplaint: 'Annual physical examination',
      visitReason: 'Routine checkup',
      roomAssigned: 'Room 101'
    },
    {
      id: 2,
      encounterId: 2,
      encounterNumber: 'ENC002',
      patientId: 2,
      appointmentId: 2,
      encounterType: 'Office Visit',
      encounterStatus: 'IN_PROGRESS',
      checkInDateTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      arrivalDateTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      checkInByStaffId: 1,
      primaryProviderId: 2,
      departmentId: 2,
      chiefComplaint: 'Chest pain',
      visitReason: 'Follow-up',
      roomAssigned: 'Room 205'
    },
    {
      id: 3,
      encounterId: 3,
      encounterNumber: 'ENC003',
      patientId: 3,
      appointmentId: 3,
      encounterType: 'Office Visit',
      encounterStatus: 'COMPLETED',
      checkInDateTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      checkOutDateTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      arrivalDateTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      checkInByStaffId: 1,
      checkOutByStaffId: 1,
      primaryProviderId: 1,
      departmentId: 1,
      chiefComplaint: 'Headache',
      visitReason: 'Sick visit',
      roomAssigned: 'Room 102'
    },
    {
      id: 4,
      encounterId: 4,
      encounterNumber: 'ENC004',
      patientId: 4,
      appointmentId: 4,
      encounterType: 'Office Visit',
      encounterStatus: 'ROOMING',
      checkInDateTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      arrivalDateTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      checkInByStaffId: 1,
      primaryProviderId: 2,
      departmentId: 2,
      chiefComplaint: 'Fever and cough',
      visitReason: 'Sick visit',
      roomAssigned: 'Room 203'
    },
    {
      id: 5,
      encounterId: 5,
      encounterNumber: 'ENC005',
      patientId: 5,
      appointmentId: 5,
      encounterType: 'Office Visit',
      encounterStatus: 'ARRIVED',
      checkInDateTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      arrivalDateTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      checkInByStaffId: 1,
      primaryProviderId: 1,
      departmentId: 1,
      chiefComplaint: 'Back pain',
      visitReason: 'Follow-up'
    },
    {
      id: 6,
      encounterId: 6,
      encounterNumber: 'ENC006',
      patientId: 6,
      appointmentId: 6,
      encounterType: 'Office Visit',
      encounterStatus: 'IN_PROGRESS',
      checkInDateTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      arrivalDateTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      checkInByStaffId: 1,
      primaryProviderId: 3,
      departmentId: 3,
      chiefComplaint: 'Well child check',
      visitReason: 'Routine checkup',
      roomAssigned: 'Room 301'
    },
    {
      id: 7,
      encounterId: 7,
      encounterNumber: 'ENC007',
      patientId: 7,
      appointmentId: 7,
      encounterType: 'Office Visit',
      encounterStatus: 'COMPLETED',
      checkInDateTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      checkOutDateTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      arrivalDateTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      checkInByStaffId: 1,
      checkOutByStaffId: 1,
      primaryProviderId: 4,
      departmentId: 4,
      chiefComplaint: 'Knee pain',
      visitReason: 'Follow-up',
      roomAssigned: 'Room 401'
    },
    {
      id: 8,
      encounterId: 8,
      encounterNumber: 'ENC008',
      patientId: 8,
      appointmentId: 8,
      encounterType: 'Office Visit',
      encounterStatus: 'ARRIVED',
      checkInDateTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      arrivalDateTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      checkInByStaffId: 1,
      primaryProviderId: 5,
      departmentId: 5,
      chiefComplaint: 'Skin rash',
      visitReason: 'New patient',
      roomAssigned: 'Room 501'
    },
    {
      id: 9,
      encounterId: 9,
      encounterNumber: 'ENC009',
      patientId: 9,
      appointmentId: 9,
      encounterType: 'Office Visit',
      encounterStatus: 'ROOMING',
      checkInDateTime: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      arrivalDateTime: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      checkInByStaffId: 1,
      primaryProviderId: 6,
      departmentId: 1,
      chiefComplaint: 'Annual physical',
      visitReason: 'Routine checkup',
      roomAssigned: 'Room 201'
    },
    {
      id: 10,
      encounterId: 10,
      encounterNumber: 'ENC010',
      patientId: 10,
      appointmentId: 10,
      encounterType: 'Office Visit',
      encounterStatus: 'IN_PROGRESS',
      checkInDateTime: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      arrivalDateTime: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      checkInByStaffId: 1,
      primaryProviderId: 7,
      departmentId: 6,
      chiefComplaint: 'Diabetes management',
      visitReason: 'Follow-up',
      roomAssigned: 'Room 601'
    },
    {
      id: 11,
      encounterId: 11,
      encounterNumber: 'ENC011',
      patientId: 11,
      appointmentId: 11,
      encounterType: 'Office Visit',
      encounterStatus: 'ARRIVED',
      checkInDateTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      arrivalDateTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      checkInByStaffId: 1,
      primaryProviderId: 8,
      departmentId: 7,
      chiefComplaint: 'Headache evaluation',
      visitReason: 'New patient'
    },
    {
      id: 12,
      encounterId: 12,
      encounterNumber: 'ENC012',
      patientId: 12,
      appointmentId: 12,
      encounterType: 'Office Visit',
      encounterStatus: 'COMPLETED',
      checkInDateTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      checkOutDateTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      arrivalDateTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      checkInByStaffId: 1,
      checkOutByStaffId: 1,
      primaryProviderId: 9,
      departmentId: 8,
      chiefComplaint: 'Annual exam',
      visitReason: 'Routine checkup',
      roomAssigned: 'Room 801'
    },
    {
      id: 13,
      encounterId: 13,
      encounterNumber: 'ENC013',
      patientId: 13,
      appointmentId: 13,
      encounterType: 'Office Visit',
      encounterStatus: 'ROOMING',
      checkInDateTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      arrivalDateTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      checkInByStaffId: 1,
      primaryProviderId: 10,
      departmentId: 9,
      chiefComplaint: 'Shortness of breath',
      visitReason: 'Follow-up',
      roomAssigned: 'Room 901'
    },
    {
      id: 14,
      encounterId: 14,
      encounterNumber: 'ENC014',
      patientId: 14,
      appointmentId: 14,
      encounterType: 'Office Visit',
      encounterStatus: 'ARRIVED',
      checkInDateTime: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      arrivalDateTime: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      checkInByStaffId: 1,
      primaryProviderId: 11,
      departmentId: 10,
      chiefComplaint: 'Anxiety follow-up',
      visitReason: 'Follow-up'
    },
    {
      id: 15,
      encounterId: 15,
      encounterNumber: 'ENC015',
      patientId: 15,
      appointmentId: 15,
      encounterType: 'Office Visit',
      encounterStatus: 'IN_PROGRESS',
      checkInDateTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      arrivalDateTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      checkInByStaffId: 1,
      primaryProviderId: 12,
      departmentId: 11,
      chiefComplaint: 'Stomach pain',
      visitReason: 'Sick visit',
      roomAssigned: 'Room 1101'
    }
  ];

  create(encounter: Encounter): Observable<Encounter> {
    const newEncounter: Encounter = {
      ...encounter,
      id: this.mockEncounters.length + 1,
      encounterId: this.mockEncounters.length + 1,
      encounterNumber: `ENC${String(this.mockEncounters.length + 1).padStart(3, '0')}`,
      encounterStatus: 'ROOMING',
      checkInDateTime: new Date().toISOString()
    };
    this.mockEncounters.push(newEncounter);
    return of(newEncounter).pipe(delay(400));
  }

  createFromAppointment(appointmentId: number): Observable<Encounter> {
    const encounter: Encounter = {
      id: this.mockEncounters.length + 1,
      encounterId: this.mockEncounters.length + 1,
      encounterNumber: `ENC${String(this.mockEncounters.length + 1).padStart(3, '0')}`,
      patientId: 1,
      appointmentId: appointmentId,
      encounterType: 'Office Visit',
      encounterStatus: 'ROOMING',
      checkInDateTime: new Date().toISOString(),
      checkInByStaffId: 1
    };
    this.mockEncounters.push(encounter);
    return of(encounter).pipe(delay(400));
  }

  get(id: number): Observable<Encounter> {
    const encounter = this.mockEncounters.find(e => e.id === id || e.encounterId === id);
    return of(encounter || this.mockEncounters[0]).pipe(delay(200));
  }

  update(id: number, encounter: Encounter): Observable<Encounter> {
    const index = this.mockEncounters.findIndex(e => e.id === id || e.encounterId === id);
    if (index >= 0) {
      this.mockEncounters[index] = { ...this.mockEncounters[index], ...encounter };
      return of(this.mockEncounters[index]).pipe(delay(400));
    }
    return of(encounter).pipe(delay(400));
  }

  getAll(): Observable<Encounter[]> {
    return of([...this.mockEncounters]).pipe(delay(300));
  }

  getByPatientId(patientId: number): Observable<Encounter[]> {
    const encounters = this.mockEncounters.filter(e => e.patientId === patientId);
    return of(encounters.length > 0 ? encounters : this.mockEncounters).pipe(delay(300));
  }

  getByAppointmentId(appointmentId: number): Observable<Encounter | null> {
    const encounter = this.mockEncounters.find(e => e.appointmentId === appointmentId);
    return of(encounter || null).pipe(delay(200));
  }
}

