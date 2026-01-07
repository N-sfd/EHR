import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Patient } from '../../../core/models/patient.model';
import { Coverage, PatientConsent } from '../../../core/models/coverage.model';
import { PatientService } from '../../../core/services/patient.service';
import { CoverageService } from '../../../core/services/coverage.service';
import { RegistrationCompletenessService } from '../../../core/services/registration-completeness.service';
import { RoleService } from '../../../core/services/role.service';

@Component({
  selector: 'app-patient-update-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-update-drawer.component.html',
  styleUrls: ['./patient-update-drawer.component.scss']
})
export class PatientUpdateDrawerComponent implements OnInit {
  @Input() patient!: Patient;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Patient>();

  private fb = inject(FormBuilder);
  private patientService = inject(PatientService);
  private coverageService = inject(CoverageService);
  private completenessService = inject(RegistrationCompletenessService);
  private roleService = inject(RoleService);

  activeTab: 'demographics' | 'coverage' | 'consent' = 'demographics';
  demographicsForm!: FormGroup;
  coverageForm!: FormGroup;
  consentForm!: FormGroup;

  coverage: Coverage | null = null;
  consent: PatientConsent | null = null;
  isLoading = false;
  isSaving = false;
  errorMessage: string | null = null;

  canEdit = false;

  ngOnInit(): void {
    this.canEdit = this.roleService.canEditPatient();
    this.loadData();
  }

  loadData(): void {
    if (!this.patient?.id) return;

    this.isLoading = true;
    
    // Load coverage
    this.coverageService.getByPatientId(this.patient.id).subscribe({
      next: (coverage) => {
        this.coverage = coverage;
        this.initializeForms();
        this.isLoading = false;
      },
      error: () => {
        this.coverage = null;
        this.initializeForms();
        this.isLoading = false;
      }
    });

    // Load consent
    this.coverageService.getConsent(this.patient.id).subscribe({
      next: (consent) => {
        this.consent = consent;
        this.initializeForms();
      },
      error: () => {
        this.consent = null;
        this.initializeForms();
      }
    });
  }

  initializeForms(): void {
    // Demographics Form
    this.demographicsForm = this.fb.group({
      firstName: [this.patient?.firstName || '', Validators.required],
      lastName: [this.patient?.lastName || '', Validators.required],
      dateOfBirth: [this.patient?.dateOfBirth || '', Validators.required],
      sex: [this.patient?.sex || this.patient?.gender || '', Validators.required],
      phoneNumber: [this.patient?.phoneNumber || this.patient?.phone || '', Validators.required],
      addressLine1: [this.patient?.addressLine1 || this.patient?.address || '', Validators.required],
      addressLine2: [this.patient?.addressLine2 || ''],
      city: [this.patient?.city || '', Validators.required],
      state: [this.patient?.state || '', Validators.required],
      pincode: [this.patient?.pincode || this.patient?.zipCode || '', Validators.required],
      emailAddress: [this.patient?.emailAddress || this.patient?.email || '']
    });

    // Coverage Form
    this.coverageForm = this.fb.group({
      payer: [this.coverage?.payer || '', Validators.required],
      memberId: [this.coverage?.memberId || '', Validators.required],
      groupNumber: [this.coverage?.groupNumber || ''],
      eligibilityStatus: [this.coverage?.eligibilityStatus || 'ACTIVE', Validators.required],
      startDate: [this.coverage?.startDate || ''],
      endDate: [this.coverage?.endDate || '']
    });

    // Consent Form
    this.consentForm = this.fb.group({
      consentSigned: [this.consent?.consentSigned || false, Validators.requiredTrue],
      consentType: [this.consent?.consentType || 'General Treatment']
    });
  }

  onTabChange(tab: 'demographics' | 'coverage' | 'consent'): void {
    this.activeTab = tab;
  }

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    if (!this.patient?.id) return;

    this.isSaving = true;
    this.errorMessage = null;

    const savePromises: Promise<any>[] = [];

    // Save Demographics
    if (this.demographicsForm.valid) {
      const demographicsData = this.demographicsForm.value;
      const updatePromise = firstValueFrom(this.patientService.update(this.patient.id, demographicsData));
      savePromises.push(updatePromise);
    }

    // Save Coverage
    if (this.coverageForm.valid) {
      const coverageData = this.coverageForm.value;
      const coverageToSave: Coverage = {
        ...this.coverage,
        ...coverageData,
        patientId: this.patient.id,
        isPrimary: true
      };
      const coveragePromise = firstValueFrom(this.coverageService.save(this.patient.id, coverageToSave));
      savePromises.push(coveragePromise);
    }

    // Save Consent
    if (this.consentForm.valid) {
      const consentData = this.consentForm.value;
      const consentToSave: PatientConsent = {
        ...this.consent,
        ...consentData,
        patientId: this.patient.id,
        consentDate: consentData.consentSigned ? new Date().toISOString() : undefined
      };
      const consentPromise = firstValueFrom(this.coverageService.saveConsent(this.patient.id, consentToSave));
      savePromises.push(consentPromise);
    }

    Promise.all(savePromises)
      .then(() => {
        // Reload patient data
        this.patientService.getById(this.patient.id!).subscribe({
          next: (updatedPatient) => {
            this.saved.emit(updatedPatient);
            this.isSaving = false;
            this.onClose();
          },
          error: (err) => {
            console.error('Error reloading patient:', err);
            this.isSaving = false;
            this.saved.emit(this.patient); // Emit anyway
            this.onClose();
          }
        });
      })
      .catch((err) => {
        console.error('Error saving patient data:', err);
        this.errorMessage = 'Failed to save. Please try again.';
        this.isSaving = false;
      });
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}

