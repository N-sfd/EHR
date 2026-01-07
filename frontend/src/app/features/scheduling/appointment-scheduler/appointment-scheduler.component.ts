import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SchedulingService } from '../services/scheduling.service';
import { PatientHeader, ProviderSchedule, ScheduleSlot, InsuranceSnapshot, AppointmentFormData } from '../models/scheduling.model';
import { Patient } from '../../../core/models/patient.model';
import { Doctor } from '../../../core/models/doctor.model';
import { Department } from '../../../core/models/department.model';

@Component({
  selector: 'app-appointment-scheduler',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './appointment-scheduler.component.html',
  styleUrls: ['./appointment-scheduler.component.scss']
})
export class AppointmentSchedulerComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private schedulingService = inject(SchedulingService);

  // Zone 1: Patient Header
  patientHeader: PatientHeader | null = null;
  selectedPatientId: number | null = null;
  patientSearchQuery = '';
  patientSearchResults: Patient[] = [];
  showPatientSearch = false;

  // Zone 2: Provider Schedule Grid
  selectedDate: Date = new Date();
  selectedProviders: number[] = [];
  providers: Doctor[] = [];
  providerSchedules: ProviderSchedule[] = [];
  isLoadingSchedules = false;

  // Zone 3: Appointment Details Panel
  appointmentForm!: FormGroup;
  departments: Department[] = [];
  insuranceSnapshot: InsuranceSnapshot | null = null;
  isEligibilityExpired = false;
  isSaving = false;

  // Inline Alerts
  alertBanner: { type: 'warning' | 'error' | 'info'; message: string } | null = null;

  // Visit Types
  visitTypes = ['New Patient', 'Follow-up', 'Consultation', 'Procedure', 'Annual Physical', 'Urgent Care'];
  durations = [15, 30, 45, 60];
  statuses = ['Schedule', 'Confirmed', 'Arrived', 'Checked In'];

  ngOnInit(): void {
    this.initializeForm();
    this.loadProviders();
    this.loadDepartments();

    // Check for query params
    this.route.queryParams.subscribe(params => {
      if (params['patientId']) {
        this.selectedPatientId = +params['patientId'];
        this.loadPatientHeader(this.selectedPatientId);
      }
      if (params['providerId']) {
        this.selectedProviders = [+params['providerId']];
        this.loadSchedules();
      }
      if (params['date']) {
        this.selectedDate = new Date(params['date']);
        this.appointmentForm.patchValue({ appointmentDate: params['date'] });
      }
      if (params['time']) {
        this.appointmentForm.patchValue({ appointmentTime: params['time'] });
      }
    });
  }

  initializeForm(): void {
    this.appointmentForm = this.fb.group({
      appointmentId: [null],
      patientId: [null, Validators.required],
      appointmentDate: [this.formatDate(new Date()), Validators.required],
      appointmentTime: ['', Validators.required],
      durationMinutes: [30, [Validators.required, Validators.min(15), Validators.max(120)]],
      visitType: ['', Validators.required],
      status: ['Schedule', Validators.required],
      providerId: [null, Validators.required],
      departmentId: [null, Validators.required],
      location: [''],
      resource: [''],
      visitReason: [''],
      chiefComplaint: [''],
      schedulingNotes: ['']
    });

    // Watch for eligibility changes
    this.appointmentForm.get('patientId')?.valueChanges.subscribe(patientId => {
      if (patientId) {
        this.loadInsuranceSnapshot(patientId);
      }
    });

    // Watch for visit type changes to auto-set duration
    this.appointmentForm.get('visitType')?.valueChanges.subscribe(visitType => {
      this.onVisitTypeChange(visitType);
    });

    // Watch for date changes
    this.appointmentForm.get('appointmentDate')?.valueChanges.subscribe(date => {
      if (date) {
        this.selectedDate = new Date(date);
        this.loadSchedules();
      }
    });
  }

  // Zone 1: Patient Header Methods
  searchPatients(): void {
    if (!this.patientSearchQuery.trim()) {
      this.patientSearchResults = [];
      return;
    }

    this.schedulingService.searchPatients(this.patientSearchQuery).subscribe({
      next: (patients) => {
        this.patientSearchResults = patients.slice(0, 10);
      },
      error: (err) => {
        console.error('Error searching patients:', err);
        this.showAlert('error', 'Failed to search patients');
      }
    });
  }

  selectPatient(patient: Patient): void {
    this.selectedPatientId = patient.id || null;
    this.patientSearchQuery = '';
    this.patientSearchResults = [];
    this.showPatientSearch = false;
    
    if (this.selectedPatientId) {
      this.appointmentForm.patchValue({ patientId: this.selectedPatientId });
      this.loadPatientHeader(this.selectedPatientId);
      this.loadInsuranceSnapshot(this.selectedPatientId);
    }
  }

  loadPatientHeader(patientId: number): void {
    this.schedulingService.getPatientHeader(patientId).subscribe({
      next: (header) => {
        this.patientHeader = header;
        this.updateAlerts(header.alerts);
      },
      error: (err) => {
        console.error('Error loading patient header:', err);
        this.showAlert('error', 'Failed to load patient information');
      }
    });
  }

  // Zone 2: Provider Schedule Grid Methods
  loadProviders(): void {
    this.schedulingService.getProviders().subscribe({
      next: (providers) => {
        this.providers = providers;
        if (providers.length > 0 && this.selectedProviders.length === 0) {
          // Select first provider by default
          this.selectedProviders = [providers[0].id || 0];
          this.appointmentForm.patchValue({ providerId: providers[0].id });
          this.loadSchedules();
        }
      },
      error: (err) => {
        console.error('Error loading providers:', err);
        this.showAlert('error', 'Failed to load providers');
      }
    });
  }

  loadSchedules(): void {
    if (this.selectedProviders.length === 0 || !this.selectedDate) {
      return;
    }

    this.isLoadingSchedules = true;
    const dateStr = this.formatDate(this.selectedDate);

    this.schedulingService.getProviderSchedules(this.selectedProviders, dateStr).subscribe({
      next: (schedules) => {
        this.providerSchedules = schedules;
        this.isLoadingSchedules = false;
      },
      error: (err) => {
        console.error('Error loading schedules:', err);
        this.isLoadingSchedules = false;
        this.showAlert('error', 'Failed to load provider schedules');
      }
    });
  }

  onProviderToggle(providerId: number): void {
    const index = this.selectedProviders.indexOf(providerId);
    if (index > -1) {
      this.selectedProviders.splice(index, 1);
    } else {
      this.selectedProviders.push(providerId);
    }
    this.loadSchedules();
  }

  onSlotClick(slot: ScheduleSlot): void {
    if (!slot.isSelectable || slot.status !== 'AVAILABLE') {
      return;
    }

    // Prefill form with slot data
    this.appointmentForm.patchValue({
      appointmentTime: slot.startTime,
      providerId: slot.providerId,
      durationMinutes: this.calculateDuration(slot.startTime, slot.endTime)
    });

    // If patient is selected, validate eligibility
    if (this.selectedPatientId && this.isEligibilityExpired) {
      this.showAlert('error', 'Cannot schedule: Insurance eligibility expired');
    }
  }

  calculateDuration(startTime: string, endTime: string): number {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return endMinutes - startMinutes;
  }

  // Zone 3: Appointment Details Panel Methods
  loadDepartments(): void {
    this.schedulingService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (err) => {
        console.error('Error loading departments:', err);
      }
    });
  }

  loadInsuranceSnapshot(patientId: number): void {
    this.schedulingService.getInsuranceSnapshot(patientId).subscribe({
      next: (snapshot) => {
        this.insuranceSnapshot = snapshot;
        this.isEligibilityExpired = snapshot.eligibilityStatus === 'EXPIRED';
        
        if (this.isEligibilityExpired) {
          this.showAlert('error', 'Insurance eligibility expired. Cannot schedule appointment.');
        } else {
          this.clearAlert();
        }
      },
      error: (err) => {
        console.error('Error loading insurance snapshot:', err);
      }
    });
  }

  onVisitTypeChange(visitType: string): void {
    if (!visitType) return;

    switch (visitType) {
      case 'New Patient':
      case 'Annual Physical':
        this.appointmentForm.patchValue({ durationMinutes: 60 });
        break;
      case 'Procedure':
        this.appointmentForm.patchValue({ durationMinutes: 45 });
        break;
      case 'Follow-up':
      case 'Consultation':
      case 'Urgent Care':
      default:
        this.appointmentForm.patchValue({ durationMinutes: 30 });
        break;
    }
  }

  // Form Actions
  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.markFormGroupTouched(this.appointmentForm);
      this.showAlert('error', 'Please fill in all required fields');
      return;
    }

    if (this.isEligibilityExpired) {
      this.showAlert('error', 'Cannot schedule: Insurance eligibility expired');
      return;
    }

    this.isSaving = true;
    const formData: AppointmentFormData = this.appointmentForm.value;

    const saveOperation = formData.appointmentId
      ? this.schedulingService.updateAppointment(formData.appointmentId, formData)
      : this.schedulingService.saveAppointment(formData);

    saveOperation.subscribe({
      next: (result) => {
        this.isSaving = false;
        this.showAlert('info', 'Appointment saved successfully');
        setTimeout(() => {
          this.router.navigate(['/admin/appointments']);
        }, 1500);
      },
      error: (err) => {
        console.error('Error saving appointment:', err);
        this.isSaving = false;
        this.showAlert('error', 'Failed to save appointment');
      }
    });
  }

  onCancel(): void {
    if (this.appointmentForm.dirty) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        this.router.navigate(['/admin/appointments']);
      }
    } else {
      this.router.navigate(['/admin/appointments']);
    }
  }

  onReschedule(): void {
    // Clear appointment ID to create new appointment
    this.appointmentForm.patchValue({ appointmentId: null });
    this.appointmentForm.patchValue({ status: 'Schedule' });
  }

  // Validation Helpers
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.appointmentForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.appointmentForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['min']) {
        return `Minimum value is ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `Maximum value is ${field.errors['max'].max}`;
      }
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      appointmentDate: 'Appointment Date',
      appointmentTime: 'Appointment Time',
      durationMinutes: 'Duration',
      visitType: 'Visit Type',
      providerId: 'Provider',
      departmentId: 'Department'
    };
    return labels[fieldName] || fieldName;
  }

  // Alert Management
  showAlert(type: 'warning' | 'error' | 'info', message: string): void {
    this.alertBanner = { type, message };
  }

  clearAlert(): void {
    this.alertBanner = null;
  }

  updateAlerts(alerts: PatientHeader['alerts']): void {
    const errorAlert = alerts.find(a => a.type === 'error');
    if (errorAlert) {
      this.showAlert('error', errorAlert.message);
    } else {
      const warningAlert = alerts.find(a => a.type === 'warning');
      if (warningAlert) {
        this.showAlert('warning', warningAlert.message);
      } else {
        this.clearAlert();
      }
    }
  }

  // Date Navigation
  previousDay(): void {
    this.selectedDate = new Date(this.selectedDate);
    this.selectedDate.setDate(this.selectedDate.getDate() - 1);
    this.appointmentForm.patchValue({ appointmentDate: this.formatDate(this.selectedDate) });
  }

  nextDay(): void {
    this.selectedDate = new Date(this.selectedDate);
    this.selectedDate.setDate(this.selectedDate.getDate() + 1);
    this.appointmentForm.patchValue({ appointmentDate: this.formatDate(this.selectedDate) });
  }

  goToToday(): void {
    this.selectedDate = new Date();
    this.appointmentForm.patchValue({ appointmentDate: this.formatDate(this.selectedDate) });
  }

  // Utility Methods
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  getSlotClass(slot: ScheduleSlot): string {
    return `schedule-slot slot-${slot.status.toLowerCase()}`;
  }

  getSlotTooltip(slot: ScheduleSlot): string {
    if (slot.status === 'BOOKED' && slot.patientName) {
      return `${slot.patientName} - ${slot.visitType || 'Visit'}`;
    }
    if (slot.status === 'BLOCKED') {
      return 'Slot is blocked';
    }
    if (slot.status === 'OVERBOOK') {
      return 'Overbooked slot';
    }
    return 'Available - Click to select';
  }

  calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  getTimeSlots(): string[] {
    const slots: string[] = [];
    for (let hour = 8; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    return slots;
  }

  onDateInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.value) {
      this.appointmentForm.patchValue({ appointmentDate: target.value });
      this.selectedDate = new Date(target.value);
      this.loadSchedules();
    }
  }
}

