import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { DoctorService } from '../../core/services/doctor.service';
import { Doctor } from '../../core/models/doctor.model';
import { Patient, CreatePatientDto } from '../../core/models/patient.model';

@Component({
  selector: 'app-add-patient-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './add-patient-dialog.component.html',
  styleUrls: ['./add-patient-dialog.component.css']
})
export class AddPatientDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddPatientDialogComponent>);
  private doctorService = inject(DoctorService);

  patientForm: FormGroup;
  doctors: Doctor[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  genders = ['Male', 'Female', 'Other'];
  bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  statuses = ['Available', 'Unavailable'];
  
  countries = ['United States', 'Canada', 'UK', 'Germany', 'France'];
  states: { [key: string]: string[] } = {
    'United States': ['California', 'New York', 'Texas', 'Florida'],
    'Canada': ['Ontario', 'Quebec', 'British Columbia'],
    'UK': ['England', 'Scotland', 'Wales'],
    'Germany': ['Bavaria', 'Berlin', 'Hamburg'],
    'France': ['Île-de-France', 'Provence', 'Normandy']
  };
  cities: { [key: string]: string[] } = {
    'California': ['Los Angeles', 'San Francisco', 'San Diego'],
    'Ontario': ['Toronto', 'Ottawa', 'Hamilton'],
    'England': ['London', 'Manchester', 'Birmingham'],
    'Bavaria': ['Munich', 'Nuremberg', 'Augsburg'],
    'Île-de-France': ['Paris', 'Versailles', 'Nanterre']
  };

  availableStates: string[] = [];
  availableCities: string[] = [];

  constructor() {
    this.patientForm = this.fb.group({
      // Patient Information
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      emailAddress: ['', [Validators.email]],
      primaryDoctorId: [''],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      bloodGroup: [''],
      status: ['Available', [Validators.required]],
      
      // Address Information
      addressLine1: ['', [Validators.required]],
      addressLine2: [''],
      country: ['', [Validators.required]],
      state: ['', [Validators.required]],
      city: ['', [Validators.required]],
      pincode: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadDoctors();

    // Update states when country changes
    this.patientForm.get('country')?.valueChanges.subscribe(country => {
      this.availableStates = this.states[country] || [];
      this.patientForm.patchValue({ state: '', city: '' });
    });

    // Update cities when state changes
    this.patientForm.get('state')?.valueChanges.subscribe(state => {
      this.availableCities = this.cities[state] || [];
      this.patientForm.patchValue({ city: '' });
    });
  }

  loadDoctors(): void {
    this.doctorService.getAll().subscribe({
      next: (docs) => {
        this.doctors = docs;
      },
      error: (err) => {
        console.error('Error loading doctors:', err);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const formValue = this.patientForm.value;
    const newPatient: Patient = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      phoneNumber: formValue.phoneNumber,
      emailAddress: formValue.emailAddress,
      primaryDoctorId: formValue.primaryDoctorId,
      dateOfBirth: formValue.dateOfBirth ? new Date(formValue.dateOfBirth).toISOString() : undefined,
      gender: formValue.gender,
      bloodGroup: formValue.bloodGroup,
      status: formValue.status,
      addressLine1: formValue.addressLine1,
      addressLine2: formValue.addressLine2,
      country: formValue.country,
      state: formValue.state,
      city: formValue.city,
      pincode: formValue.pincode
    };

    // TODO: Call patient service to create patient
    console.log('Creating patient:', newPatient);
    
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      // Generate a mock ID
      newPatient.id = Date.now();
      newPatient.patientCode = `PAT-${newPatient.id}`;
      this.dialogRef.close(newPatient);
    }, 1000);
  }

  onImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // Store base64 image
        // this.patientForm.patchValue({ photoUrl: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }
}

