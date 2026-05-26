import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Patient } from '../../../core/models/patient.model';
import { Coverage, PatientConsent } from '../../../core/models/coverage.model';
import { PatientService } from '../../../core/services/patient.service';
import { CoverageService } from '../../../core/services/coverage.service';
import { RegistrationCompletenessService } from '../../../core/services/registration-completeness.service';
import { RoleService } from '../../../core/services/role.service';
import { US_STATES, getCitiesForState, getZipCodesForCity } from '../../../core/constants/us-locations.constants';
import { friendlyHttpError } from '../../../core/utils/http-error.util';

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

  // Location dropdowns
  states = US_STATES;
  cities: string[] = [];
  zipCodes: string[] = [];

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
    // Normalize dateOfBirth to ISO format for HTML date input (expects yyyy-MM-dd)
    const normalizedDob = this.patient?.dateOfBirth 
      ? this.toIsoDate(this.patient.dateOfBirth) || this.patient.dateOfBirth
      : '';

    // Demographics Form
    this.demographicsForm = this.fb.group({
      firstName: [this.patient?.firstName || '', Validators.required],
      lastName: [this.patient?.lastName || '', Validators.required],
      dateOfBirth: [normalizedDob, Validators.required], // ✅ Normalized to ISO format
      sex: [this.patient?.sex || this.patient?.gender || '', Validators.required],
      phoneNumber: [this.patient?.phoneNumber || this.patient?.phone || '', Validators.required],
      addressLine1: [this.patient?.addressLine1 || this.patient?.address || '', Validators.required],
      addressLine2: [this.patient?.addressLine2 || ''],
      city: [this.patient?.city || '', Validators.required],
      state: [this.patient?.state || '', Validators.required],
      pincode: [this.patient?.pincode || this.patient?.zipCode || '', Validators.required],
      emailAddress: [this.patient?.emailAddress || this.patient?.email || '']
    });

    // Initialize cities and zip codes based on patient state and city
    if (this.patient?.state) {
      this.cities = getCitiesForState(this.patient.state);
      if (this.patient?.city) {
        this.zipCodes = getZipCodesForCity(this.patient.state, this.patient.city);
      }
    }

    // Watch for state changes to update cities
    this.demographicsForm.get('state')?.valueChanges.subscribe(state => {
      this.cities = getCitiesForState(state || '');
      this.zipCodes = []; // Clear zip codes when state changes
      // Reset city and zip if state changes
      const currentCity = this.demographicsForm.get('city')?.value;
      if (currentCity && !this.cities.includes(currentCity)) {
        this.demographicsForm.get('city')?.setValue('');
      }
      this.demographicsForm.get('pincode')?.setValue('');
    });

    // Watch for city changes to update zip codes
    this.demographicsForm.get('city')?.valueChanges.subscribe(city => {
      const state = this.demographicsForm.get('state')?.value;
      if (state && city) {
        this.zipCodes = getZipCodesForCity(state, city);
      } else {
        this.zipCodes = [];
      }
      // Reset zip code if city changes
      const currentZip = this.demographicsForm.get('pincode')?.value;
      if (currentZip && !this.zipCodes.includes(currentZip)) {
        this.demographicsForm.get('pincode')?.setValue('');
      }
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

  private toIsoDate(d: any): string | null {
    if (!d) return null;

    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;

    if (typeof d === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
      const [mm, dd, yyyy] = d.split('/');
      return `${yyyy}-${mm}-${dd}`;
    }

    const t = Date.parse(d);
    if (Number.isNaN(t)) return null;
    return new Date(t).toISOString().slice(0, 10);
  }

  private normalizeGender(g?: string | null): string | null {
    if (!g) return null;
    const v = g.toLowerCase();
    if (v === 'male') return 'MALE';
    if (v === 'female') return 'FEMALE';
    return g.toUpperCase();
  }

  private buildPatientUpdatePayload(formData: any): any {
    const patientData: Partial<Patient> = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.sex || formData.gender,
      phoneNumber: formData.phoneNumber,
      emailAddress: formData.emailAddress || formData.email,
      addressLine1: formData.addressLine1 || formData.address,
      addressLine2: formData.addressLine2,
      city: formData.city,
      state: formData.state,
      zipCode: formData.pincode || formData.zipCode,
      photoUrl: this.patient?.photoUrl,
      status: this.patient?.status || 'ACTIVE'
    };

    return this.buildUpdatePayload(patientData);
  }

  private buildUpdatePayload(p: Partial<Patient>): any {
    const anyP = p as any;
    const payload = {
      firstName: p.firstName?.trim() ?? null,
      lastName: p.lastName?.trim() ?? null,
      dateOfBirth: this.toIsoDate(p.dateOfBirth),
      gender: this.normalizeGender(p.gender),
      phoneNumber: p.phoneNumber ?? null,
      email: (anyP.emailAddress ?? anyP.email ?? null)?.trim?.() ?? null,
      addressLine1: anyP.addressLine1?.trim() ?? null,
      addressLine2: anyP.addressLine2?.trim() ?? null,
      city: anyP.city?.trim() ?? null,
      state: anyP.state ?? null,
      zipCode: anyP.zipCode ?? null,
      photoUrl: anyP.photoUrl ?? undefined,
      status: p.status ?? 'ACTIVE'
    };

    console.debug('[PatientUpdateDrawer] Payload:', payload);
    return payload;
  }

  /**
   * Extracts user-friendly error message from HttpErrorResponse
   * Tries multiple sources: err.error.message, err.error.error, string body, then fallback
   */
  private extractErrorMessage(err: any): string {
    if (err instanceof HttpErrorResponse) {
      // Log full error details for debugging
      console.error('[PatientUpdateDrawer] HTTP Error Response:', {
        status: err.status,
        statusText: err.statusText,
        url: err.url,
        error: err.error,
        headers: err.headers
      });

      // Try multiple sources for backend error message
      let backendMessage: string | null = null;

      // 1. Try err.error.message (most common format)
      if (err.error?.message) {
        backendMessage = String(err.error.message).trim();
      }
      // 2. Try err.error.error (alternative format)
      else if (err.error?.error) {
        backendMessage = String(err.error.error).trim();
      }
      // 3. Try err.error directly if it's a string
      else if (typeof err.error === 'string' && err.error.trim()) {
        backendMessage = err.error.trim();
      }
      // 4. Try err.error.detail (Spring Boot validation errors)
      else if (err.error?.detail) {
        backendMessage = String(err.error.detail).trim();
      }
      // 5. Try err.error.title (RFC 7807 Problem Details)
      else if (err.error?.title) {
        backendMessage = String(err.error.title).trim();
      }
      // 6. Try nested error objects
      else if (err.error && typeof err.error === 'object') {
        // Try to find any string property that might contain the error
        const errorObj = err.error;
        for (const key in errorObj) {
          if (typeof errorObj[key] === 'string' && errorObj[key].trim()) {
            backendMessage = errorObj[key].trim();
            break;
          }
        }
      }

      // If we found a backend message, return it
      if (backendMessage && backendMessage.length > 0) {
        console.debug('[PatientUpdateDrawer] Extracted backend error message:', backendMessage);
        return backendMessage;
      }

      // Fallback to status-based messages with more detail
      if (err.status === 0) {
        return 'Unable to connect to server. Please check your connection and try again.';
      }
      if (err.status === 400) {
        return 'Invalid data submitted. Please check all fields and try again.';
      }
      if (err.status === 401) {
        return 'Your session has expired. Please sign in again.';
      }
      if (err.status === 403) {
        return 'You do not have permission to perform this action.';
      }
      if (err.status === 404) {
        return 'Patient not found. The record may have been deleted.';
      }
      if (err.status === 409) {
        return 'Conflict: This record has been modified by another user. Please refresh and try again.';
      }
      if (err.status === 422) {
        return 'Validation failed. Please check all required fields are filled correctly.';
      }
      if (err.status >= 500) {
        return `Server error (${err.status}). Please try again or contact support if the problem persists.`;
      }
      if (err.statusText) {
        return `Request failed: ${err.statusText} (${err.status})`;
      }
    }

    // Handle non-HTTP errors
    if (err?.message) {
      return String(err.message);
    }

    // Final fallback using friendly error utility
    return friendlyHttpError(err);
  }

  onSave(): void {
    if (!this.patient?.id) return;

    this.isSaving = true;
    this.errorMessage = null;

    const savePromises: Promise<any>[] = [];

    // Save Demographics
    if (this.demographicsForm.valid) {
      const demographicsData = this.demographicsForm.value;
      // Build clean payload with normalized dates and enums
      const updateData = this.buildPatientUpdatePayload(demographicsData);
      
      console.debug('[PatientUpdateDrawer] Calling PatientService.update() with clean payload');
      const updatePromise = firstValueFrom(this.patientService.update(this.patient.id, updateData));
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
        // Reload patient data from backend to get latest state
        this.patientService.getById(this.patient.id!).subscribe({
          next: (updatedPatient) => {
            console.debug('[PatientUpdateDrawer] Patient reloaded successfully, emitting saved event');
            this.isSaving = false;
            // Emit saved event - parent component will handle refresh and close drawer
            this.saved.emit(updatedPatient);
            // Note: Don't close drawer here - let parent component close after refresh
          },
          error: (err) => {
            console.error('[PatientUpdateDrawer] Error reloading patient:', err);
            this.isSaving = false;
            // Emit saved event with current patient data as fallback
            this.saved.emit(this.patient);
            // Show specific error message from backend
            const errorMsg = this.extractErrorMessage(err);
            this.errorMessage = errorMsg || 'Patient saved but failed to refresh. Changes may not be visible until page refresh.';
          }
        });
      })
      .catch((err) => {
        console.error('Error saving patient data:', err);
        // Preserve HttpErrorResponse details for debugging
        if (err instanceof HttpErrorResponse) {
          console.error('HTTP Error Details:', {
            status: err.status,
            statusText: err.statusText,
            url: err.url,
            error: err.error,
            headers: err.headers
          });
        }
        // Extract user-friendly error message (prioritizes backend message)
        this.errorMessage = this.extractErrorMessage(err);
        this.isSaving = false;
      });
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getCurrentForm(): FormGroup | null {
    switch (this.activeTab) {
      case 'demographics': return this.demographicsForm;
      case 'coverage': return this.coverageForm;
      case 'consent': return this.consentForm;
      default: return null;
    }
  }

  getInvalidFieldsCount(): number {
    const form = this.getCurrentForm();
    if (!form) return 0;
    return Object.keys(form.controls).filter(key => {
      const control = form.get(key);
      return control && control.invalid && (control.dirty || control.touched);
    }).length;
  }

  getValidationSummary(): string {
    const count = this.getInvalidFieldsCount();
    if (count === 0) return '';
    return `${count} field${count > 1 ? 's' : ''} need${count === 1 ? 's' : ''} attention`;
  }

  /**
   * Save used to require only the *active* tab to be valid, so on Consent (unchecked) or Coverage
   * (payer empty) the button stayed disabled and Demographics fixes could never be persisted.
   * If Demographics is valid, allow Save from Consent/Coverage tabs so those updates can post.
   */
  isFormValid(): boolean {
    const current = this.getCurrentForm();
    if (current?.valid) {
      return true;
    }
    if (
      (this.activeTab === 'consent' || this.activeTab === 'coverage') &&
      !!this.demographicsForm?.valid
    ) {
      return true;
    }
    return false;
  }

  onPhotoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.match('image.*')) {
        this.errorMessage = 'Please select a valid image file';
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size should be less than 5MB';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (this.patient) {
          this.patient.photoUrl = e.target.result;
        }
        this.errorMessage = null;
      };
      reader.onerror = () => {
        this.errorMessage = 'Failed to read image file';
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(): void {
    if (this.patient) {
      this.patient.photoUrl = undefined;
    }
  }
}

