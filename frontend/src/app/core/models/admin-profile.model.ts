export type UserRole = 'ADMIN' | 'FRONT_DESK' | 'PROVIDER' | 'NURSE';

export interface AdminProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string; // base64 or url
  workingDays: number[]; // 0=Sun..6=Sat
  startHour: string; // "08:00"
  endHour: string;   // "17:00"
  weekStart: 0 | 1; // 0=Sun, 1=Mon
}

