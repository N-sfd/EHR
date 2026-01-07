import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PatientService } from '../../../core/services/patient.service';
import { SchedulingService } from '../../scheduling/services/scheduling.service';
import { RoomingService } from '../../../core/services/rooming.service';
import { ProviderEncounterService } from '../../../core/services/provider-encounter.service';
import { EncounterService } from '../../../core/services/encounter.service';
import { CheckInService, CheckInResult } from '../../../core/services/checkin.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { RegistrationCompletenessService } from '../../../core/services/registration-completeness.service';
import { CoverageService } from '../../../core/services/coverage.service';
import { Patient } from '../../../core/models/patient.model';
import { Appointment } from '../../../core/models/appointment.model';
import { Encounter } from '../../../core/models/encounter.model';
import { RegistrationCompletenessBannerComponent } from '../../../shared/components/registration-completeness-banner/registration-completeness-banner.component';
import { PatientUpdateDrawerComponent } from '../../../shared/components/patient-update-drawer/patient-update-drawer.component';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  data?: any;
}

@Component({
  selector: 'app-workflow-demo',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RegistrationCompletenessBannerComponent,
    PatientUpdateDrawerComponent
  ],
  templateUrl: './workflow-demo.component.html',
  styleUrls: ['./workflow-demo.component.scss']
})
export class WorkflowDemoComponent implements OnInit {
  private patientService = inject(PatientService);
  private schedulingService = inject(SchedulingService);
  private roomingService = inject(RoomingService);
  private providerEncounterService = inject(ProviderEncounterService);
  private encounterService = inject(EncounterService);
  private checkInService = inject(CheckInService);
  private appointmentService = inject(AppointmentService);
  private completenessService = inject(RegistrationCompletenessService);
  private coverageService = inject(CoverageService);
  router = inject(Router);

  currentStep = 0;
  workflowSteps: WorkflowStep[] = [
    {
      id: 'search',
      title: '1. Patient Search',
      description: 'Search for patient and view demographics & coverage',
      status: 'pending'
    },
    {
      id: 'schedule',
      title: '2. Schedule Appointment',
      description: 'Select time slot and create appointment',
      status: 'pending'
    },
    {
      id: 'checkin',
      title: '3. Check-in',
      description: 'Mark patient as arrived/checked-in with rule validation',
      status: 'pending'
    },
    {
      id: 'encounter',
      title: '4. Create Encounter',
      description: 'Create encounter from appointment when checked-in',
      status: 'pending'
    },
    {
      id: 'rooming',
      title: '5. Nurse Rooming',
      description: 'Record vitals and medication reconciliation',
      status: 'pending'
    },
    {
      id: 'provider',
      title: '6. Provider Encounter',
      description: 'Chart review, add diagnoses, orders, and SOAP note',
      status: 'pending'
    }
  ];

  selectedPatient: Patient | null = null;
  selectedAppointment: Appointment | null = null;
  selectedEncounter: Encounter | null = null;
  patientSearchQuery = '';
  searchResults: Patient[] = [];
  isSearching = false;
  
  registrationBlockers: string[] = [];
  showUpdateDrawer = false;

  // Check-in data
  checkInStatus: 'ARRIVED' | 'CHECKED_IN' | null = null;
  checkInErrors: string[] = [];

  // Rooming data
  roomingData = {
    vitals: {
      bloodPressure: '',
      temperature: '',
      pulse: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      height: '',
      weight: '',
      bmi: ''
    },
    chiefComplaint: '',
    medications: '',
    allergies: ''
  };

  // Provider encounter data
  providerData = {
    diagnoses: [] as string[],
    orders: [] as string[],
    soapNote: ''
  };

  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  ngOnInit(): void {
    this.updateStepStatus();
  }

  // Step 1: Patient Search
  searchPatients(): void {
    if (!this.patientSearchQuery.trim()) {
      this.errorMessage = 'Please enter a search query';
      return;
    }

    this.isSearching = true;
    this.errorMessage = null;
    this.patientService.searchPatients(this.patientSearchQuery).subscribe({
      next: (patients) => {
        this.searchResults = patients;
        this.isSearching = false;
        if (patients.length === 0) {
          this.errorMessage = 'No patients found';
        }
      },
      error: (err) => {
        console.error('Error searching patients:', err);
        this.errorMessage = 'Failed to search patients';
        this.isSearching = false;
      }
    });
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient = patient;
    this.searchResults = [];
    this.patientSearchQuery = '';
    this.completeStep('search', patient);
    this.showSuccess('Patient selected: ' + patient.firstName + ' ' + patient.lastName);
  }

  // Step 2: Schedule Appointment
  goToScheduling(): void {
    if (!this.selectedPatient) {
      this.errorMessage = 'Please select a patient first';
      return;
    }

    // Navigate to scheduling with patient pre-selected
    this.router.navigate(['/scheduling/appointments'], {
      queryParams: { patientId: this.selectedPatient.id }
    });
  }

  onAppointmentScheduled(appointment: Appointment): void {
    this.selectedAppointment = appointment;
    this.completeStep('schedule', appointment);
    this.showSuccess('Appointment scheduled: ' + appointment.appointmentCode);
  }

  // Step 3: Check-in
  checkIn(status: 'ARRIVED' | 'CHECKED_IN'): void {
    if (!this.selectedAppointment || !this.selectedAppointment.appointmentId) {
      this.errorMessage = 'Please schedule an appointment first';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.checkInErrors = [];

    if (status === 'ARRIVED') {
      this.checkInService.markArrived(this.selectedAppointment.appointmentId).subscribe({
        next: (appointment) => {
          this.selectedAppointment = appointment;
          this.checkInStatus = 'ARRIVED';
          this.completeStep('checkin', { status: 'ARRIVED' });
          this.showSuccess('Patient marked as arrived');
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error marking as arrived:', err);
          this.errorMessage = 'Failed to mark patient as arrived';
          this.isLoading = false;
        }
      });
    } else {
      this.checkInService.checkIn(this.selectedAppointment.appointmentId).subscribe({
        next: (result: CheckInResult) => {
          if (result.success && result.appointment) {
            this.selectedAppointment = result.appointment;
            this.checkInStatus = 'CHECKED_IN';
            this.completeStep('checkin', { status: 'CHECKED_IN' });
            this.showSuccess('Patient checked in successfully');
          } else {
            this.checkInErrors = result.errors;
            this.errorMessage = 'Check-in validation failed';
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error during check-in:', err);
          if (err.error?.data?.errors) {
            this.checkInErrors = err.error.data.errors;
          }
          this.errorMessage = err.error?.message || 'Failed to check in patient';
          this.isLoading = false;
        }
      });
    }
  }

  private async validateCheckInRules(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!this.selectedPatient) {
      return { valid: false, errors: ['No patient selected'] };
    }

    // Check insurance eligibility
    // In real implementation, call backend to check rules
    // For demo, we'll simulate rule checks
    // Note: insuranceVerified may not exist on Patient model, so we'll skip this check for now

    // Check required demographics
    if (!this.selectedPatient.phoneNumber) {
      errors.push('Patient phone number is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Step 4: Create Encounter
  async createEncounter(): Promise<void> {
    if (!this.selectedAppointment) {
      this.errorMessage = 'Please schedule and check-in appointment first';
      return;
    }

    if (this.selectedAppointment.status !== 'Checked In') {
      this.errorMessage = 'Patient must be checked in before creating encounter';
      return;
    }

    // Check registration completeness
    if (!this.selectedPatient?.id) {
      this.errorMessage = 'Patient information is missing';
      return;
    }

    // Load coverage and consent
    const coverage = await firstValueFrom(this.coverageService.getByPatientId(this.selectedPatient.id));
    const consent = await firstValueFrom(this.coverageService.getConsent(this.selectedPatient.id));

    const completeness = this.completenessService.checkCompleteness(
      this.selectedPatient,
      coverage || null,
      consent || null
    );

    if (completeness.blockers.length > 0) {
      this.registrationBlockers = completeness.blockers.map(b => b.label);
      this.errorMessage = `Registration incomplete. Please complete: ${completeness.blockers.map(b => b.label).join(', ')}`;
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.registrationBlockers = [];

    this.encounterService.createFromAppointment(this.selectedAppointment.appointmentId!).subscribe({
      next: (encounter) => {
        this.selectedEncounter = encounter;
        this.completeStep('encounter', encounter);
        this.showSuccess('Encounter created successfully');
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error creating encounter:', err);
        this.errorMessage = 'Failed to create encounter';
        this.isLoading = false;
      }
    });
  }

  onUpdateRequested(): void {
    this.showUpdateDrawer = true;
  }

  onDrawerClose(): void {
    this.showUpdateDrawer = false;
  }

  onPatientSaved(updatedPatient: Patient): void {
    this.selectedPatient = updatedPatient;
    this.onDrawerClose();
    // Re-check completeness
    this.registrationBlockers = [];
  }

  canCreateEncounter(): boolean {
    return this.registrationBlockers.length === 0;
  }

  // Step 5: Nurse Rooming
  saveRooming(): void {
    if (!this.selectedEncounter) {
      this.errorMessage = 'Please create encounter first';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const roomingData: any = {
      encounterId: this.selectedEncounter.encounterId,
      vitals: this.roomingData.vitals,
      chiefComplaint: this.roomingData.chiefComplaint,
      medications: this.roomingData.medications,
      allergies: this.roomingData.allergies
    };

    this.roomingService.create(roomingData).subscribe({
      next: (rooming) => {
        this.completeStep('rooming', rooming);
        this.showSuccess('Rooming completed successfully');
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error saving rooming:', err);
        this.errorMessage = 'Failed to save rooming data';
        this.isLoading = false;
      }
    });
  }

  // Step 6: Provider Encounter
  saveProviderEncounter(): void {
    if (!this.selectedEncounter) {
      this.errorMessage = 'Please complete rooming first';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const providerData: any = {
      encounterId: this.selectedEncounter.encounterId,
      diagnoses: this.providerData.diagnoses,
      orders: this.providerData.orders,
      soapNote: this.providerData.soapNote
    };

    this.providerEncounterService.create(providerData).subscribe({
      next: (encounter) => {
        this.completeStep('provider', encounter);
        this.showSuccess('Provider encounter completed successfully');
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error saving provider encounter:', err);
        this.errorMessage = 'Failed to save provider encounter';
        this.isLoading = false;
      }
    });
  }

  // Helper methods
  completeStep(stepId: string, data?: any): void {
    const step = this.workflowSteps.find(s => s.id === stepId);
    if (step) {
      step.status = 'completed';
      step.data = data;
    }
    this.updateStepStatus();
  }

  updateStepStatus(): void {
    // Mark current step as in-progress
    this.workflowSteps.forEach((step, index) => {
      if (index < this.currentStep) {
        step.status = 'completed';
      } else if (index === this.currentStep) {
        step.status = 'in-progress';
      } else {
        step.status = 'pending';
      }
    });
  }

  nextStep(): void {
    if (this.currentStep < this.workflowSteps.length - 1) {
      this.currentStep++;
      this.updateStepStatus();
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateStepStatus();
    }
  }

  goToStep(index: number): void {
    if (index >= 0 && index < this.workflowSteps.length) {
      this.currentStep = index;
      this.updateStepStatus();
    }
  }

  resetWorkflow(): void {
    this.currentStep = 0;
    this.selectedPatient = null;
    this.selectedAppointment = null;
    this.selectedEncounter = null;
    this.checkInStatus = null;
    this.checkInErrors = [];
    this.roomingData = {
      vitals: {
        bloodPressure: '',
        temperature: '',
        pulse: '',
        respiratoryRate: '',
        oxygenSaturation: '',
        height: '',
        weight: '',
        bmi: ''
      },
      chiefComplaint: '',
      medications: '',
      allergies: ''
    };
    this.providerData = {
      diagnoses: [],
      orders: [],
      soapNote: ''
    };
    this.workflowSteps.forEach(step => {
      step.status = 'pending';
      step.data = undefined;
    });
    this.updateStepStatus();
    this.errorMessage = null;
    this.successMessage = null;
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }

  addDiagnosis(): void {
    const diagnosis = prompt('Enter diagnosis (ICD-10 code or description):');
    if (diagnosis && diagnosis.trim()) {
      this.providerData.diagnoses.push(diagnosis.trim());
    }
  }

  removeDiagnosis(index: number): void {
    this.providerData.diagnoses.splice(index, 1);
  }

  addOrder(): void {
    const order = prompt('Enter order:');
    if (order && order.trim()) {
      this.providerData.orders.push(order.trim());
    }
  }

  removeOrder(index: number): void {
    this.providerData.orders.splice(index, 1);
  }

  calculateBMI(): void {
    const height = parseFloat(this.roomingData.vitals.height);
    const weight = parseFloat(this.roomingData.vitals.weight);
    if (height > 0 && weight > 0) {
      const heightInMeters = height / 100; // Convert cm to meters
      const bmi = weight / (heightInMeters * heightInMeters);
      this.roomingData.vitals.bmi = bmi.toFixed(1);
    }
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
}

