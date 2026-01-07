import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';
import { PatientService } from '../../../core/services/patient.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { DepartmentService } from '../../../core/services/department.service';
import { InsuranceService } from '../../../core/services/insurance.service';
import { ScheduleGridService } from '../../../core/services/schedule-grid.service';
import { Appointment } from '../../../core/models/appointment.model';
import { Patient } from '../../../core/models/patient.model';
import { Doctor } from '../../../core/models/doctor.model';
import { Department } from '../../../core/models/department.model';
import { ScheduleGrid, TimeSlot } from '../../../core/models/schedule-grid.model';
import { Insurance } from '../../../core/models/insurance.model';

@Component({
  selector: 'app-epic-scheduler',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './epic-scheduler.component.html',
  styleUrls: ['./epic-scheduler.component.css']
})
export class EpicSchedulerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private appointmentService = inject(AppointmentService);
  private patientService = inject(PatientService);
  private doctorService = inject(DoctorService);
  private departmentService = inject(DepartmentService);
  private insuranceService = inject(InsuranceService);
  private scheduleGridService = inject(ScheduleGridService);

  // Patient Header
  selectedPatient: Patient | null = null;
  patientId?: number;
  patientAlerts: string[] = [];
  patientSearchTerm = '';
  patientSearchResults: Patient[] = [];

  // Provider Grid
  selectedDate: Date = new Date();
  selectedProviders: number[] = [];
  providers: Doctor[] = [];
  scheduleGrids: ScheduleGrid[] = [];
  slotInterval: 15 | 30 = 30;
  viewMode: 'day' | 'week' = 'day';

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
  isSaving = false;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['patientId']) {
        this.patientId = +params['patientId'];
        this.loadPatient(this.patientId);
      }
      if (params['providerId']) {
        this.selectedProviders = [+params['providerId']];
      }
      if (params['date']) {
        this.selectedDate = new Date(params['date']);
      }
      if (params['time']) {
        this.appointment.appointmentTime = params['time'];
      }
      if (params['duration']) {
        this.appointment.durationMinutes = +params['duration'];
      }
    });

    this.loadProviders();
    this.loadDepartments();
    this.loadScheduleGrids();
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
    this.doctorService.getAll().subscribe({
      next: (doctors) => {
        this.providers = doctors;
        if (this.selectedProviders.length === 0 && doctors.length > 0) {
          this.selectedProviders = [doctors[0].id || 0];
        }
        this.loadScheduleGrids();
      }
    });
  }

  loadDepartments() {
    this.departmentService.getAll().subscribe({
      next: (departments) => {
        this.departments = departments;
      }
    });
  }

  loadScheduleGrids() {
    if (this.selectedProviders.length === 0) return;

    const dateStr = this.formatDate(this.selectedDate);
    this.scheduleGridService.getMultiProviderScheduleGrid(this.selectedProviders, dateStr).subscribe({
      next: (grids) => {
        this.scheduleGrids = grids;
      },
      error: (err) => {
        console.error('Error loading schedule grids:', err);
      }
    });
  }

  onSlotClick(slot: TimeSlot, providerId: number) {
    if (slot.status === 'AVAILABLE' && slot.isSelectable) {
      this.appointment.doctorId = providerId;
      this.appointment.appointmentTime = slot.startTime;
      this.appointment.appointmentDate = this.formatDate(this.selectedDate);
      this.appointment.durationMinutes = this.calculateDuration(slot.startTime, slot.endTime);
      this.validateAppointment();
    } else if (slot.appointment) {
      // Load existing appointment
      this.loadAppointment(slot.appointment.appointmentId);
    }
  }

  calculateDuration(start: string, end: string): number {
    const startTime = new Date(`2000-01-01T${start}`);
    const endTime = new Date(`2000-01-01T${end}`);
    return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  }

  onDateChange() {
    this.loadScheduleGrids();
  }

  onProviderToggle(providerId: number) {
    const index = this.selectedProviders.indexOf(providerId);
    if (index > -1) {
      this.selectedProviders.splice(index, 1);
    } else {
      this.selectedProviders.push(providerId);
    }
    this.loadScheduleGrids();
  }

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

  validateAppointment() {
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

    if (!this.appointment.durationMinutes) {
      this.validationErrors.push('Duration is required');
    }

    // Check slot availability
    if (this.appointment.doctorId && this.appointment.appointmentDate && this.appointment.appointmentTime) {
      // Additional validation logic
    }
  }

  saveAppointment() {
    this.validateAppointment();
    if (this.validationErrors.length > 0) {
      return;
    }

    this.isSaving = true;
    const appointmentData: Appointment = {
      patientId: this.appointment.patientId!,
      doctorId: this.appointment.doctorId!,
      departmentId: this.appointment.departmentId,
      appointmentType: this.appointment.appointmentType || 'In Person',
      appointmentDate: this.appointment.appointmentDate!,
      appointmentTime: this.appointment.appointmentTime!,
      durationMinutes: this.appointment.durationMinutes,
      visitType: this.appointment.visitType,
      reason: this.appointment.reason,
      status: 'Schedule',
      location: this.appointment.location,
      notes: this.appointment.notes
    };

    this.appointmentService.create(appointmentData).subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/admin/appointments']);
      },
      error: (err) => {
        console.error('Error saving appointment:', err);
        this.validationErrors.push('Failed to save appointment');
        this.isSaving = false;
      }
    });
  }

  loadAppointment(appointmentId: number) {
    this.appointmentService.getById(appointmentId).subscribe({
      next: (appointment) => {
        this.appointment = appointment;
        if (appointment.patientId) {
          this.loadPatient(appointment.patientId);
        }
      }
    });
  }

  getSlotClass(slot: TimeSlot): string {
    const baseClass = 'time-slot';
    const statusClass = `slot-${slot.status.toLowerCase()}`;
    return `${baseClass} ${statusClass}`;
  }

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

  previousDay() {
    this.selectedDate = new Date(this.selectedDate);
    this.selectedDate.setDate(this.selectedDate.getDate() - 1);
    this.loadScheduleGrids();
  }

  nextDay() {
    this.selectedDate = new Date(this.selectedDate);
    this.selectedDate.setDate(this.selectedDate.getDate() + 1);
    this.loadScheduleGrids();
  }

  goToToday() {
    this.selectedDate = new Date();
    this.loadScheduleGrids();
  }

  getDateDisplay(): string {
    return this.selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  calculateAge(dob: string | undefined): string {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  }

  getTimeSlots(): string[] {
    const slots: string[] = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += this.slotInterval) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
        slots.push(timeStr);
      }
    }
    return slots;
  }

  formatTimeLabel(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  getSlotTooltip(slot: TimeSlot): string {
    if (slot.appointment) {
      return `${slot.appointment.patientName} - ${slot.appointment.visitType || 'Visit'}`;
    }
    return `Available slot - Click to book`;
  }

  searchPatient() {
    if (!this.patientSearchTerm.trim()) {
      this.patientSearchResults = [];
      return;
    }

    this.patientService.getAll().subscribe({
      next: (patients) => {
        const search = this.patientSearchTerm.toLowerCase();
        this.patientSearchResults = patients.filter(patient => {
          const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.toLowerCase();
          const mrn = (patient as any).patientCode?.toLowerCase() || '';
          const phone = patient.phoneNumber?.toLowerCase() || '';
          return fullName.includes(search) || mrn.includes(search) || phone.includes(search);
        }).slice(0, 10);
      }
    });
  }

  selectPatientFromSearch(patient: Patient) {
    this.selectedPatient = patient;
    this.patientId = patient.id;
    this.appointment.patientId = patient.id;
    this.patientSearchTerm = '';
    this.patientSearchResults = [];
    this.checkPatientAlerts(patient);
    this.loadPatientInsurance(patient.id || 0);
  }
}

