import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { WaitlistEntry } from '../../features/appointment/models/appointment-scheduling.models';

const STORAGE_KEY = 'waitlist_v1';

@Injectable({
  providedIn: 'root'
})
export class WaitlistService {
  private waitlist: WaitlistEntry[] = [];

  constructor() {
    this.loadFromStorage();
    if (this.waitlist.length === 0) {
      this.seedDemoData();
    }
  }

  getAll(): Observable<WaitlistEntry[]> {
    return of([...this.waitlist]).pipe(delay(100));
  }

  add(entry: Partial<WaitlistEntry>): Observable<WaitlistEntry> {
    const newEntry: WaitlistEntry = {
      id: Date.now().toString(),
      patientId: entry.patientId || 0,
      patientName: entry.patientName || 'Unknown Patient',
      patientMrn: entry.patientMrn,
      reason: entry.reason || '',
      preferredDate: entry.preferredDate,
      preferredTime: entry.preferredTime,
      preferredProviderId: entry.preferredProviderId,
      priority: entry.priority || 'NORMAL',
      createdAt: new Date().toISOString()
    };

    this.waitlist.push(newEntry);
    this.saveToStorage();
    return of({ ...newEntry }).pipe(delay(200));
  }

  remove(id: string): Observable<void> {
    const index = this.waitlist.findIndex(e => e.id === id);
    if (index >= 0) {
      this.waitlist.splice(index, 1);
      this.saveToStorage();
    }
    return of(undefined).pipe(delay(100));
  }

  update(id: string, updates: Partial<WaitlistEntry>): Observable<WaitlistEntry> {
    const index = this.waitlist.findIndex(e => e.id === id);
    if (index >= 0) {
      this.waitlist[index] = { ...this.waitlist[index], ...updates };
      this.saveToStorage();
      return of({ ...this.waitlist[index] }).pipe(delay(200));
    }
    throw new Error('Waitlist entry not found');
  }

  private seedDemoData(): void {
    const patients = [
      { id: 11, name: 'Christopher Anderson', mrn: 'MRN011' },
      { id: 12, name: 'Sarah Thomas', mrn: 'MRN012' },
      { id: 13, name: 'Daniel Jackson', mrn: 'MRN013' },
      { id: 14, name: 'Jessica White', mrn: 'MRN014' },
      { id: 15, name: 'Matthew Harris', mrn: 'MRN015' }
    ];

    const reasons = [
      'Urgent follow-up needed',
      'Prefer morning appointment',
      'Flexible schedule',
      'Need specific provider',
      'Routine checkup'
    ];

    this.waitlist = patients.map((patient, idx) => ({
      id: `waitlist_${idx + 1}`,
      patientId: patient.id,
      patientName: patient.name,
      patientMrn: patient.mrn,
      reason: reasons[idx % reasons.length],
      priority: idx === 0 ? 'URGENT' : idx === 1 ? 'HIGH' : 'NORMAL',
      createdAt: new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString()
    }));

    this.saveToStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.waitlist = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load waitlist from storage:', e);
      this.waitlist = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.waitlist));
    } catch (e) {
      console.error('Failed to save waitlist to storage:', e);
    }
  }
}

