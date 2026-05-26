import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationPrefs } from '../models/notification-prefs.model';

const STORAGE_KEY = 'notification_prefs_v1';

const DEFAULT_PREFS: NotificationPrefs = {
  enableInApp: true,
  enableEmail: false,
  enableSMS: false,
  doNotDisturb: false,
  dndStart: '22:00',
  dndEnd: '07:00',
  mutedCategories: [],
  severityThreshold: 'INFO'
};

@Injectable({
  providedIn: 'root'
})
export class NotificationPrefsService {
  private prefsSubject = new BehaviorSubject<NotificationPrefs>(this.loadPreferences());
  public prefs$: Observable<NotificationPrefs> = this.prefsSubject.asObservable();

  constructor() {
    // Ensure we have preferences
    if (!this.prefsSubject.value) {
      this.prefsSubject.next(DEFAULT_PREFS);
      this.savePreferences(DEFAULT_PREFS);
    }
  }

  getPreferences(): NotificationPrefs {
    return this.prefsSubject.value;
  }

  updatePreferences(prefs: Partial<NotificationPrefs>): void {
    const current = this.prefsSubject.value;
    const updated: NotificationPrefs = {
      ...current,
      ...prefs
    };
    this.prefsSubject.next(updated);
    this.savePreferences(updated);
  }

  private loadPreferences(): NotificationPrefs {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load notification preferences from localStorage:', e);
    }
    return DEFAULT_PREFS;
  }

  private savePreferences(prefs: NotificationPrefs): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.error('Failed to save notification preferences to localStorage:', e);
    }
  }
}

