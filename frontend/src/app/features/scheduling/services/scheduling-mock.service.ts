import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { PatientHeader, ProviderSchedule, ScheduleSlot, InsuranceSnapshot, AppointmentBlock, WaitlistItem, TimeBlock } from '../../appointment/models/appointment-scheduling.models';
import { Patient } from '../../../core/models/patient.model';
import { Doctor } from '../../../core/models/doctor.model';
import { Department } from '../../../core/models/department.model';

const STORAGE_KEY_APPOINTMENTS = 'scheduling_appointments_v1';
const STORAGE_KEY_WAITLIST = 'scheduling_waitlist_v1';
const STORAGE_KEY_PROVIDERS = 'scheduling_providers_v1';
const STORAGE_KEY_DEPARTMENTS = 'scheduling_departments_v1';
const STORAGE_KEY_TIMEBLOCKS = 'scheduling_timeblocks_v1';

@Injectable({
  providedIn: 'root'
})
export class SchedulingMockService {
  private appointments: AppointmentBlock[] = [];
  private waitlist: WaitlistItem[] = [];
  private timeBlocks: TimeBlock[] = [];

  constructor() {
    this.loadFromStorage();
    this.ensureSeededData();
  }

  private loadFromStorage(): void {
    try {
      const appointmentsStored = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
      if (appointmentsStored) {
        this.appointments = JSON.parse(appointmentsStored);
      }

      const waitlistStored = localStorage.getItem(STORAGE_KEY_WAITLIST);
      if (waitlistStored) {
        this.waitlist = JSON.parse(waitlistStored);
      }

      const timeBlocksStored = localStorage.getItem(STORAGE_KEY_TIMEBLOCKS);
      if (timeBlocksStored) {
        this.timeBlocks = JSON.parse(timeBlocksStored);
      }
    } catch (e) {
      console.warn('Failed to load scheduling data from storage:', e);
    }
  }

  private saveAppointmentsToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(this.appointments));
    } catch (e) {
      console.error('Failed to save appointments to storage:', e);
    }
  }

  private saveWaitlistToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY_WAITLIST, JSON.stringify(this.waitlist));
    } catch (e) {
      console.error('Failed to save waitlist to storage:', e);
    }
  }

  private saveTimeBlocksToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY_TIMEBLOCKS, JSON.stringify(this.timeBlocks));
    } catch (e) {
      console.error('Failed to save time blocks to storage:', e);
    }
  }

  private ensureSeededData(): void {
    // Ensure providers are seeded
    const providersStored = localStorage.getItem(STORAGE_KEY_PROVIDERS);
    if (!providersStored) {
      localStorage.setItem(STORAGE_KEY_PROVIDERS, JSON.stringify(this.mockProviders));
    }

    // Ensure departments are seeded
    const departmentsStored = localStorage.getItem(STORAGE_KEY_DEPARTMENTS);
    if (!departmentsStored) {
      localStorage.setItem(STORAGE_KEY_DEPARTMENTS, JSON.stringify(this.mockDepartments));
    }

    // Seed appointments if empty
    if (this.appointments.length === 0) {
      this.seedAppointments();
    }

    // Seed waitlist if empty
    if (this.waitlist.length === 0) {
      this.seedWaitlist();
    }

    // Seed time blocks if empty
    if (this.timeBlocks.length === 0) {
      this.seedTimeBlocks();
    }
  }

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
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROVIDERS);
      if (stored) {
        const providers = JSON.parse(stored);
        if (providers && providers.length > 0) {
          return of(providers).pipe(delay(100));
        }
      }
    } catch (e) {
      console.warn('Failed to load providers from storage:', e);
    }
    // Fallback to seeded data
    localStorage.setItem(STORAGE_KEY_PROVIDERS, JSON.stringify(this.mockProviders));
    return of([...this.mockProviders]).pipe(delay(100));
  }

  getDepartments(): Observable<Department[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DEPARTMENTS);
      if (stored) {
        const departments = JSON.parse(stored);
        if (departments && departments.length > 0) {
          return of(departments).pipe(delay(100));
        }
      }
    } catch (e) {
      console.warn('Failed to load departments from storage:', e);
    }
    // Fallback to seeded data
    localStorage.setItem(STORAGE_KEY_DEPARTMENTS, JSON.stringify(this.mockDepartments));
    return of([...this.mockDepartments]).pipe(delay(100));
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

  cancelAppointment(appointmentId: number, reason: string): Observable<void> {
    const index = this.appointments.findIndex(a => (a.id === appointmentId || a.appointmentId === appointmentId));
    if (index >= 0) {
      this.appointments[index].status = 'Cancelled';
      this.saveAppointmentsToStorage();
    }
    return of(undefined).pipe(delay(200));
  }

  getAppointmentsByRange(startDate: string, endDate: string, providerIds?: number[]): Observable<AppointmentBlock[]> {
    let filtered = this.appointments.filter(apt => {
      const aptDate = new Date(apt.startDateTime);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (aptDate < start || aptDate > end) {
        return false;
      }

      if (providerIds && providerIds.length > 0) {
        if (!providerIds.includes(apt.providerId)) {
          return false;
        }
      }

      return true;
    });

    return of([...filtered]).pipe(delay(200));
  }

  moveAppointment(id: number, patch: { date?: string; startTime?: string; providerId?: number }): Observable<AppointmentBlock> {
    const appointment = this.appointments.find(a => (a.id === id || a.appointmentId === id));
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (patch.date && patch.startTime) {
      const newDateTime = `${patch.date}T${patch.startTime}`;
      appointment.startDateTime = newDateTime;
      const end = new Date(newDateTime);
      end.setMinutes(end.getMinutes() + appointment.durationMinutes);
      appointment.endDateTime = end.toISOString();
    }

    if (patch.providerId !== undefined) {
      appointment.providerId = patch.providerId;
      const provider = this.mockProviders.find(p => p.id === patch.providerId);
      if (provider) {
        appointment.providerName = `${provider.firstName} ${provider.lastName}`;
      }
    }

    this.saveAppointmentsToStorage();
    return of({ ...appointment }).pipe(delay(300));
  }

  resizeAppointment(id: number, patch: { durationMinutes: number }): Observable<AppointmentBlock> {
    const appointment = this.appointments.find(a => (a.id === id || a.appointmentId === id));
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Snap to 15-minute intervals
    const snappedDuration = Math.round(patch.durationMinutes / 15) * 15;
    appointment.durationMinutes = snappedDuration;
    const end = new Date(appointment.startDateTime);
    end.setMinutes(end.getMinutes() + snappedDuration);
    appointment.endDateTime = end.toISOString();

    this.saveAppointmentsToStorage();
    return of({ ...appointment }).pipe(delay(300));
  }

  getWaitlist(): Observable<WaitlistItem[]> {
    return of([...this.waitlist]).pipe(delay(100));
  }

  createAppointmentFromWaitlist(waitlistItem: WaitlistItem, slot: { date: string; startTime: string; providerId: number }): Observable<AppointmentBlock> {
    const startDateTime = `${slot.date}T${slot.startTime}`;
    const end = new Date(startDateTime);
    end.setMinutes(end.getMinutes() + 30);

    const provider = this.mockProviders.find(p => p.id === slot.providerId);
    const newAppointment: AppointmentBlock = {
      id: Date.now(),
      appointmentId: Date.now(),
      appointmentCode: `AP${Date.now()}`,
      patientId: waitlistItem.patientId,
      patientName: waitlistItem.patientName,
      providerId: slot.providerId,
      providerName: provider ? `${provider.firstName} ${provider.lastName}` : `Provider ${slot.providerId}`,
      startDateTime,
      endDateTime: end.toISOString(),
      durationMinutes: 30,
      visitType: 'Follow-up',
      status: 'Schedule',
      priority: waitlistItem.priority,
      slotStatus: 'BOOKED',
      reason: waitlistItem.reason
    };

    this.appointments.push(newAppointment);
    this.saveAppointmentsToStorage();

    // Remove from waitlist
    const waitlistIndex = this.waitlist.findIndex(w => w.id === waitlistItem.id);
    if (waitlistIndex >= 0) {
      this.waitlist.splice(waitlistIndex, 1);
      this.saveWaitlistToStorage();
    }

    return of({ ...newAppointment }).pipe(delay(300));
  }

  getTimeBlocks(providerId: number, date: string): Observable<TimeBlock[]> {
    const blocks = this.timeBlocks.filter(block => {
      if (block.providerId !== providerId) return false;
      if (block.isRecurring) {
        // Check if it's a weekday for daily recurring blocks
        const dayOfWeek = new Date(date).getDay();
        return dayOfWeek >= 1 && dayOfWeek <= 5; // Mon-Fri
      }
      return block.date === date;
    });
    return of([...blocks]).pipe(delay(100));
  }

  getAppointmentById(id: number): Observable<any> {
    const appt = this.appointments.find(a => (a.id || a.appointmentId) === id);
    if (!appt) {
      throw new Error('Appointment not found');
    }
    // Convert AppointmentBlock to Appointment format
    return of({
      id: appt.id || appt.appointmentId,
      appointmentId: appt.appointmentId || appt.id,
      appointmentCode: appt.appointmentCode,
      patientId: appt.patientId,
      doctorId: appt.providerId,
      providerId: appt.providerId,
      departmentId: appt.departmentId,
      appointmentType: 'In Person',
      visitType: appt.visitType,
      appointmentDate: appt.startDateTime.split('T')[0],
      date: appt.startDateTime.split('T')[0],
      appointmentTime: new Date(appt.startDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).slice(0, 5),
      time: new Date(appt.startDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).slice(0, 5),
      durationMinutes: appt.durationMinutes,
      status: appt.status,
      reason: appt.reason,
      notes: appt.notes,
      patientName: appt.patientName,
      doctorName: appt.providerName,
      departmentName: appt.departmentName
    }).pipe(delay(200));
  }

  private seedAppointments(): void {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const providers = [1, 2, 3];
    const visitTypes: AppointmentBlock['visitType'][] = ['New Patient', 'Follow-up', 'Consultation', 'Procedure', 'Annual Physical', 'Urgent Care'];
    const statuses: AppointmentBlock['status'][] = ['Schedule', 'Confirmed', 'Arrived', 'Checked In'];
    const priorities: AppointmentBlock['priority'][] = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
    const patients = [1, 2];
    const patientNames = ['John Doe', 'Jane Smith'];

    for (let day = 0; day < 5; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() + day);
      
      providers.forEach(providerId => {
        // Morning appointments
        for (let hour = 9; hour < 12; hour++) {
          if (Math.random() > 0.4) {
            const minutes = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
            const startDateTime = new Date(date);
            startDateTime.setHours(hour, minutes, 0, 0);
            const end = new Date(startDateTime);
            end.setMinutes(end.getMinutes() + 30);

            const patientIdx = Math.floor(Math.random() * patients.length);
            const provider = this.mockProviders.find(p => p.id === providerId);

            this.appointments.push({
              id: this.appointments.length + 1,
              appointmentId: this.appointments.length + 1,
              appointmentCode: `AP${1000 + this.appointments.length}`,
              patientId: patients[patientIdx],
              patientName: patientNames[patientIdx],
              providerId,
              providerName: provider ? `${provider.firstName} ${provider.lastName}` : `Provider ${providerId}`,
              startDateTime: startDateTime.toISOString(),
              endDateTime: end.toISOString(),
              durationMinutes: 30,
              visitType: visitTypes[Math.floor(Math.random() * visitTypes.length)],
              status: statuses[Math.floor(Math.random() * statuses.length)],
              priority: priorities[Math.floor(Math.random() * priorities.length)],
              slotStatus: 'BOOKED',
              departmentId: 1,
              departmentName: 'Cardiology'
            });
          }
        }

        // Afternoon appointments
        for (let hour = 13; hour < 17; hour++) {
          if (Math.random() > 0.5) {
            const minutes = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
            const startDateTime = new Date(date);
            startDateTime.setHours(hour, minutes, 0, 0);
            const end = new Date(startDateTime);
            end.setMinutes(end.getMinutes() + 30);

            const patientIdx = Math.floor(Math.random() * patients.length);
            const provider = this.mockProviders.find(p => p.id === providerId);

            this.appointments.push({
              id: this.appointments.length + 1,
              appointmentId: this.appointments.length + 1,
              appointmentCode: `AP${1000 + this.appointments.length}`,
              patientId: patients[patientIdx],
              patientName: patientNames[patientIdx],
              providerId,
              providerName: provider ? `${provider.firstName} ${provider.lastName}` : `Provider ${providerId}`,
              startDateTime: startDateTime.toISOString(),
              endDateTime: end.toISOString(),
              durationMinutes: 30,
              visitType: visitTypes[Math.floor(Math.random() * visitTypes.length)],
              status: statuses[Math.floor(Math.random() * statuses.length)],
              priority: priorities[Math.floor(Math.random() * priorities.length)],
              slotStatus: 'BOOKED',
              departmentId: 1,
              departmentName: 'Cardiology'
            });
          }
        }
      });
    }

    this.saveAppointmentsToStorage();
  }

  private seedWaitlist(): void {
    this.waitlist = [
      {
        id: '1',
        patientId: 3,
        patientName: 'Robert Johnson',
        patientMrn: 'MRN003',
        reason: 'Urgent follow-up needed',
        priority: 'URGENT',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        patientId: 4,
        patientName: 'Maria Garcia',
        patientMrn: 'MRN004',
        reason: 'Prefer morning appointment',
        priority: 'HIGH',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        patientId: 5,
        patientName: 'William Brown',
        patientMrn: 'MRN005',
        reason: 'Routine checkup',
        priority: 'NORMAL',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    this.saveWaitlistToStorage();
  }

  private seedTimeBlocks(): void {
    const providers = [1, 2, 3];
    
    this.timeBlocks = providers.flatMap(providerId => [
      {
        type: 'LUNCH' as const,
        providerId,
        startTime: '12:00',
        endTime: '13:00',
        date: '', // Will match any date when isRecurring is true
        isRecurring: true,
        recurrencePattern: 'DAILY' as const,
        title: 'Lunch'
      }
    ]);

    this.saveTimeBlocksToStorage();
  }
}

