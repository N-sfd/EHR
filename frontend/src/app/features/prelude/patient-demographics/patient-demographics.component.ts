import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/patient.model';

interface ValidationWarning {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

@Component({
  selector: 'app-patient-demographics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-demographics.component.html',
  styleUrls: ['./patient-demographics.component.css']
})
export class PatientDemographicsComponent implements OnInit {
  @Input() patientId?: number;

  private route = inject(ActivatedRoute);
  router = inject(Router);
  private patientService = inject(PatientService);

  patient: Patient | null = null;
  demographics: any = {
    legalName: '',
    preferredName: '',
    dateOfBirth: '',
    birthSex: '',
    genderIdentity: '',
    phoneNumber: '',
    email: '',
    addressLine1: '',
    city: '',
    state: '',
    zipCode: '',
    preferredLanguage: '',
    interpreterNeeded: false,
    mrn: '',
    ssn: ''
  };

  validationWarnings: ValidationWarning[] = [];
  isLoading = false;
  isSaving = false;

  ngOnInit() {
    const id = this.patientId || this.route.snapshot.params['id'];
    if (id) {
      this.loadPatient(+id);
    }
  }

  loadPatient(id: number) {
    this.isLoading = true;
    this.patientService.getById(id).subscribe({
      next: (patient: Patient) => {
        this.patient = patient;
        this.mapPatientToDemographics(patient);
        this.validateForm();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading patient:', err);
        this.isLoading = false;
      }
    });
  }

  mapPatientToDemographics(patient: Patient) {
    this.demographics.legalName = `${patient.firstName} ${patient.lastName}`;
    this.demographics.preferredName = patient.firstName;
    this.demographics.dateOfBirth = patient.dateOfBirth || '';
    this.demographics.birthSex = patient.gender || '';
    this.demographics.phoneNumber = patient.phoneNumber || '';
    this.demographics.email = patient.emailAddress || '';
    this.demographics.addressLine1 = patient.addressLine1 || '';
    this.demographics.city = patient.city || '';
    this.demographics.state = patient.state || '';
    this.demographics.zipCode = patient.zipCode || '';
    this.demographics.mrn = patient.patientCode || '';
  }

  validateForm() {
    this.validationWarnings = [];

    // Required field validations
    if (!this.demographics.legalName) {
      this.validationWarnings.push({
        field: 'legalName',
        message: 'Legal name is required',
        severity: 'error'
      });
    }

    if (!this.demographics.dateOfBirth) {
      this.validationWarnings.push({
        field: 'dateOfBirth',
        message: 'Date of birth is required',
        severity: 'error'
      });
    }

    // Email validation
    if (this.demographics.email && !this.isValidEmail(this.demographics.email)) {
      this.validationWarnings.push({
        field: 'email',
        message: 'Invalid email format',
        severity: 'warning'
      });
    }

    // Phone validation
    if (this.demographics.phoneNumber && !this.isValidPhone(this.demographics.phoneNumber)) {
      this.validationWarnings.push({
        field: 'phoneNumber',
        message: 'Invalid phone format',
        severity: 'warning'
      });
    }

    // SSN validation (if provided)
    if (this.demographics.ssn && !this.isValidSSN(this.demographics.ssn)) {
      this.validationWarnings.push({
        field: 'ssn',
        message: 'Invalid SSN format',
        severity: 'error'
      });
    }
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidPhone(phone: string): boolean {
    return /^[\d\s\-\(\)]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  isValidSSN(ssn: string): boolean {
    const cleaned = ssn.replace(/\D/g, '');
    return cleaned.length === 9;
  }

  getFieldWarning(field: string): ValidationWarning | undefined {
    return this.validationWarnings.find(w => w.field === field);
  }

  onFieldChange() {
    this.validateForm();
  }

  save() {
    this.validateForm();
    
    if (this.validationWarnings.some(w => w.severity === 'error')) {
      return;
    }

    this.isSaving = true;
    // Save logic here
    setTimeout(() => {
      this.isSaving = false;
      // Show success message
    }, 1000);
  }

  maskSSN(ssn: string): string {
    if (!ssn) return '';
    const cleaned = ssn.replace(/\D/g, '');
    if (cleaned.length === 9) {
      return `***-**-${cleaned.slice(-4)}`;
    }
    return ssn;
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
}

