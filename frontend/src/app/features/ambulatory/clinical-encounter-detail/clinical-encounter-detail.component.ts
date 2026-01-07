import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EncounterService } from '../../../core/services/encounter.service';
import { PatientService } from '../../../core/services/patient.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { DepartmentService } from '../../../core/services/department.service';
import { RoomingService } from '../../../core/services/rooming.service';
import { ProviderEncounterService } from '../../../core/services/provider-encounter.service';
import { CheckoutService } from '../../../core/services/checkout.service';
import { RegistrationCompletenessService } from '../../../core/services/registration-completeness.service';
import { CoverageService } from '../../../core/services/coverage.service';
import { RoleService } from '../../../core/services/role.service';
import { Encounter } from '../../../core/models/encounter.model';
import { Patient } from '../../../core/models/patient.model';
import { Doctor } from '../../../core/models/doctor.model';
import { Department } from '../../../core/models/department.model';
import { Rooming, ProviderEncounter, Checkout } from '../../../core/models/ambulatory.model';
import { Coverage, PatientConsent } from '../../../core/models/coverage.model';
import { RegistrationCompleteness } from '../../../core/models/registration-completeness.model';
import { RegistrationCompletenessBannerComponent } from '../../../shared/components/registration-completeness-banner/registration-completeness-banner.component';
import { PatientUpdateDrawerComponent } from '../../../shared/components/patient-update-drawer/patient-update-drawer.component';

type StepType = 'rooming' | 'vitals' | 'meds' | 'diagnoses' | 'orders' | 'notes' | 'checkout';

interface NavigationStep {
  id: StepType;
  label: string;
  icon: string;
  completed: boolean;
  hasWarning: boolean;
}

interface Warning {
  type: 'error' | 'warning' | 'info';
  message: string;
  section?: StepType;
}

@Component({
  selector: 'app-clinical-encounter-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    RegistrationCompletenessBannerComponent,
    PatientUpdateDrawerComponent
  ],
  templateUrl: './clinical-encounter-detail.component.html',
  styleUrls: ['./clinical-encounter-detail.component.css']
})
export class ClinicalEncounterDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private encounterService = inject(EncounterService);
  private patientService = inject(PatientService);
  private doctorService = inject(DoctorService);
  private departmentService = inject(DepartmentService);
  private roomingService = inject(RoomingService);
  private providerEncounterService = inject(ProviderEncounterService);
  private checkoutService = inject(CheckoutService);
  private completenessService = inject(RegistrationCompletenessService);
  private coverageService = inject(CoverageService);
  private roleService = inject(RoleService);

  encounterId?: number;
  encounter: Encounter | null = null;
  patient: Patient | null = null;
  provider: Doctor | null = null;
  department: Department | null = null;
  rooming: Rooming | null = null;
  providerEncounter: ProviderEncounter | null = null;
  checkout: Checkout | null = null;

  // Registration completeness
  coverage: Coverage | null = null;
  consent: PatientConsent | null = null;
  registrationCompleteness: RegistrationCompleteness | null = null;
  showUpdateDrawer = false;
  showAllMissing = false;

  activeStep: StepType = 'rooming';
  isLoading = false;
  errorMessage: string | null = null;
  warnings: Warning[] = [];

  navigationSteps: NavigationStep[] = [
    { id: 'rooming', label: 'Rooming', icon: 'fa-door-open', completed: false, hasWarning: false },
    { id: 'vitals', label: 'Vitals', icon: 'fa-heartbeat', completed: false, hasWarning: false },
    { id: 'meds', label: 'Medications', icon: 'fa-pills', completed: false, hasWarning: false },
    { id: 'diagnoses', label: 'Diagnoses', icon: 'fa-stethoscope', completed: false, hasWarning: false },
    { id: 'orders', label: 'Orders', icon: 'fa-file-medical', completed: false, hasWarning: false },
    { id: 'notes', label: 'Notes', icon: 'fa-file-alt', completed: false, hasWarning: false },
    { id: 'checkout', label: 'Checkout', icon: 'fa-sign-out-alt', completed: false, hasWarning: false }
  ];

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.encounterId = params['encounterId'] ? +params['encounterId'] : undefined;
      if (this.encounterId) {
        this.loadEncounter();
      } else {
        this.errorMessage = 'Invalid encounter ID';
      }
    });
  }

  loadEncounter() {
    if (!this.encounterId) return;

    this.isLoading = true;
    this.errorMessage = null;

    this.encounterService.get(this.encounterId).subscribe({
      next: (encounter: Encounter) => {
        this.encounter = encounter;
        this.loadRelatedData();
      },
      error: (err) => {
        console.error('Error loading encounter:', err);
        this.errorMessage = 'Failed to load encounter';
        this.isLoading = false;
      }
    });
  }

  loadRelatedData() {
    if (!this.encounter) return;

    // Load patient
    if (this.encounter.patientId) {
      this.patientService.getById(this.encounter.patientId).subscribe({
        next: (patient) => {
          this.patient = patient;
          this.loadCoverageAndConsent();
          this.updateCompletionStatus();
          this.checkWarnings();
        },
        error: (err) => console.error('Error loading patient:', err)
      });
    }

    // Load provider
    if (this.encounter.primaryProviderId) {
      this.doctorService.getById(String(this.encounter.primaryProviderId)).subscribe({
        next: (doctor) => {
          this.provider = doctor;
        },
        error: (err) => console.error('Error loading provider:', err)
      });
    }

    // Load department
    if (this.encounter.departmentId) {
      this.departmentService.getById(this.encounter.departmentId).subscribe({
        next: (dept) => {
          this.department = dept;
        },
        error: (err) => console.error('Error loading department:', err)
      });
    }

    // Load rooming
    if (this.encounterId) {
      this.roomingService.getByEncounterId(this.encounterId).subscribe({
        next: (rooming) => {
          this.rooming = rooming;
          this.updateCompletionStatus();
          this.checkWarnings();
        },
        error: () => {
          this.rooming = null;
          this.updateCompletionStatus();
          this.checkWarnings();
        }
      });
    }

    // Load provider encounter
    if (this.encounterId) {
      this.providerEncounterService.getByEncounterId(this.encounterId).subscribe({
        next: (pe) => {
          this.providerEncounter = pe;
          this.updateCompletionStatus();
          this.checkWarnings();
        },
        error: () => {
          this.providerEncounter = null;
          this.updateCompletionStatus();
          this.checkWarnings();
        }
      });
    }

    // Load checkout
    if (this.encounterId) {
      this.checkoutService.getByEncounterId(this.encounterId).subscribe({
        next: (checkout) => {
          this.checkout = checkout;
          this.updateCompletionStatus();
        },
        error: () => {
          this.checkout = null;
          this.updateCompletionStatus();
        }
      });
    }

    this.isLoading = false;
    this.updateCompletionStatus();
    this.checkWarnings();
  }

  updateCompletionStatus() {
    // Rooming
    const roomingStep = this.navigationSteps.find(s => s.id === 'rooming');
    if (roomingStep) {
      roomingStep.completed = !!this.rooming?.isComplete || !!this.rooming?.roomedDateTime;
    }

    // Vitals
    const vitalsStep = this.navigationSteps.find(s => s.id === 'vitals');
    if (vitalsStep && this.rooming) {
      vitalsStep.completed = !!(this.rooming.bloodPressureSystolic && this.rooming.temperatureF && this.rooming.pulse);
    }

    // Medications
    const medsStep = this.navigationSteps.find(s => s.id === 'meds');
    if (medsStep && this.rooming) {
      medsStep.completed = !!(this.rooming.medicationsReviewed && this.rooming.allergiesReviewed);
    }

    // Diagnoses
    const diagnosesStep = this.navigationSteps.find(s => s.id === 'diagnoses');
    if (diagnosesStep && this.providerEncounter) {
      diagnosesStep.completed = !!this.providerEncounter.primaryDiagnosis || !!this.providerEncounter.diagnosisCodes;
    }

    // Orders
    const ordersStep = this.navigationSteps.find(s => s.id === 'orders');
    if (ordersStep && this.providerEncounter) {
      ordersStep.completed = !!this.providerEncounter.ordersPlaced;
    }

    // Notes
    const notesStep = this.navigationSteps.find(s => s.id === 'notes');
    if (notesStep && this.providerEncounter) {
      notesStep.completed = !!(this.providerEncounter.subjective || this.providerEncounter.objective || 
                               this.providerEncounter.assessmentSoap || this.providerEncounter.planSoap);
    }

    // Checkout
    const checkoutStep = this.navigationSteps.find(s => s.id === 'checkout');
    if (checkoutStep) {
      checkoutStep.completed = !!this.checkout?.isComplete || !!this.checkout?.checkoutDateTime;
    }
  }

  checkWarnings() {
    this.warnings = [];
    const stepWarnings: { [key: string]: boolean } = {};

    // Check for missing vitals
    if (!this.rooming || !this.rooming.bloodPressureSystolic || !this.rooming.temperatureF || !this.rooming.pulse) {
      this.warnings.push({
        type: 'warning',
        message: 'Vitals not recorded',
        section: 'vitals'
      });
      stepWarnings['vitals'] = true;
    }

    // Check for allergies not reviewed
    if (this.rooming && !this.rooming.allergiesReviewed) {
      this.warnings.push({
        type: 'warning',
        message: 'Allergies not reviewed',
        section: 'meds'
      });
      stepWarnings['meds'] = true;
    }

    // Check for medications not reviewed
    if (this.rooming && !this.rooming.medicationsReviewed) {
      this.warnings.push({
        type: 'warning',
        message: 'Medications not reviewed',
        section: 'meds'
      });
      stepWarnings['meds'] = true;
    }

    // Check for missing diagnoses
    if (!this.providerEncounter || (!this.providerEncounter.primaryDiagnosis && !this.providerEncounter.diagnosisCodes)) {
      this.warnings.push({
        type: 'info',
        message: 'Diagnoses not documented',
        section: 'diagnoses'
      });
      stepWarnings['diagnoses'] = true;
    }

    // Check for missing notes
    if (!this.providerEncounter || (!this.providerEncounter.subjective && !this.providerEncounter.objective)) {
      this.warnings.push({
        type: 'info',
        message: 'Clinical notes incomplete',
        section: 'notes'
      });
      stepWarnings['notes'] = true;
    }

    // Update step warnings
    this.navigationSteps.forEach(step => {
      step.hasWarning = stepWarnings[step.id] || false;
    });
  }

  setActiveStep(step: StepType) {
    this.activeStep = step;
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateOnly(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'ARRIVED':
        return 'status-arrived';
      case 'ROOMING':
        return 'status-rooming';
      case 'IN_PROGRESS':
        return 'status-in-progress';
      case 'COMPLETED':
        return 'status-completed';
      default:
        return 'status-unknown';
    }
  }

  getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'ARRIVED':
        return 'Arrived';
      case 'ROOMING':
        return 'Rooming';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status || 'Unknown';
    }
  }

  goBack() {
    this.router.navigate(['/ambulatory/clinical-encounters']);
  }

  navigateToSection(section: StepType) {
    this.setActiveStep(section);
    // Scroll to top of content area
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
      contentArea.scrollTop = 0;
    }
  }

  loadCoverageAndConsent() {
    if (!this.patient?.id) return;

    // Load coverage
    this.coverageService.getByPatientId(this.patient.id).subscribe({
      next: (coverage) => {
        this.coverage = coverage;
        this.checkRegistrationCompleteness();
      },
      error: () => {
        this.coverage = null;
        this.checkRegistrationCompleteness();
      }
    });

    // Load consent
    this.coverageService.getConsent(this.patient.id).subscribe({
      next: (consent) => {
        this.consent = consent;
        this.checkRegistrationCompleteness();
      },
      error: () => {
        this.consent = null;
        this.checkRegistrationCompleteness();
      }
    });
  }

  checkRegistrationCompleteness() {
    if (!this.patient) return;

    this.registrationCompleteness = this.completenessService.checkCompleteness(
      this.patient,
      this.coverage,
      this.consent
    );
  }

  onUpdateRequested() {
    this.showUpdateDrawer = true;
  }

  onDrawerClose() {
    this.showUpdateDrawer = false;
  }

  onPatientSaved(updatedPatient: Patient) {
    this.patient = updatedPatient;
    this.loadCoverageAndConsent();
    this.onDrawerClose();
  }

  canEditPatient(): boolean {
    return this.roleService.canEditPatient();
  }

  hasBlockers(): boolean {
    return (this.registrationCompleteness?.blockers.length ?? 0) > 0;
  }

  getVisibleMissingFields(): any[] {
    if (!this.registrationCompleteness) return [];
    return this.showAllMissing 
      ? this.registrationCompleteness.missing 
      : this.registrationCompleteness.missing.slice(0, 6);
  }

  toggleShowAll() {
    this.showAllMissing = !this.showAllMissing;
  }

  getActionButtonLabel(): string {
    if (this.hasBlockers()) {
      return 'Fix Now';
    }
    return 'Review';
  }

  getBlockersTooltip(): string {
    if (!this.registrationCompleteness || !this.registrationCompleteness.blockers.length) {
      return '';
    }
    return 'Complete registration: ' + this.registrationCompleteness.blockers.map(b => b.label).join(', ');
  }
}
