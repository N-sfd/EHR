export type NotificationSeverity = 'INFO' | 'WARN' | 'CRITICAL';

export interface NotificationPrefs {
  enableInApp: boolean;
  enableEmail: boolean;
  enableSMS: boolean;
  doNotDisturb: boolean;
  dndStart?: string; // "22:00"
  dndEnd?: string;   // "07:00"
  mutedCategories: string[];
  severityThreshold: 'INFO' | 'WARN' | 'CRITICAL';
}

