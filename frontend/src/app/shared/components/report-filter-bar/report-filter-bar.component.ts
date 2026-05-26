import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DoctorService } from '../../../core/services/doctor.service';
import { Doctor } from '../../../core/models/doctor.model';

export interface ReportFilters {
  datePreset?: 'today' | 'thisWeek' | 'next2Weeks' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
  providerIds?: number[];
  statuses?: string[];
  appointmentTypes?: string[];
  includeCancelled?: boolean;
  businessHoursOnly?: boolean;
}

@Component({
  selector: 'app-report-filter-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './report-filter-bar.component.html',
  styleUrls: ['./report-filter-bar.component.scss']
})
export class ReportFilterBarComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private doctorService = inject(DoctorService);
  private fb = inject(FormBuilder);

  @Input() showAppointmentType = true;
  @Input() showIncludeCancelled = true;
  @Input() showBusinessHoursOnly = true;
  @Output() filtersChange = new EventEmitter<ReportFilters>();
  @Output() applyFilters = new EventEmitter<ReportFilters>();
  @Output() resetFilters = new EventEmitter<void>();

  // Reactive form
  filterForm!: FormGroup;

  // Options
  providers: Doctor[] = [];
  statusOptions = [
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'ARRIVED', label: 'Arrived' },
    { value: 'CHECKED_IN', label: 'Checked In' },
    { value: 'CHECKED_OUT', label: 'Checked Out' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'NO_SHOW', label: 'No Show' }
  ];
  appointmentTypeOptions = [
    { value: 'IN_PERSON', label: 'In Person' },
    { value: 'TELEHEALTH', label: 'Telehealth' }
  ];

  ngOnInit() {
    this.initializeForm();
    this.loadProviders();
    this.loadFiltersFromQueryParams();
  }

  /**
   * Initialize the reactive form with default values
   */
  initializeForm() {
    const defaultDates = this.getDatePresetDates('month');
    this.filterForm = this.fb.group({
      datePreset: ['month'],
      startDate: [defaultDates.startDate],
      endDate: [defaultDates.endDate],
      providerIds: this.fb.array([]),
      statuses: this.fb.array([]),
      appointmentTypes: this.fb.array([]),
      includeCancelled: [false],
      businessHoursOnly: [false]
    });

    // Watch for date preset changes
    this.filterForm.get('datePreset')?.valueChanges.subscribe(preset => {
      if (preset !== 'custom') {
        const dates = this.getDatePresetDates(preset);
        this.filterForm.patchValue({
          startDate: dates.startDate,
          endDate: dates.endDate
        }, { emitEvent: false });
      }
    });
  }

  /**
   * Helper method to parse query params and initialize form
   * This is the main method for syncing URL query params to form state
   */
  loadFiltersFromQueryParams() {
    this.route.queryParams.subscribe(params => {
      const formValues: any = {};

      // Date preset
      if (params['datePreset']) {
        formValues.datePreset = params['datePreset'];
        if (params['datePreset'] !== 'custom') {
          const dates = this.getDatePresetDates(params['datePreset']);
          formValues.startDate = dates.startDate;
          formValues.endDate = dates.endDate;
        }
      } else {
        // Default to month if no preset
        const dates = this.getDatePresetDates('month');
        formValues.datePreset = 'month';
        formValues.startDate = dates.startDate;
        formValues.endDate = dates.endDate;
      }

      // Custom dates (only if preset is custom)
      if (params['datePreset'] === 'custom' || params['startDate'] || params['endDate']) {
        if (params['startDate']) formValues.startDate = params['startDate'];
        if (params['endDate']) formValues.endDate = params['endDate'];
      }

      // Provider IDs
      if (params['providerIds']) {
        const providerIds = Array.isArray(params['providerIds']) 
          ? params['providerIds'].map((id: string) => Number(id))
          : [Number(params['providerIds'])];
        const providerArray = this.fb.array(providerIds.map(id => this.fb.control(id)));
        this.filterForm.setControl('providerIds', providerArray);
      }

      // Statuses
      if (params['statuses']) {
        const statuses = Array.isArray(params['statuses']) 
          ? params['statuses']
          : [params['statuses']];
        const statusArray = this.fb.array(statuses.map(status => this.fb.control(status)));
        this.filterForm.setControl('statuses', statusArray);
      }

      // Appointment Types
      if (params['appointmentTypes']) {
        const types = Array.isArray(params['appointmentTypes'])
          ? params['appointmentTypes']
          : [params['appointmentTypes']];
        const typeArray = this.fb.array(types.map(type => this.fb.control(type)));
        this.filterForm.setControl('appointmentTypes', typeArray);
      }

      // Toggles
      if (params['includeCancelled'] !== undefined) {
        formValues.includeCancelled = params['includeCancelled'] === 'true' || params['includeCancelled'] === true;
      }
      if (params['businessHoursOnly'] !== undefined) {
        formValues.businessHoursOnly = params['businessHoursOnly'] === 'true' || params['businessHoursOnly'] === true;
      }

      // Patch form values (excluding FormArrays which are set above)
      this.filterForm.patchValue(formValues, { emitEvent: false });
    });
  }

  loadProviders() {
    this.doctorService.getAll().subscribe({
      next: (docs) => {
        this.providers = docs || [];
      },
      error: (err) => {
        console.error('Error loading providers:', err);
        this.providers = [];
      }
    });
  }

  /**
   * Get date range for a preset
   */
  getDatePresetDates(preset: string): { startDate: string; endDate: string } {
    const today = new Date();
    const start = new Date(today);
    let end = new Date(today);
    
    switch (preset) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'thisWeek':
        const dayOfWeek = today.getDay();
        start.setDate(today.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'next2Weeks':
        start.setDate(today.getDate() + 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 13);
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
      default:
        start.setMonth(today.getMonth() - 1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
    }
    
    return {
      startDate: this.formatDateForInput(start),
      endDate: this.formatDateForInput(end)
    };
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // FormArray getters
  get providerIdsArray(): FormArray {
    return this.filterForm.get('providerIds') as FormArray;
  }

  get statusesArray(): FormArray {
    return this.filterForm.get('statuses') as FormArray;
  }

  get appointmentTypesArray(): FormArray {
    return this.filterForm.get('appointmentTypes') as FormArray;
  }

  // Helper methods to check if item is selected
  isProviderSelected(providerId: number): boolean {
    return this.providerIdsArray.value.includes(providerId);
  }

  isStatusSelected(status: string): boolean {
    return this.statusesArray.value.includes(status);
  }

  isAppointmentTypeSelected(type: string): boolean {
    return this.appointmentTypesArray.value.includes(type);
  }

  // Toggle methods
  onProviderToggle(providerId: number) {
    const array = this.providerIdsArray;
    const index = array.value.indexOf(providerId);
    if (index > -1) {
      array.removeAt(index);
    } else {
      array.push(this.fb.control(providerId));
    }
  }

  onStatusToggle(status: string) {
    const array = this.statusesArray;
    const index = array.value.indexOf(status);
    if (index > -1) {
      array.removeAt(index);
    } else {
      array.push(this.fb.control(status));
    }
  }

  onAppointmentTypeToggle(type: string) {
    const array = this.appointmentTypesArray;
    const index = array.value.indexOf(type);
    if (index > -1) {
      array.removeAt(index);
    } else {
      array.push(this.fb.control(type));
    }
  }

  /**
   * Get current filter values as ReportFilters interface
   */
  getFilters(): ReportFilters {
    const formValue = this.filterForm.value;
    return {
      datePreset: formValue.datePreset,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      providerIds: formValue.providerIds.length > 0 ? formValue.providerIds : undefined,
      statuses: formValue.statuses.length > 0 ? formValue.statuses : undefined,
      appointmentTypes: formValue.appointmentTypes.length > 0 ? formValue.appointmentTypes : undefined,
      includeCancelled: formValue.includeCancelled || false,
      businessHoursOnly: formValue.businessHoursOnly || false
    };
  }

  onApply() {
    console.log('[ReportFilterBar] Apply button clicked');
    console.log('[ReportFilterBar] Form valid:', this.filterForm.valid);
    console.log('[ReportFilterBar] Form errors:', this.filterForm.errors);
    console.log('[ReportFilterBar] Form value:', this.filterForm.value);
    
    // Allow apply even if form has minor validation issues (e.g., empty arrays are OK)
    const filters = this.getFilters();
    console.log('[ReportFilterBar] Emitting filters:', filters);
    this.updateQueryParams(filters);
    this.applyFilters.emit(filters);
    this.filtersChange.emit(filters);
  }

  onReset() {
    console.log('[ReportFilterBar] Reset button clicked');
    const defaultDates = this.getDatePresetDates('month');
    this.filterForm.reset({
      datePreset: 'month',
      startDate: defaultDates.startDate,
      endDate: defaultDates.endDate,
      includeCancelled: false,
      businessHoursOnly: false
    });
    
    // Clear FormArrays
    this.providerIdsArray.clear();
    this.statusesArray.clear();
    this.appointmentTypesArray.clear();
    
    // Clear query params by setting them to null
    this.clearQueryParams();
    console.log('[ReportFilterBar] Emitting resetFilters');
    this.resetFilters.emit();
  }

  /**
   * Update URL query params with current filter values
   * Uses queryParamsHandling: 'merge' to preserve other query params
   */
  updateQueryParams(filters: ReportFilters) {
    const queryParams: any = {};
    
    if (filters.datePreset) queryParams.datePreset = filters.datePreset;
    if (filters.startDate) queryParams.startDate = filters.startDate;
    if (filters.endDate) queryParams.endDate = filters.endDate;
    if (filters.providerIds && filters.providerIds.length > 0) {
      queryParams.providerIds = filters.providerIds;
    } else {
      queryParams.providerIds = null; // Remove if empty
    }
    if (filters.statuses && filters.statuses.length > 0) {
      queryParams.statuses = filters.statuses;
    } else {
      queryParams.statuses = null; // Remove if empty
    }
    if (filters.appointmentTypes && filters.appointmentTypes.length > 0) {
      queryParams.appointmentTypes = filters.appointmentTypes;
    } else {
      queryParams.appointmentTypes = null; // Remove if empty
    }
    if (filters.includeCancelled) {
      queryParams.includeCancelled = filters.includeCancelled;
    } else {
      queryParams.includeCancelled = null; // Remove if false
    }
    if (filters.businessHoursOnly) {
      queryParams.businessHoursOnly = filters.businessHoursOnly;
    } else {
      queryParams.businessHoursOnly = null; // Remove if false
    }
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  /**
   * Clear all filter-related query params
   */
  private clearQueryParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        datePreset: null,
        startDate: null,
        endDate: null,
        providerIds: null,
        statuses: null,
        appointmentTypes: null,
        includeCancelled: null,
        businessHoursOnly: null
      },
      queryParamsHandling: 'merge'
    });
  }

  getProviderName(doctor: Doctor): string {
    return `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || `Provider ${doctor.id}`;
  }
}

