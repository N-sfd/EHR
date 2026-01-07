import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientContextService } from '../../../../core/services/patient-context.service';
import { PreludeMockService } from '../../services/prelude-mock.service';
import { SectionHeaderComponent } from '../../../../shared/components/section-header/section-header.component';
import { AlertBannerComponent } from '../../../../shared/components/alert-banner/alert-banner.component';
import { FieldComponent } from '../../../../shared/components/field/field.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { Patient } from '../../../../core/models/patient.model';
import { Observable } from 'rxjs';
import { CanComponentDeactivate } from '../../../../core/guards/unsaved-changes.guard';

@Component({
  selector: 'app-demographics',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SectionHeaderComponent, AlertBannerComponent, FieldComponent, CardComponent],
  templateUrl: './demographics.component.html',
  styleUrls: ['./demographics.component.scss']
})
export class DemographicsComponent implements OnInit, CanComponentDeactivate {
  private fb = inject(FormBuilder);
  private patientContext = inject(PatientContextService);
  private preludeService = inject(PreludeMockService);

  demographicsForm!: FormGroup;
  patient$: Observable<Patient | null> = this.patientContext.patient$;
  patient: Patient | null = null;
  isLoading = false;
  isSaving = false;
  hasUnsavedChanges = false;
  showDiscardConfirm = false;
  pendingNavigation?: string;

  // Section collapse states
  identityCollapsed = false;
  birthCollapsed = false;
  genderCollapsed = false;
  contactCollapsed = false;

  // Validation warnings
  eligibilityWarning = false;
  requiredFieldsWarning = false;

  ngOnInit() {
    this.patient$.subscribe(patient => {
      this.patient = patient;
      if (patient) {
        this.initializeForm(patient);
        this.checkWarnings(patient);
      }
    });
  }

  initializeForm(patient: Patient) {
    this.demographicsForm = this.fb.group({
      // Identity
      legalName: [patient.firstName + ' ' + patient.lastName, [Validators.required]],
      preferredName: [patient.firstName || ''],
      
      // Birth
      dateOfBirth: [patient.dateOfBirth || '', [Validators.required]],
      birthSex: [patient.sex || '', [Validators.required]],
      
      // Gender
      genderIdentity: [''],
      
      // Contact
      phone: [patient.phone || '', [Validators.required, Validators.pattern(/^[\d\s\-\(\)]+$/)]],
      email: [patient.email || '', [Validators.email]],
      address1: [patient.addressLine1 || ''],
      address2: [patient.addressLine2 || ''],
      city: [patient.city || ''],
      state: [patient.state || ''],
      zip: [patient.zipCode || '', [Validators.pattern(/^\d{5}(-\d{4})?$/)]]
    });

    // Track form changes
    this.demographicsForm.valueChanges.subscribe(() => {
      this.hasUnsavedChanges = this.demographicsForm.dirty;
      this.checkRequiredFields();
    });
  }

  checkWarnings(patient: Patient) {
    // Check eligibility (would come from insurance service)
    if (patient.mrn) {
      this.preludeService.getCoverage(patient.mrn).subscribe(coverage => {
        const primary = coverage.find(c => c.insuranceType === 'Primary');
        this.eligibilityWarning = primary?.isActive === false;
      });
    }
  }

  checkRequiredFields() {
    const requiredFields = ['legalName', 'dateOfBirth', 'birthSex', 'phone'];
    const hasMissing = requiredFields.some(field => {
      const control = this.demographicsForm.get(field);
      return control && control.invalid && (control.dirty || control.touched);
    });
    this.requiredFieldsWarning = hasMissing;
  }

  canDeactivate(): boolean {
    if (this.hasUnsavedChanges) {
      return confirm('You have unsaved changes. Are you sure you want to discard them?');
    }
    return true;
  }

  save() {
    if (this.demographicsForm.invalid) {
      this.demographicsForm.markAllAsTouched();
      this.checkRequiredFields();
      return;
    }

    this.isSaving = true;
    const formValue = this.demographicsForm.value;
    
    // Parse legal name
    const nameParts = formValue.legalName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const updates: Partial<Patient> = {
      firstName,
      lastName,
      dateOfBirth: formValue.dateOfBirth,
      sex: formValue.birthSex,
      phone: formValue.phone,
      email: formValue.email,
      addressLine1: formValue.address1,
      addressLine2: formValue.address2,
      city: formValue.city,
      state: formValue.state,
      zipCode: formValue.zip
    };

    if (this.patient && this.patient.mrn) {
      this.preludeService.updatePatient(this.patient.mrn, updates).subscribe({
        next: (updated) => {
          this.patientContext.setPatient(updated);
          this.hasUnsavedChanges = false;
          this.demographicsForm.markAsPristine();
          this.isSaving = false;
          alert('Demographics saved successfully');
        },
        error: () => {
          this.isSaving = false;
          alert('Failed to save demographics');
        }
      });
    }
  }

  cancel() {
    if (this.hasUnsavedChanges) {
      if (confirm('Discard unsaved changes?')) {
        this.resetForm();
      }
    } else {
      this.resetForm();
    }
  }

  resetForm() {
    if (this.patient) {
      this.initializeForm(this.patient);
      this.hasUnsavedChanges = false;
    }
  }
}

