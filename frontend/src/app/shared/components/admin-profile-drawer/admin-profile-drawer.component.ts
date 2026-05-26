import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminProfileService } from '../../../core/services/admin-profile.service';
import { AdminProfile, UserRole } from '../../../core/models/admin-profile.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-profile-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-profile-drawer.component.html',
  styleUrls: ['./admin-profile-drawer.component.scss']
})
export class AdminProfileDrawerComponent implements OnInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  private adminProfileService = inject(AdminProfileService);
  private fb = inject(FormBuilder);

  profileForm!: FormGroup;
  originalProfile: AdminProfile | null = null;
  hasUnsavedChanges = false;
  private subscription?: Subscription;

  roles: UserRole[] = ['ADMIN', 'FRONT_DESK', 'PROVIDER', 'NURSE'];
  weekStartOptions = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' }
  ];
  dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  ngOnInit() {
    this.loadProfile();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadProfile() {
    const profile = this.adminProfileService.getProfile();
    this.originalProfile = { ...profile };
    
    this.profileForm = this.fb.group({
      fullName: [profile.fullName, [Validators.required]],
      email: [profile.email, [Validators.required, Validators.email]],
      phone: [profile.phone || ''],
      role: [profile.role, [Validators.required]],
      workingDays: [profile.workingDays || [1, 2, 3, 4, 5]],
      startHour: [profile.startHour || '08:00', [Validators.required]],
      endHour: [profile.endHour || '17:00', [Validators.required]],
      weekStart: [profile.weekStart || 1, [Validators.required]],
      avatarUrl: [profile.avatarUrl || '']
    });

    // Track form changes
    this.profileForm.valueChanges.subscribe(() => {
      this.hasUnsavedChanges = this.isFormChanged();
    });
  }

  isFormChanged(): boolean {
    if (!this.originalProfile) return false;
    const formValue = this.profileForm.value;
    return JSON.stringify(formValue) !== JSON.stringify({
      fullName: this.originalProfile.fullName,
      email: this.originalProfile.email,
      phone: this.originalProfile.phone || '',
      role: this.originalProfile.role,
      workingDays: this.originalProfile.workingDays,
      startHour: this.originalProfile.startHour,
      endHour: this.originalProfile.endHour,
      weekStart: this.originalProfile.weekStart,
      avatarUrl: this.originalProfile.avatarUrl || ''
    });
  }

  toggleWorkingDay(day: number) {
    const currentDays = this.profileForm.get('workingDays')?.value || [];
    const index = currentDays.indexOf(day);
    if (index > -1) {
      currentDays.splice(index, 1);
    } else {
      currentDays.push(day);
      currentDays.sort();
    }
    this.profileForm.patchValue({ workingDays: currentDays });
  }

  isWorkingDay(day: number): boolean {
    const days = this.profileForm.get('workingDays')?.value || [];
    return days.includes(day);
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.adminProfileService.setAvatar(file)
        .then(base64 => {
          this.profileForm.patchValue({ avatarUrl: base64 });
        })
        .catch(err => {
          console.error('Failed to upload avatar:', err);
          alert('Failed to upload avatar. Please try again.');
        });
    }
  }

  save() {
    if (this.profileForm.valid) {
      const formValue = this.profileForm.value;
      this.adminProfileService.updateProfile({
        fullName: formValue.fullName,
        email: formValue.email,
        phone: formValue.phone || undefined,
        role: formValue.role,
        workingDays: formValue.workingDays,
        startHour: formValue.startHour,
        endHour: formValue.endHour,
        weekStart: formValue.weekStart,
        avatarUrl: formValue.avatarUrl || undefined
      });
      this.hasUnsavedChanges = false;
      this.close.emit();
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
    }
  }

  cancel() {
    if (this.hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        this.closeDrawer();
      }
    } else {
      this.closeDrawer();
    }
  }

  closeDrawer() {
    this.profileForm.reset();
    this.loadProfile();
    this.close.emit();
  }

  onBackdropClick() {
    this.cancel();
  }

  onDrawerClick(event: Event) {
    event.stopPropagation();
  }
}

