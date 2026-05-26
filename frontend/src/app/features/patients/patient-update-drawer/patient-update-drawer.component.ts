import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PatientService } from '../../../core/services/patient.service';
import { CoverageService } from '../../../core/services/coverage.service';
import { RoleService } from '../../../core/services/role.service';
import { Patient } from '../../../core/models/patient.model';
import { Coverage } from '../../../core/models/coverage.model';
import { US_STATES, US_CITIES_BY_STATE, getCitiesForState, getZipCodesForCity } from '../../../core/constants/us-locations.constants';

type TabType = 'demographics' | 'contact' | 'address' | 'coverage' | 'guarantor' | 'alerts';

@Component({
  selector: 'app-patient-update-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-update-drawer.component.html',
  styleUrls: ['./patient-update-drawer.component.scss']
})
export class PatientUpdateDrawerComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Input() patient!: Patient;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private patientService = inject(PatientService);
  private coverageService = inject(CoverageService);
  private roleService = inject(RoleService);
  private fb = inject(FormBuilder);

  activeTab: TabType = 'demographics';
  patientForm!: FormGroup;
  coverageForm!: FormGroup;
  guarantorForm!: FormGroup;
  alertsForm!: FormGroup;
  coverages: Coverage[] = [];
  canEditBilling = false;
  
  // Location dropdowns
  states = US_STATES;
  cities: string[] = [];
  zipCodes: string[] = [];
  guarantorCities: string[] = [];
  guarantorZipCodes: string[] = [];

  tabs: { id: TabType; label: string }[] = [
    { id: 'demographics', label: 'Demographics' },
    { id: 'contact', label: 'Contact' },
    { id: 'address', label: 'Address' },
    { id: 'coverage', label: 'Coverage' },
    { id: 'guarantor', label: 'Guarantor' },
    { id: 'alerts', label: 'Alerts' }
  ];

  ngOnInit() {
    if (!this.patient) {
      console.error('PatientUpdateDrawerComponent: patient input is required');
      return;
    }
    this.checkPermissions();
    this.loadCoverages();
    this.initForms();
  }

  checkPermissions() {
    const role = this.roleService.getCurrentRole();
    this.canEditBilling = role === 'ADMIN';
  }

  initForms() {
    // Demographics Form
    this.patientForm = this.fb.group({
      firstName: [this.patient.firstName, [Validators.required]],
      lastName: [this.patient.lastName, [Validators.required]],
      preferredName: [this.patient.firstName], // Assuming preferred name same as first name
      dateOfBirth: [this.patient.dateOfBirth, [Validators.required]],
      sex: [this.patient.sex || this.patient.gender?.toUpperCase() || 'MALE'],
      genderIdentity: [this.patient.gender || 'Male'],
      ssn: [''], // Optional
      language: ['English']
    });

    // Contact Form
    this.patientForm.addControl('phoneNumber', this.fb.control(this.patient.phoneNumber || '', [Validators.required]));
    this.patientForm.addControl('emailAddress', this.fb.control(this.patient.emailAddress || '', [Validators.email]));

    // Address Form
    this.patientForm.addControl('addressLine1', this.fb.control(this.patient.addressLine1 || '', [Validators.required]));
    this.patientForm.addControl('addressLine2', this.fb.control(this.patient.addressLine2 || ''));
    this.patientForm.addControl('city', this.fb.control(this.patient.city || '', [Validators.required]));
    this.patientForm.addControl('state', this.fb.control(this.patient.state || '', [Validators.required]));
    this.patientForm.addControl('zipCode', this.fb.control(this.patient.zipCode || this.patient.pincode || '', [Validators.required]));
    
    // Initialize cities and zip codes based on current state and city
    if (this.patient.state) {
      this.cities = getCitiesForState(this.patient.state);
      if (this.patient.city) {
        this.zipCodes = getZipCodesForCity(this.patient.state, this.patient.city);
      }
    }
    
    // Watch for state changes to update cities
    this.patientForm.get('state')?.valueChanges.subscribe(state => {
      this.cities = getCitiesForState(state || '');
      this.zipCodes = []; // Clear zip codes when state changes
      // Reset city and zip if state changes
      const currentCity = this.patientForm.get('city')?.value;
      if (currentCity && !this.cities.includes(currentCity)) {
        this.patientForm.get('city')?.setValue('');
      }
      this.patientForm.get('zipCode')?.setValue('');
    });
    
    // Watch for city changes to update zip codes
    this.patientForm.get('city')?.valueChanges.subscribe(city => {
      const state = this.patientForm.get('state')?.value;
      if (state && city) {
        this.zipCodes = getZipCodesForCity(state, city);
      } else {
        this.zipCodes = [];
      }
      // Reset zip code if city changes
      const currentZip = this.patientForm.get('zipCode')?.value;
      if (currentZip && !this.zipCodes.includes(currentZip)) {
        this.patientForm.get('zipCode')?.setValue('');
      }
    });

    // Coverage Form
    this.coverageForm = this.fb.group({
      payer: ['', [Validators.required]],
      memberId: ['', [Validators.required]],
      groupNumber: [''],
      startDate: [''],
      endDate: [''],
      eligibilityStatus: ['ACTIVE', [Validators.required]]
    });

    // Guarantor Form
    this.guarantorForm = this.fb.group({
      relationship: ['Self'],
      firstName: [this.patient.firstName],
      lastName: [this.patient.lastName],
      dateOfBirth: [this.patient.dateOfBirth],
      addressLine1: [this.patient.addressLine1],
      addressLine2: [this.patient.addressLine2],
      city: [this.patient.city],
      state: [this.patient.state],
      zipCode: [this.patient.zipCode || this.patient.pincode],
      homePhone: [this.patient.phoneNumber],
      workPhone: [''],
      mobilePhone: [this.patient.phoneNumber]
    });
    
    // Initialize guarantor cities and zip codes based on current state and city
    if (this.patient.state) {
      this.guarantorCities = getCitiesForState(this.patient.state);
      if (this.patient.city) {
        this.guarantorZipCodes = getZipCodesForCity(this.patient.state, this.patient.city);
      }
    }
    
    // Watch for guarantor state changes to update cities
    this.guarantorForm.get('state')?.valueChanges.subscribe(state => {
      this.guarantorCities = getCitiesForState(state || '');
      this.guarantorZipCodes = []; // Clear zip codes when state changes
      // Reset city and zip if state changes
      const currentCity = this.guarantorForm.get('city')?.value;
      if (currentCity && !this.guarantorCities.includes(currentCity)) {
        this.guarantorForm.get('city')?.setValue('');
      }
      this.guarantorForm.get('zipCode')?.setValue('');
    });
    
    // Watch for guarantor city changes to update zip codes
    this.guarantorForm.get('city')?.valueChanges.subscribe(city => {
      const state = this.guarantorForm.get('state')?.value;
      if (state && city) {
        this.guarantorZipCodes = getZipCodesForCity(state, city);
      } else {
        this.guarantorZipCodes = [];
      }
      // Reset zip code if city changes
      const currentZip = this.guarantorForm.get('zipCode')?.value;
      if (currentZip && !this.guarantorZipCodes.includes(currentZip)) {
        this.guarantorForm.get('zipCode')?.setValue('');
      }
    });

    // Alerts Form (mock)
    this.alertsForm = this.fb.group({
      allergies: [this.patient.allergies || ''],
      flags: ['']
    });
  }

  loadCoverages() {
    const patientId = this.patient.id || this.patient.patientId || 0;
    this.coverageService.getCoverages(patientId)
      .subscribe(coverages => {
        this.coverages = coverages;
      });
  }

  setTab(tab: TabType) {
    this.activeTab = tab;
  }

  save() {
    // Validate required fields: legalName (firstName/lastName), DOB, phone, address1/city/state/zip
    const requiredFields = [
      { control: 'firstName', label: 'Legal First Name' },
      { control: 'lastName', label: 'Legal Last Name' },
      { control: 'dateOfBirth', label: 'Date of Birth' },
      { control: 'phoneNumber', label: 'Phone Number' },
      { control: 'addressLine1', label: 'Address Line 1' },
      { control: 'city', label: 'City' },
      { control: 'state', label: 'State' },
      { control: 'zipCode', label: 'Zip Code' }
    ];

    let hasErrors = false;
    requiredFields.forEach(field => {
      const control = this.patientForm.get(field.control);
      if (control && (control.invalid || !control.value)) {
        control.markAsTouched();
        hasErrors = true;
      }
    });

    if (hasErrors || this.patientForm.invalid) {
      // Scroll to first error
      const firstError = requiredFields.find(f => {
        const control = this.patientForm.get(f.control);
        return control && (control.invalid || !control.value);
      });
      if (firstError) {
        const element = document.getElementById(firstError.control);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    const formValue = this.patientForm.value;
    const updateData: Partial<Patient> = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      dateOfBirth: formValue.dateOfBirth,
      sex: formValue.sex,
      gender: formValue.genderIdentity,
      phoneNumber: formValue.phoneNumber,
      emailAddress: formValue.emailAddress,
      email: formValue.emailAddress, // Backend field
      addressLine1: formValue.addressLine1,
      addressLine2: formValue.addressLine2,
      city: formValue.city,
      state: formValue.state,
      zipCode: formValue.zipCode,
      pincode: formValue.zipCode, // Frontend field
      address: formValue.addressLine1, // Backend field
      allergies: this.alertsForm.get('allergies')?.value
    };

    const patientId = this.patient.id || this.patient.patientId || 0;
    this.patientService.updatePatient(patientId, updateData).subscribe({
      next: () => {
        this.saved.emit();
        this.closeDrawer();
      },
      error: (err) => {
        console.error('Failed to update patient:', err);
        alert('Failed to update patient. Please try again.');
      }
    });
  }

  saveCoverage() {
    if (this.coverageForm.valid) {
      const formValue = this.coverageForm.value;
      const patientId = this.patient.id || this.patient.patientId || 0;
      
      this.coverageService.upsertCoverage(patientId, formValue).subscribe({
        next: () => {
          this.loadCoverages();
          this.coverageForm.reset();
          this.coverageForm.patchValue({ eligibilityStatus: 'ACTIVE' });
        },
        error: (err) => {
          console.error('Failed to save coverage:', err);
          alert('Failed to save coverage. Please try again.');
        }
      });
    }
  }

  deleteCoverage(coverage: Coverage) {
    if (confirm('Are you sure you want to delete this coverage?')) {
      if (coverage.id) {
        this.coverageService.deleteCoverage(coverage.id).subscribe({
          next: () => {
            this.loadCoverages();
          },
          error: (err) => {
            console.error('Failed to delete coverage:', err);
            alert('Failed to delete coverage. Please try again.');
          }
        });
      }
    }
  }

  closeDrawer() {
    this.close.emit();
  }

  onBackdropClick() {
    this.closeDrawer();
  }

  onDrawerClick(event: Event) {
    event.stopPropagation();
  }
}

