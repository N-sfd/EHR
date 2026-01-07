import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AdminService } from '../services/admin.service';
import { ProviderService } from '../../../core/services/provider.service';
import { ProviderMockService } from '../../../core/services/provider-mock.service';
import { ScheduleTemplate, BlockedTime, OverbookRule, DayHours } from '../models/admin.model';
import { Provider } from '../../../core/models/provider.model';

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

  templates: ScheduleTemplate[] = [];
  selectedTemplate: ScheduleTemplate | null = null;
  providers: Provider[] = [];
  filteredProviders: Provider[] = [];
  
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
    this.loadTemplates();
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
      },
      error: (err) => {
        console.error('Error loading providers:', err);
        this.errorMessage = 'Failed to load providers';
        // Fallback to mock
        this.providerMockService.getProviders().subscribe({
          next: (mockProviders) => {
            this.providers = mockProviders ?? [];
            this.filteredProviders = [...this.providers];
            this.isLoadingProviders = false;
          },
          error: () => {
            this.providers = [];
            this.filteredProviders = [];
            this.isLoadingProviders = false;
          }
        });
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
      p.name.toLowerCase().includes(query) ||
      p.specialty.toLowerCase().includes(query) ||
      p.department.toLowerCase().includes(query)
    );
  }

  getProviderAvatar(provider: Provider): string {
    if (provider.imageUrl || provider.photoUrl) {
      return provider.imageUrl || provider.photoUrl || '';
    }
    // Generate avatar from initials
    const initials = provider.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=004f4f&color=fff&size=100&bold=true`;
  }

  onImageError(event: Event, provider: Provider): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      // Fallback to initials-based avatar
      const initials = provider.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=004f4f&color=fff&size=100&bold=true`;
    }
  }

  loadTemplates(): void {
    this.isLoading = true;
    this.adminService.getScheduleTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading schedule templates:', err);
        this.errorMessage = 'Failed to load schedule templates';
        this.isLoading = false;
      }
    });
  }

  selectTemplate(providerId: number): void {
    this.selectedProviderId = providerId;
    const provider = this.providers.find(p => p.id === providerId);
    
    this.isLoading = true;
    this.errorMessage = null;
    
    this.adminService.getScheduleTemplate(providerId).subscribe({
      next: (template) => {
        this.selectedTemplate = template;
        this.loadTemplateIntoForm(template);
        this.isEditing = true;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading template:', err);
        // Create new template with default values
        this.selectedTemplate = null;
        const defaultTemplate: ScheduleTemplate = {
          providerId,
          providerName: provider?.name || `Provider ${providerId}`,
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
          blockedTimes: [
            {
              startDate: new Date().toISOString().split('T')[0],
              endDate: new Date().toISOString().split('T')[0],
              startTime: '12:00',
              endTime: '13:00',
              reason: 'Lunch Break',
              isRecurring: true,
              recurrencePattern: 'DAILY'
            },
            {
              startDate: new Date().toISOString().split('T')[0],
              endDate: new Date().toISOString().split('T')[0],
              startTime: '15:00',
              endTime: '16:00',
              reason: 'Admin Time',
              isRecurring: true,
              recurrencePattern: 'DAILY'
            }
          ],
          overbookRules: [],
          isActive: true
        };
        this.loadTemplateIntoForm(defaultTemplate);
        this.isEditing = true;
        this.isLoading = false;
      }
    });
  }

  loadTemplateIntoForm(template: ScheduleTemplate): void {
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
    if (this.scheduleForm.invalid) {
      return;
    }

    const formValue = this.scheduleForm.value;
    const provider = this.providers.find(p => p.id === formValue.providerId);
    const template: ScheduleTemplate = {
      id: this.selectedTemplate?.id,
      providerId: formValue.providerId,
      providerName: provider?.name || 'Provider',
      location: formValue.location,
      slotDurationMinutes: formValue.slotDurationMinutes,
      clinicHours: formValue.clinicHours,
      weeklySchedule: {},
      blockedTimes: formValue.blockedTimes,
      overbookRules: formValue.overbookRules,
      isActive: formValue.isActive
    };

    this.isLoading = true;
    this.adminService.saveScheduleTemplate(template).subscribe({
      next: (saved) => {
        this.selectedTemplate = saved;
        this.loadTemplates();
        this.errorMessage = null;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error saving schedule template:', err);
        this.errorMessage = 'Failed to save schedule template';
        this.isLoading = false;
      }
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.selectedTemplate = null;
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
    }
  }
}

