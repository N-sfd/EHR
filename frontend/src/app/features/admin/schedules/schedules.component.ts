import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AdminService } from '../services/admin.service';
import { ProviderService } from '../../../core/services/provider.service';
import { ProviderMockService } from '../../../core/services/provider-mock.service';
import { ScheduleTemplate, BlockedTime, OverbookRule, DayHours, ClinicHours } from '../models/admin.model';
import { Provider } from '../../../core/models/provider.model';
import { friendlyHttpError } from '../../../core/utils/http-error.util';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.scss']
})
export class SchedulesComponent implements OnInit {
  private adminService = inject(AdminService);
  private providerService = inject(ProviderService);
  private providerMockService = inject(ProviderMockService);
  private fb = inject(FormBuilder);

  providers: Provider[] = [];
  filteredProviders: Provider[] = [];
  /** Current provider’s schedule payload from the admin API (create flow uses a local default when none exists). */
  activeSchedule: ScheduleTemplate | null = null;

  scheduleForm!: FormGroup;
  isLoading = false;
  isLoadingProviders = true;
  isEditing = false;
  errorMessage: string | null = null;
  providerSearchQuery: string = '';
  selectedProviderId: number | null = null;

  daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  slotDurations = [10, 15, 20, 30];

  ngOnInit(): void {
    this.loadProviders();
    this.initializeForm();
  }

  initializeForm(): void {
    this.scheduleForm = this.fb.group({
      providerId: [null, Validators.required],
      location: ['', Validators.required],
      slotDurationMinutes: [30, [Validators.required, Validators.min(15), Validators.max(60)]],
      clinicHours: this.fb.group({
        monday: this.createDayHoursGroup(),
        tuesday: this.createDayHoursGroup(),
        wednesday: this.createDayHoursGroup(),
        thursday: this.createDayHoursGroup(),
        friday: this.createDayHoursGroup(),
        saturday: this.createDayHoursGroup(),
        sunday: this.createDayHoursGroup()
      }),
      blockedTimes: this.fb.array([]),
      overbookRules: this.fb.array([]),
      isActive: [true]
    });
  }

  createDayHoursGroup(): FormGroup {
    return this.fb.group({
      isOpen: [true],
      startTime: ['09:00', Validators.required],
      endTime: ['17:00', Validators.required]
    });
  }

  createBlockedTimeGroup(blockedTime?: BlockedTime): FormGroup {
    return this.fb.group({
      id: [blockedTime?.id || null],
      startDate: [blockedTime?.startDate || '', Validators.required],
      endDate: [blockedTime?.endDate || '', Validators.required],
      startTime: [blockedTime?.startTime || '12:00', Validators.required],
      endTime: [blockedTime?.endTime || '13:00', Validators.required],
      reason: [blockedTime?.reason || '', Validators.required],
      isRecurring: [blockedTime?.isRecurring || false],
      recurrencePattern: [blockedTime?.recurrencePattern || 'DAILY']
    });
  }

  createOverbookRuleGroup(rule?: OverbookRule): FormGroup {
    return this.fb.group({
      id: [rule?.id || null],
      visitTypeId: [rule?.visitTypeId || null, Validators.required],
      maxOverbookCount: [rule?.maxOverbookCount || 1, [Validators.required, Validators.min(1)]],
      allowedDays: [rule?.allowedDays || [], Validators.required],
      isActive: [rule?.isActive !== false]
    });
  }

  get blockedTimesArray(): FormArray {
    return this.scheduleForm.get('blockedTimes') as FormArray;
  }

  get overbookRulesArray(): FormArray {
    return this.scheduleForm.get('overbookRules') as FormArray;
  }

  loadProviders(): void {
    this.isLoadingProviders = true;
    this.errorMessage = null;
    
    this.providerService.getProviders().subscribe({
      next: (providers) => {
        this.providers = providers ?? [];
        this.filteredProviders = [...this.providers];
        this.isLoadingProviders = false;
        this.errorMessage = null;
      },
      error: (err) => {
        console.error('[SchedulesComponent] Error loading providers:', err);
        this.errorMessage = friendlyHttpError(err);
        this.providers = [];
        this.filteredProviders = [];
        this.isLoadingProviders = false;
      }
    });
  }

  seedDemoProviders(): void {
    this.isLoadingProviders = true;
    this.providerMockService.seedDemoProviders().subscribe({
      next: (providers) => {
        this.providers = providers;
        this.filteredProviders = [...this.providers];
        this.isLoadingProviders = false;
        this.errorMessage = null;
      },
      error: () => {
        this.isLoadingProviders = false;
        this.errorMessage = 'Failed to seed demo providers';
      }
    });
  }

  onProviderSearch(): void {
    const query = this.providerSearchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredProviders = [...this.providers];
      return;
    }
    this.filteredProviders = this.providers.filter(p =>
      (p.name ?? '').toLowerCase().includes(query) ||
      (p.specialty ?? '').toLowerCase().includes(query) ||
      (p.department ?? '').toLowerCase().includes(query)
    );
  }

  getProviderAvatar(provider: Provider): string {
    // Always return a valid URL - prefer provider image, fallback to generated avatar
    if (provider.imageUrl && provider.imageUrl.trim() !== '') {
      return provider.imageUrl;
    }
    if (provider.photoUrl && provider.photoUrl.trim() !== '') {
      return provider.photoUrl;
    }
    // Generate avatar from initials as fallback
    const initials = this.getProviderInitials(provider);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=004f4f&color=fff&size=100&bold=true`;
  }

  private getProviderInitials(provider: Provider): string {
    if (!provider.name || provider.name.trim() === '') {
      return 'DR';
    }
    const parts = provider.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return provider.name.substring(0, 2).toUpperCase();
  }

  onImageError(event: Event, provider: Provider): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      // Fallback to initials-based avatar
      const initials = this.getProviderInitials(provider);
      img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=004f4f&color=fff&size=100&bold=true`;
      // Prevent infinite loop if fallback also fails
      img.onerror = null;
    }
  }

  loadScheduleForProvider(providerId: number): void {
    this.selectedProviderId = providerId;
    const provider = this.providers.find(p => p.id === providerId);
    
    if (!provider) {
      console.error('[SchedulesComponent] Provider not found:', providerId);
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = null;
    this.activeSchedule = null;
    
    this.adminService.getScheduleTemplate(providerId).subscribe({
      next: (schedule) => {
        this.activeSchedule = schedule;
        this.applyScheduleToForm(schedule);
        this.isEditing = true;
        this.isLoading = false;
        this.errorMessage = null;
      },
      error: (err) => {
        console.error('[SchedulesComponent] Error loading schedule:', err);
        // If 404, start a new schedule with defaults; otherwise show error
        if (err instanceof HttpErrorResponse && err.status === 404) {
          const defaultSchedule: ScheduleTemplate = {
            providerId,
            providerName: provider.name || `Provider ${providerId}`,
            location: 'Main Clinic',
            slotDurationMinutes: 15,
            clinicHours: {
              monday: { isOpen: true, startTime: '09:00', endTime: '17:00' },
              tuesday: { isOpen: true, startTime: '09:00', endTime: '17:00' },
              wednesday: { isOpen: true, startTime: '09:00', endTime: '17:00' },
              thursday: { isOpen: true, startTime: '09:00', endTime: '17:00' },
              friday: { isOpen: true, startTime: '09:00', endTime: '17:00' },
              saturday: { isOpen: false, startTime: '09:00', endTime: '17:00' },
              sunday: { isOpen: false, startTime: '09:00', endTime: '17:00' }
            },
            weeklySchedule: {},
            blockedTimes: [],
            overbookRules: [],
            isActive: true
          };
          this.activeSchedule = defaultSchedule;
          this.applyScheduleToForm(defaultSchedule);
          this.isEditing = true;
          this.errorMessage = null;
        } else {
          this.errorMessage = friendlyHttpError(err);
          this.activeSchedule = null;
          this.isEditing = false;
        }
        this.isLoading = false;
      }
    });
  }

  applyScheduleToForm(template: ScheduleTemplate): void {
    this.scheduleForm.patchValue({
      providerId: template.providerId,
      location: template.location,
      slotDurationMinutes: template.slotDurationMinutes,
      isActive: template.isActive
    });

    // Load clinic hours
    const clinicHoursGroup = this.scheduleForm.get('clinicHours') as FormGroup;
    Object.keys(template.clinicHours).forEach(day => {
      const dayGroup = clinicHoursGroup.get(day) as FormGroup;
      if (dayGroup) {
        dayGroup.patchValue(template.clinicHours[day as keyof typeof template.clinicHours]);
      }
    });

    // Load blocked times
    this.blockedTimesArray.clear();
    template.blockedTimes.forEach(bt => {
      this.blockedTimesArray.push(this.createBlockedTimeGroup(bt));
    });

    // Load overbook rules
    this.overbookRulesArray.clear();
    template.overbookRules.forEach(rule => {
      this.overbookRulesArray.push(this.createOverbookRuleGroup(rule));
    });
  }

  addBlockedTime(): void {
    this.blockedTimesArray.push(this.createBlockedTimeGroup());
  }

  removeBlockedTime(index: number): void {
    this.blockedTimesArray.removeAt(index);
  }

  addOverbookRule(): void {
    this.overbookRulesArray.push(this.createOverbookRuleGroup());
  }

  removeOverbookRule(index: number): void {
    this.overbookRulesArray.removeAt(index);
  }

  saveSchedule(): void {
    // Mark all fields as touched to show validation errors
    this.scheduleForm.markAllAsTouched();
    
    if (this.scheduleForm.invalid) {
      const errors: string[] = [];
      if (this.scheduleForm.get('providerId')?.invalid) {
        errors.push('Provider is required');
      }
      if (this.scheduleForm.get('location')?.invalid) {
        errors.push('Location is required');
      }
      if (this.scheduleForm.get('slotDurationMinutes')?.invalid) {
        errors.push('Slot duration is required');
      }
      this.errorMessage = errors.length > 0 ? errors.join(', ') : 'Please fill in all required fields';
      return;
    }

    const formValue = this.scheduleForm.value;
    const provider = this.providers.find(p => p.id === formValue.providerId);
    
    // Ensure clinicHours has all required days with proper structure
    const clinicHours: ClinicHours = {
      monday: formValue.clinicHours?.monday || { isOpen: false, startTime: '09:00', endTime: '17:00' },
      tuesday: formValue.clinicHours?.tuesday || { isOpen: false, startTime: '09:00', endTime: '17:00' },
      wednesday: formValue.clinicHours?.wednesday || { isOpen: false, startTime: '09:00', endTime: '17:00' },
      thursday: formValue.clinicHours?.thursday || { isOpen: false, startTime: '09:00', endTime: '17:00' },
      friday: formValue.clinicHours?.friday || { isOpen: false, startTime: '09:00', endTime: '17:00' },
      saturday: formValue.clinicHours?.saturday || { isOpen: false, startTime: '09:00', endTime: '17:00' },
      sunday: formValue.clinicHours?.sunday || { isOpen: false, startTime: '09:00', endTime: '17:00' }
    };
    
    const template: ScheduleTemplate = {
      id: this.activeSchedule?.id,
      providerId: formValue.providerId,
      providerName: provider?.name || 'Provider',
      location: formValue.location,
      slotDurationMinutes: formValue.slotDurationMinutes,
      clinicHours: clinicHours,
      weeklySchedule: {},
      blockedTimes: formValue.blockedTimes || [],
      overbookRules: formValue.overbookRules || [],
      isActive: formValue.isActive !== false
    };

    this.isLoading = true;
    this.errorMessage = null;
    
    this.adminService.saveScheduleTemplate(template).subscribe({
      next: (saved) => {
        this.activeSchedule = saved;
        this.errorMessage = null;
        this.isLoading = false;
        console.log('Schedule saved successfully');
      },
      error: (err) => {
        console.error('Error saving schedule:', err);
        this.errorMessage = err?.error?.message || err?.message || 'Failed to save schedule. Please try again.';
        this.isLoading = false;
      }
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.activeSchedule = null;
    this.selectedProviderId = null;
    this.scheduleForm.reset();
    this.blockedTimesArray.clear();
    this.overbookRulesArray.clear();
    this.initializeForm();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.scheduleForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onDayToggle(dayKey: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const dayGroup = this.scheduleForm.get('clinicHours')?.get(dayKey) as FormGroup;
    if (dayGroup) {
      dayGroup.patchValue({ isOpen: checkbox.checked });
    }
  }

  onTimeChange(dayKey: string, timeField: 'startTime' | 'endTime', event: Event): void {
    const input = event.target as HTMLInputElement;
    const dayGroup = this.scheduleForm.get('clinicHours')?.get(dayKey) as FormGroup;
    if (dayGroup) {
      dayGroup.patchValue({ [timeField]: input.value });
      dayGroup.markAsDirty();
    }
  }
}

