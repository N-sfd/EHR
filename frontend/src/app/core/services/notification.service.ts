import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppNotification } from '../models/notification.model';

const STORAGE_KEY = 'notifications_v1';

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    title: 'New Appointment Scheduled',
    message: 'Patient John Doe has scheduled an appointment for tomorrow at 10:00 AM',
    severity: 'INFO',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    read: false,
    route: '/admin/appointments/all',
    category: 'Scheduling'
  },
  {
    id: '2',
    title: 'Registration Incomplete',
    message: 'Patient Jane Smith has incomplete registration information',
    severity: 'WARN',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: false,
    route: '/admin/patients',
    category: 'Registration'
  },
  {
    id: '3',
    title: 'Lab Results Available',
    message: 'Lab results for Patient ID 12345 are now available for review',
    severity: 'INFO',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: true,
    category: 'Orders'
  },
  {
    id: '4',
    title: 'System Maintenance Scheduled',
    message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM',
    severity: 'WARN',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    category: 'System'
  },
  {
    id: '5',
    title: 'Critical: Patient Alert',
    message: 'Patient has critical allergy alert - review before appointment',
    severity: 'CRITICAL',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    read: false,
    route: '/admin/patients',
    category: 'Registration'
  },
  {
    id: '6',
    title: 'Billing Issue Detected',
    message: 'Insurance claim rejected for Patient ID 67890',
    severity: 'WARN',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read: false,
    category: 'Billing'
  },
  {
    id: '7',
    title: 'New Order Placed',
    message: 'Dr. Smith has placed a new lab order for Patient ID 11111',
    severity: 'INFO',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    read: true,
    category: 'Orders'
  },
  {
    id: '8',
    title: 'Appointment Reminder',
    message: 'Reminder: 3 appointments scheduled for tomorrow',
    severity: 'INFO',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: false,
    route: '/admin/appointments/all',
    category: 'Scheduling'
  }
];

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<AppNotification[]>(this.loadNotifications());
  public notifications$: Observable<AppNotification[]> = this.notificationsSubject.asObservable();
  public unreadCount$: Observable<number> = this.notifications$.pipe(
    map(notifications => notifications.filter(n => !n.read).length)
  );

  constructor() {
    // Seed notifications if none exist
    if (this.notificationsSubject.value.length === 0) {
      this.notificationsSubject.next([...SEED_NOTIFICATIONS]);
      this.saveNotifications([...SEED_NOTIFICATIONS]);
    }
  }

  getNotifications(): AppNotification[] {
    return this.notificationsSubject.value;
  }

  getUnreadCount(): number {
    return this.notificationsSubject.value.filter(n => !n.read).length;
  }

  push(notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): void {
    const newNotification: AppNotification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false
    };
    const current = this.notificationsSubject.value;
    const updated = [newNotification, ...current];
    this.notificationsSubject.next(updated);
    this.saveNotifications(updated);
  }

  markRead(id: string): void {
    const current = this.notificationsSubject.value;
    const updated = current.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(updated);
    this.saveNotifications(updated);
  }

  markUnread(id: string): void {
    const current = this.notificationsSubject.value;
    const updated = current.map(n => 
      n.id === id ? { ...n, read: false } : n
    );
    this.notificationsSubject.next(updated);
    this.saveNotifications(updated);
  }

  markAllRead(): void {
    const current = this.notificationsSubject.value;
    const updated = current.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(updated);
    this.saveNotifications(updated);
  }

  clear(id: string): void {
    const current = this.notificationsSubject.value;
    const updated = current.filter(n => n.id !== id);
    this.notificationsSubject.next(updated);
    this.saveNotifications(updated);
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
    this.saveNotifications([]);
  }

  private loadNotifications(): AppNotification[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load notifications from localStorage:', e);
    }
    return [];
  }

  private saveNotifications(notifications: AppNotification[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save notifications to localStorage:', e);
    }
  }
}
