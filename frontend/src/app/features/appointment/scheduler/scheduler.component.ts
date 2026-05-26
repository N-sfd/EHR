import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SchedulingService } from '../../scheduling/services/scheduling.service';
import { PatientService } from '../../../core/services/patient.service';
import { InsuranceService } from '../../../core/services/insurance.service';
import { Appointment } from '../../../core/models/appointment.model';
import { Patient } from '../../../core/models/patient.model';
import { Doctor } from '../../../core/models/doctor.model';
import { Department } from '../../../core/models/department.model';
import { Insurance } from '../../../core/models/insurance.model';
import { SchedulingEvent } from '../models/scheduling-event.model';
import { AppointmentFormData } from '../models/appointment-scheduling.models';

@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.scss']
})
export class SchedulerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private schedulingService = inject(SchedulingService);
  private patientService = inject(PatientService);
  private insuranceService = inject(InsuranceService);

  // Patient Header
  selectedPatient: Patient | null = null;
  patientId?: number;
  patientAlerts: string[] = [];
  patientSearchTerm = '';
  patientSearchResults: Patient[] = [];
  showPatientSearchResults = false;
  patientSearchDebounceTimer: any = null;

  // Provider Selection (for form only, no grid)
  selectedDate: Date = new Date();
  selectedProviders: number[] = [];
  providers: Doctor[] = [];

  // Appointment Details
  appointment: Partial<Appointment> & { insuranceInfo?: Insurance } = {
    appointmentType: 'In Person',
    status: 'Schedule',
    durationMinutes: 30
  };
  departments: Department[] = [];
  visitTypes: ('New Patient' | 'Follow-up' | 'Consultation' | 'Procedure' | 'Annual Physical' | 'Urgent Care')[] = 
    ['New Patient', 'Follow-up', 'Consultation', 'Procedure', 'Annual Physical', 'Urgent Care'];
  
  // Validation
  validationErrors: string[] = [];
  serverErrors: string[] = [];
  isSaving = false;
  hasConflict = false;
  
  // Step-based form
  currentStep = 1;
  totalSteps = 4;
  steps = [
    { number: 1, title: 'Patient', icon: 'fa-user' },
    { number: 2, title: 'Appointment Details', icon: 'fa-calendar' },
    { number: 3, title: 'Provider & Location', icon: 'fa-user-md' },
    { number: 4, title: 'Review & Confirm', icon: 'fa-check-circle' }
  ];

  ngOnInit() {
    // Handle route params for CREATE (from grid click)
    this.route.queryParams.subscribe(params => {
      // Handle CREATE event (from grid empty cell click)
      if (params['providerId'] && params['date'] && params['startTime']) {
        const providerId = +params['providerId'];
        const date = params['date'] as string;
        const startTime = params['startTime'] as string;
        
        this.selectedProviders = [providerId];
        this.selectedDate = new Date(date);
        this.appointment.appointmentDate = date;
        this.appointment.appointmentTime = startTime;
        
        if (params['durationMinutes']) {
          this.appointment.durationMinutes = +params['durationMinutes'];
        }
      }
      
      // Handle patientId if provided
      if (params['patientId']) {
        this.patientId = +params['patientId'];
        this.loadPatient(this.patientId);
      }
    });
    
    // Handle route params for EDIT (from grid bar click)
    this.route.paramMap.subscribe(paramMap => {
      const appointmentId = paramMap.get('id');
      if (appointmentId) {
        this.loadAppointment(+appointmentId);
      }
    });

    this.loadProviders();
    this.loadDepartments();
  }

  loadPatient(patientId: number) {
    this.patientService.getById(patientId).subscribe({
      next: (patient) => {
        this.selectedPatient = patient;
        this.appointment.patientId = patientId;
        this.checkPatientAlerts(patient);
        this.loadPatientInsurance(patientId);
      },
      error: (err) => {
        console.error('Error loading patient:', err);
      }
    });
  }

  checkPatientAlerts(patient: Patient) {
    this.patientAlerts = [];
    if (!patient.phoneNumber) {
      this.patientAlerts.push('Missing Phone');
    }
    if (!patient.emailAddress) {
      this.patientAlerts.push('Missing Email');
    }
    // Add more alert checks
  }

  loadPatientInsurance(patientId: number) {
    this.insuranceService.getByPatientId(patientId).subscribe({
      next: (insurances) => {
        if (insurances.length > 0) {
          this.appointment.insuranceInfo = insurances[0];
        }
      }
    });
  }

  loadProviders() {
    this.schedulingService.getProviders().subscribe({
      next: (doctors) => {
        this.providers = doctors;
        if (this.selectedProviders.length === 0 && doctors.length > 0) {
          this.selectedProviders = [doctors[0].id || 0];
        }
        // Set default provider in appointment if not set
        if (!this.appointment.doctorId && doctors.length > 0) {
          this.appointment.doctorId = doctors[0].id || 0;
        }
      }
    });
  }

  loadDepartments() {
    this.schedulingService.getDepartments().subscribe({
      next: (depts: Department[]) => {
        this.departments = depts;
      },
      error: (err) => {
        console.error('Error loading departments:', err);
        this.departments = [];
      }
    });
  }

  // Grid methods removed - this component is form-only
  // All grid rendering is handled by ScheduleGridComponent

  onVisitTypeChange(): void {
    // Visit type drives duration and provider requirements
    const visitType = this.appointment.visitType;
    if (!visitType) {
      return;
    }
    
    switch (visitType) {
      case 'New Patient':
        this.appointment.durationMinutes = 60;
        break;
      case 'Follow-up':
        this.appointment.durationMinutes = 30;
        break;
      case 'Procedure':
        this.appointment.durationMinutes = 45;
        break;
      case 'Consultation':
        this.appointment.durationMinutes = 30;
        break;
      case 'Annual Physical':
        this.appointment.durationMinutes = 60;
        break;
      case 'Urgent Care':
        this.appointment.durationMinutes = 30;
        break;
      default:
        this.appointment.durationMinutes = 30;
    }
    this.validateAppointment();
  }

  // Patient Search with Typeahead
  onPatientSearchInput(): void {
    if (this.patientSearchDebounceTimer) {
      clearTimeout(this.patientSearchDebounceTimer);
    }
    
    if (!this.patientSearchTerm || this.patientSearchTerm.length < 2) {
      this.patientSearchResults = [];
      this.showPatientSearchResults = false;
      return;
    }
    
    this.patientSearchDebounceTimer = setTimeout(() => {
      this.searchPatient();
    }, 300);
  }

  searchPatient(): void {
    if (!this.patientSearchTerm || this.patientSearchTerm.length < 2) {
      this.patientSearchResults = [];
      this.showPatientSearchResults = false;
      return;
    }
    
    this.schedulingService.searchPatients(this.patientSearchTerm).subscribe({
      next: (patients) => {
        this.patientSearchResults = patients;
        this.showPatientSearchResults = true;
      },
      error: (err) => {
        console.error('Error searching patients:', err);
        this.patientSearchResults = [];
        this.showPatientSearchResults = false;
      }
    });
  }

  selectPatientFromSearch(patient: Patient): void {
    this.selectedPatient = patient;
    this.appointment.patientId = patient.id;
    this.patientId = patient.id;
    this.patientSearchTerm = '';
    this.patientSearchResults = [];
    this.showPatientSearchResults = false;
    this.checkPatientAlerts(patient);
    this.loadPatientInsurance(patient.id!);
    this.validateAppointment();
  }

  clearSelectedPatient(): void {
    this.selectedPatient = null;
    this.appointment.patientId = undefined;
    this.patientId = undefined;
    this.patientSearchTerm = '';
    this.patientSearchResults = [];
    this.showPatientSearchResults = false;
    this.validateAppointment();
  }

  onPatientSearchBlur(): void {
    // Delay hiding results to allow click events to fire
    setTimeout(() => {
      this.showPatientSearchResults = false;
    }, 200);
  }

  getPatientAge(): string {
    if (!this.selectedPatient?.dateOfBirth) {
      return '';
    }
    return this.calculateAge(this.selectedPatient.dateOfBirth);
  }

  calculateAgeNumber(dob: string): number {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  calculateAge(dob: string): string {
    const age = this.calculateAgeNumber(dob);
    return age > 0 ? `${age} yrs` : '';
  }

  /**
   * Map legacy status values to canonical status values
   */
  private mapStatusToCanonical(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Schedule': 'SCHEDULED',
      'Confirmed': 'CONFIRMED',
      'Arrived': 'ARRIVED',
      'Checked In': 'CHECKED_IN',
      'Checked Out': 'CHECKED_OUT',
      'Cancelled': 'CANCELLED'
    };
    return statusMap[status] || 'SCHEDULED';
  }

  validateAppointment(): boolean {
    this.validationErrors = [];

    if (!this.appointment.patientId) {
      this.validationErrors.push('Patient is required');
    }

    if (!this.appointment.appointmentDate) {
      this.validationErrors.push('Appointment date is required');
    }

    if (!this.appointment.appointmentTime) {
      this.validationErrors.push('Appointment time is required');
    }

    if (!this.appointment.doctorId) {
      this.validationErrors.push('Provider is required');
    }

    if (!this.appointment.visitType) {
      this.validationErrors.push('Visit type is required');
    }

    if (!this.appointment.durationMinutes || this.appointment.durationMinutes <= 0) {
      this.validationErrors.push('Duration must be greater than 0');
    }

    // Validate date/time logic
    if (this.appointment.appointmentDate && this.appointment.appointmentTime) {
      const appointmentDateTime = new Date(`${this.appointment.appointmentDate}T${this.appointment.appointmentTime}:00`);
      const now = new Date();
      if (appointmentDateTime < now) {
        this.validationErrors.push('Appointment date and time cannot be in the past');
      }
    }

    return this.validationErrors.length === 0;
  }

  saveAppointment() {
    if (!this.validateAppointment()) {
      return;
    }

    this.isSaving = true;
    
    // Convert to AppointmentFormData format for compatibility
    // Note: The API service will handle conversion to AppointmentDto format
    const appointmentData: AppointmentFormData = {
      patientId: this.appointment.patientId!,
      providerId: this.appointment.doctorId!,
      departmentId: this.appointment.departmentId || 0,
      appointmentDate: this.appointment.appointmentDate || '',
      appointmentTime: this.appointment.appointmentTime || '09:00',
      durationMinutes: this.appointment.durationMinutes || 30,
      visitType: this.appointment.visitType || 'Follow-up',
      status: this.mapStatusToCanonical(this.appointment.status || 'Schedule'),
      visitReason: this.appointment.reason,
      schedulingNotes: this.appointment.notes
    };

    this.schedulingService.saveAppointment(appointmentData).subscribe({
      next: (savedAppointment) => {
        this.isSaving = false;
        // Navigate back to grid with scroll position
        const appointmentId = savedAppointment?.id || savedAppointment?.appointmentId;
        const scrollParams: any = {};
        if (appointmentId) {
          scrollParams.appointmentId = appointmentId;
        }
        if (this.appointment.appointmentDate) {
          scrollParams.date = this.appointment.appointmentDate;
        }
        if (this.appointment.doctorId) {
          scrollParams.providerId = this.appointment.doctorId;
        }
        
        this.router.navigate(['/admin/appointments/grid'], { queryParams: scrollParams }).then(() => {
          // Auto-scroll to appointment after a brief delay
          setTimeout(() => {
            if (appointmentId) {
              const apptElement = document.querySelector(`[data-appt-id="${appointmentId}"]`);
              if (apptElement) {
                apptElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Highlight the appointment briefly
                apptElement.classList.add('appt-highlight');
                setTimeout(() => apptElement.classList.remove('appt-highlight'), 2000);
              }
            }
          }, 300);
        });
      },
      error: (err) => {
        console.error('Error saving appointment:', err);
        this.isSaving = false;
        this.serverErrors = [];
        
        // Handle different error types
        if (err.status === 400) {
          // Validation errors from backend
          if (err.error?.errors) {
            this.serverErrors = Object.values(err.error.errors).flat() as string[];
          } else if (err.error?.message) {
            this.serverErrors = [err.error.message];
          } else {
            this.serverErrors = ['Invalid appointment data. Please check all fields.'];
          }
        } else if (err.status === 409) {
          // Conflict error
          const conflictMessage = err.error?.message || err.headers?.get('X-Conflict-Reason') || 'This appointment conflicts with another appointment.';
          this.serverErrors = [conflictMessage];
        } else if (err.status === 404) {
          this.serverErrors = ['Resource not found. Please refresh and try again.'];
        } else {
          this.serverErrors = ['Failed to save appointment. Please try again.'];
        }
        
        // Scroll to error banner
        setTimeout(() => {
          const errorBanner = document.querySelector('.server-error-banner');
          if (errorBanner) {
            errorBanner.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    });
  }

  loadAppointment(appointmentId: number) {
    this.schedulingService.getAppointmentById(appointmentId).subscribe({
      next: (appointment: Partial<Appointment> & { insuranceInfo?: Insurance }) => {
        // Map appointment data to form
        // Handle both old Appointment model and new normalized DTO structure
        const apptWithExtended = appointment as Partial<Appointment> & { 
          providerId?: number; 
          startDateTime?: string; 
          durationMins?: number; 
          visitReason?: string; 
          schedulingNotes?: string;
        };
        
        this.appointment = {
          appointmentId: appointment.appointmentId || appointment.id,
          patientId: appointment.patientId || 0,
          doctorId: appointment.doctorId || apptWithExtended.providerId || 0,
          departmentId: appointment.departmentId,
          appointmentDate: appointment.appointmentDate || (apptWithExtended.startDateTime ? this.formatDate(new Date(apptWithExtended.startDateTime)) : ''),
          appointmentTime: appointment.appointmentTime || (apptWithExtended.startDateTime ? this.formatTimeFromISO(apptWithExtended.startDateTime) : ''),
          durationMinutes: appointment.durationMinutes || apptWithExtended.durationMins || 30,
          visitType: appointment.visitType || 'Follow-up',
          status: appointment.status || 'Schedule',
          reason: appointment.reason || apptWithExtended.visitReason,
          notes: appointment.notes || apptWithExtended.schedulingNotes,
          appointmentType: appointment.appointmentType || 'In Person',
          location: appointment.location
        };
        
        // Load patient if not already loaded
        if (appointment.patientId && (!this.selectedPatient || this.selectedPatient.id !== appointment.patientId)) {
          this.loadPatient(appointment.patientId);
        }
        
        // Validate after loading
        this.validateAppointment();
      },
      error: (err) => {
        console.error('Error loading appointment:', err);
      }
    });
  }

  private formatTimeFromISO(isoString: string): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getDateDisplay(): string {
    return this.selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }


  calculateEndTime(): Date | null {
    if (!this.appointment.appointmentDate || !this.appointment.appointmentTime || !this.appointment.durationMinutes) {
      return null;
    }
    const start = new Date(`${this.appointment.appointmentDate}T${this.appointment.appointmentTime}:00`);
    const end = new Date(start.getTime() + (this.appointment.durationMinutes || 30) * 60000);
    return end;
  }

  getEndTime(): string {
    const endTime = this.calculateEndTime();
    if (!endTime) {
      return '—';
    }
    return endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  onDurationChange(): void {
    // Auto-calc end time when duration changes
    this.validateAppointment();
  }

  onDateTimeChange(): void {
    // Auto-calc end time when date/time changes
    this.validateAppointment();
  }

  getProviderName(providerId?: number): string {
    if (!providerId) return 'Not selected';
    const provider = this.providers.find(p => p.id === providerId);
    return provider ? `${provider.firstName} ${provider.lastName}` : 'Unknown';
  }

  getDepartmentName(departmentId?: number): string {
    if (!departmentId) return 'Not selected';
    const dept = this.departments.find(d => d.id === departmentId);
    return dept ? dept.name : 'Unknown';
  }

  canProceedToStep(step: number): boolean {
    switch (step) {
      case 2:
        return !!this.appointment.patientId;
      case 3:
        return !!this.appointment.patientId && !!this.appointment.appointmentDate && !!this.appointment.appointmentTime && !!this.appointment.durationMinutes && !!this.appointment.visitType;
      case 4:
        return this.validateAppointment();
      default:
        return true;
    }
  }

  nextStep() {
    if (this.canProceedToStep(this.currentStep + 1)) {
      this.currentStep = Math.min(this.currentStep + 1, this.totalSteps);
    }
  }

  previousStep() {
    this.currentStep = Math.max(this.currentStep - 1, 1);
  }

  goToStep(step: number) {
    if (step <= this.currentStep || this.canProceedToStep(step)) {
      this.currentStep = step;
    }
  }

  checkConflict(): void {
    // Simple client-side conflict check
    // In production, this would call a backend API
    if (this.appointment.doctorId && this.appointment.appointmentDate && this.appointment.appointmentTime) {
      // For now, just set to false - backend will handle actual conflict detection
      this.hasConflict = false;
    } else {
      this.hasConflict = false;
    }
  }

  duplicateAppointment(): void {
    // Create a duplicate with same details but new date/time
    const duplicate = { ...this.appointment };
    duplicate.appointmentDate = undefined;
    duplicate.appointmentTime = undefined;
    this.appointment = duplicate;
    this.currentStep = 2; // Go to appointment details step
  }

  saveAsTemplate(): void {
    // Save current appointment as a template
    // In production, this would save to a templates table
    alert('Template saved! (Feature coming soon)');
  }
}

