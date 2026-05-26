export type NotificationSeverity = 'INFO' | 'WARN' | 'CRITICAL';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  createdAt: string; // ISO
  read: boolean;
  category: 'Scheduling' | 'Registration' | 'Orders' | 'Billing' | 'System';
  route?: string;
}

