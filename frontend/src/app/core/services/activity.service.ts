import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { PatientActivity } from '../models/patient-snapshot.model';

const STORAGE_KEY = 'patient_activities_v1';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private activities: PatientActivity[] = [];

  constructor() {
    this.loadFromStorage();
    if (this.activities.length === 0) {
      this.seedDemoActivities();
    }
  }

  listActivities(patientId: number): Observable<PatientActivity[]> {
    const patientActivities = this.activities
      .filter(a => a.patientId === patientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return of([...patientActivities]).pipe(delay(200));
  }

  addActivity(patientId: number, type: PatientActivity['type'], comment: string): Observable<PatientActivity> {
    const newActivity: PatientActivity = {
      id: Date.now().toString(),
      patientId,
      timestamp: new Date().toISOString(),
      type,
      comment,
      createdBy: 'Current User' // Could get from auth service
    };

    this.activities.push(newActivity);
    this.saveToStorage();
    return of({ ...newActivity }).pipe(delay(200));
  }

  private seedDemoActivities(): void {
    this.activities = [
      {
        id: '1',
        patientId: 1,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        type: 'NOTE',
        comment: 'Patient called to confirm appointment time',
        createdBy: 'Front Desk'
      },
      {
        id: '2',
        patientId: 1,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        type: 'CALL',
        comment: 'Left voicemail regarding insurance verification',
        createdBy: 'Billing'
      },
      {
        id: '3',
        patientId: 1,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        type: 'TASK',
        comment: 'Update address information',
        createdBy: 'Admin'
      },
      {
        id: '4',
        patientId: 2,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        type: 'EMAIL',
        comment: 'Sent appointment reminder',
        createdBy: 'System'
      },
      {
        id: '5',
        patientId: 2,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        type: 'NOTE',
        comment: 'Patient requested prescription refill',
        createdBy: 'Provider'
      }
    ];

    this.saveToStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.activities = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load activities from localStorage:', e);
      this.activities = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.activities));
    } catch (e) {
      console.error('Failed to save activities to localStorage:', e);
    }
  }
}

