import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { AppointmentBookAppointment, AppointmentFilters, TimeBlock } from '../../features/appointment/models/appointment-scheduling.models';

const STORAGE_KEY = 'appointments_v1';
const TIME_BLOCKS_KEY = 'time_blocks_v1';

@Injectable({
  providedIn: 'root'
})
export class AppointmentStoreService {
  private appointments: AppointmentBookAppointment[] = [];
  private timeBlocks: TimeBlock[] = [];

  constructor() {
    this.loadFromStorage();
  }

  listByRange(startDate: string, endDate: string, filters?: AppointmentFilters): Observable<AppointmentBookAppointment[]> {
    let filtered = this.appointments.filter(apt => {
      const aptDate = new Date(apt.startDateTime);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (aptDate < start || aptDate > end) {
        return false;
      }

      if (filters) {
        if (filters.providerIds && filters.providerIds.length > 0) {
          if (!filters.providerIds.includes(apt.providerId)) {
            return false;
          }
        }
        if (filters.locationIds && filters.locationIds.length > 0) {
          if (apt.locationId && !filters.locationIds.includes(apt.locationId)) {
            return false;
          }
        }
        if (filters.statuses && filters.statuses.length > 0) {
          if (!filters.statuses.includes(apt.status)) {
            return false;
          }
        }
        if (filters.types && filters.types.length > 0) {
          if (!filters.types.includes(apt.type)) {
            return false;
          }
        }
      }

      return true;
    });

    // Detect conflicts
    filtered = filtered.map(apt => {
      const conflicts = filtered.filter(other => {
        if (other.id === apt.id) return false;
        if (other.providerId !== apt.providerId) return false;
        if (other.allowOverbook || apt.allowOverbook) return false;
        
        const aptStart = new Date(apt.startDateTime);
        const aptEnd = new Date(apt.endDateTime || this.calculateEndTime(apt.startDateTime, apt.durationMinutes));
        const otherStart = new Date(other.startDateTime);
        const otherEnd = new Date(other.endDateTime || this.calculateEndTime(other.startDateTime, other.durationMinutes));
        
        return (aptStart < otherEnd && aptEnd > otherStart);
      });
      
      return { ...apt, conflicts };
    });

    return of([...filtered]).pipe(delay(200));
  }

  getById(id: number): Observable<AppointmentBookAppointment | null> {
    const appointment = this.appointments.find(a => (a.id === id || a.appointmentId === id));
    return of(appointment || null).pipe(delay(100));
  }

  create(appointment: Partial<AppointmentBookAppointment>): Observable<AppointmentBookAppointment> {
    const newAppointment: AppointmentBookAppointment = {
      id: Date.now(),
      appointmentId: Date.now(),
      appointmentCode: `AP${Date.now()}`,
      patientId: appointment.patientId || 0,
      providerId: appointment.providerId || 0,
      startDateTime: appointment.startDateTime || new Date().toISOString(),
      durationMinutes: appointment.durationMinutes || 30,
      status: appointment.status || 'SCHEDULED',
      type: appointment.type || 'FOLLOW_UP',
      priority: appointment.priority || 'NORMAL',
      level: appointment.level || 'L1',
      ...appointment
    } as AppointmentBookAppointment;

    if (!newAppointment.endDateTime) {
      newAppointment.endDateTime = this.calculateEndTime(newAppointment.startDateTime, newAppointment.durationMinutes);
    }

    this.appointments.push(newAppointment);
    this.saveToStorage();
    return of({ ...newAppointment }).pipe(delay(300));
  }

  update(id: number, appointment: Partial<AppointmentBookAppointment>): Observable<AppointmentBookAppointment> {
    const index = this.appointments.findIndex(a => (a.id === id || a.appointmentId === id));
    if (index >= 0) {
      const updated = { ...this.appointments[index], ...appointment };
      if (appointment.startDateTime || appointment.durationMinutes) {
        updated.endDateTime = this.calculateEndTime(
          updated.startDateTime,
          updated.durationMinutes
        );
      }
      this.appointments[index] = updated;
      this.saveToStorage();
      return of({ ...updated }).pipe(delay(300));
    }
    return this.create({ ...appointment, id, appointmentId: id });
  }

  delete(id: number): Observable<void> {
    const index = this.appointments.findIndex(a => (a.id === id || a.appointmentId === id));
    if (index >= 0) {
      this.appointments.splice(index, 1);
      this.saveToStorage();
    }
    return of(undefined).pipe(delay(200));
  }

  move(id: number, newDate: string, newStartTime: string, newProviderId?: number): Observable<AppointmentBookAppointment> {
    const appointment = this.appointments.find(a => (a.id === id || a.appointmentId === id));
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const newDateTime = `${newDate}T${newStartTime}`;
    const updates: Partial<AppointmentBookAppointment> = {
      startDateTime: newDateTime,
      endDateTime: this.calculateEndTime(newDateTime, appointment.durationMinutes)
    };

    if (newProviderId !== undefined) {
      updates.providerId = newProviderId;
    }

    return this.update(id, updates);
  }

  resize(id: number, newDuration: number): Observable<AppointmentBookAppointment> {
    const appointment = this.appointments.find(a => (a.id === id || a.appointmentId === id));
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Snap to 15-minute intervals
    const snappedDuration = Math.round(newDuration / 15) * 15;
    const updates: Partial<AppointmentBookAppointment> = {
      durationMinutes: snappedDuration,
      endDateTime: this.calculateEndTime(appointment.startDateTime, snappedDuration)
    };

    return this.update(id, updates);
  }

  getTimeBlocks(providerId?: number, roomId?: number): Observable<TimeBlock[]> {
    let filtered = this.timeBlocks;
    if (providerId !== undefined) {
      filtered = filtered.filter(block => block.providerId === providerId);
    }
    if (roomId !== undefined) {
      filtered = filtered.filter(block => block.roomId === roomId);
    }
    return of([...filtered]).pipe(delay(100));
  }

  private calculateEndTime(startDateTime: string, durationMinutes: number): string {
    const start = new Date(startDateTime);
    start.setMinutes(start.getMinutes() + durationMinutes);
    return start.toISOString();
  }


  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.appointments = JSON.parse(stored);
      }
      
      const blocksStored = localStorage.getItem(TIME_BLOCKS_KEY);
      if (blocksStored) {
        this.timeBlocks = JSON.parse(blocksStored);
      }
    } catch (e) {
      console.warn('Failed to load appointments from storage:', e);
      this.appointments = [];
      this.timeBlocks = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.appointments));
    } catch (e) {
      console.error('Failed to save appointments to storage:', e);
    }
  }

  private saveTimeBlocksToStorage(): void {
    try {
      localStorage.setItem(TIME_BLOCKS_KEY, JSON.stringify(this.timeBlocks));
    } catch (e) {
      console.error('Failed to save time blocks to storage:', e);
    }
  }
}

