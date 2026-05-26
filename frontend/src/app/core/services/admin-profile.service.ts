import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AdminProfile } from '../models/admin-profile.model';

const STORAGE_KEY = 'admin_profile_v1';

const DEFAULT_PROFILE: AdminProfile = {
  id: '1',
  fullName: 'Admin User',
  email: 'admin@demo.com',
  role: 'ADMIN',
  phone: '',
  workingDays: [1, 2, 3, 4, 5], // Mon-Fri
  startHour: '08:00',
  endHour: '17:00',
  weekStart: 1, // Monday
  avatarUrl: undefined
};

@Injectable({
  providedIn: 'root'
})
export class AdminProfileService {
  private profileSubject = new BehaviorSubject<AdminProfile>(this.loadProfile());
  public profile$: Observable<AdminProfile> = this.profileSubject.asObservable();

  constructor() {
    // Ensure we have a profile
    if (!this.profileSubject.value) {
      this.profileSubject.next(DEFAULT_PROFILE);
      this.saveProfile(DEFAULT_PROFILE);
    }
  }

  getProfile(): AdminProfile {
    return this.profileSubject.value;
  }

  updateProfile(partial: Partial<AdminProfile>): void {
    const current = this.profileSubject.value;
    const updated: AdminProfile = {
      ...current,
      ...partial
    };
    this.profileSubject.next(updated);
    this.saveProfile(updated);
  }

  setAvatar(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('File must be an image'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        this.updateProfile({ avatarUrl: base64 });
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  resetToDefault(): void {
    this.profileSubject.next({ ...DEFAULT_PROFILE });
    this.saveProfile({ ...DEFAULT_PROFILE });
  }

  private loadProfile(): AdminProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load admin profile from localStorage:', e);
    }
    return DEFAULT_PROFILE;
  }

  private saveProfile(profile: AdminProfile): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save admin profile to localStorage:', e);
    }
  }
}

