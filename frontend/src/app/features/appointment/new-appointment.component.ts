import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DoctorService } from '../../core/services/doctor.service';
import { DepartmentService } from '../../core/services/department.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { Doctor } from '../../core/models/doctor.model';
import { Department } from '../../core/models/department.model';
import { Patient } from '../../core/models/patient.model';
import { AddPatientDialogComponent } from './add-patient-dialog.component';

@Component({
  selector: 'app-new-appointment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './new-appointment.component.html',
  styleUrls: ['./new-appointment.component.css']
})
export class NewAppointmentComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private doctorService = inject(DoctorService);
  private departmentService = inject(DepartmentService);
  private appointmentService = inject(AppointmentService);

  appointmentForm: FormGroup;
  departments: Department[] = [];
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  patients: Patient[] = []; // Mock patients - replace with actual service
  isLoading = false;
  errorMessage: string | null = null;

  appointmentTypes = ['In Person', 'Online'];
  appointmentStatuses = ['Checked Out', 'Checked In', 'Cancelled', 'Schedule', 'Confirmed'];

  // Mock patient data - replace with actual service
  mockPatients: Patient[] = [
    { id: 1, firstName: 'Alberto', lastName: 'Ripley', phoneNumber: '+1 234 567 8900', emailAddress: 'alberto@example.com' },
    { id: 2, firstName: 'Susan', lastName: 'Babin', phoneNumber: '+1 234 567 8901', emailAddress: 'susan@example.com' },
    { id: 3, firstName: 'Martin', lastName: 'Lisa', phoneNumber: '+1 234 567 8902', emailAddress: 'martin@example.com' },
    { id: 4, firstName: 'Stella', lastName: 'Mary', phoneNumber: '+1 234 567 8903', emailAddress: 'stella@example.com' },
    { id: 5, firstName: 'Carol', lastName: 'Lam', phoneNumber: '+1 234 567 8904', emailAddress: 'carol@example.com' },
    { id: 6, firstName: 'Jesus', lastName: 'Adams', phoneNumber: '+1 234 567 8905', emailAddress: 'jesus@example.com' },
    { id: 7, firstName: 'Ezra', lastName: 'Belcher', phoneNumber: '+1 234 567 8906', emailAddress: 'ezra@example.com' },
    { id: 8, firstName: 'Bernard', lastName: 'Griffith', phoneNumber: '+1 234 567 8907', emailAddress: 'bernard@example.com' }
  ];

  constructor() {
    this.appointmentForm = this.fb.group({
      appointmentId: ['', Validators.required],
      patientId: ['', Validators.required],
      departmentId: ['', Validators.required],
      doctorId: ['', Validators.required],
      appointmentType: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required],
      appointmentReason: ['', Validators.required],
      status: ['Schedule', Validators.required]
    });
  }

  isEditMode = false;
  isViewMode = false;
  appointmentId: number | null = null;

  ngOnInit(): void {
    // Check for edit/view mode from query params
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      const edit = params['edit'] === 'true' || params['edit'] === true;
      const view = params['view'] === 'true' || params['view'] === true;
      
      if (id) {
        this.appointmentId = Number(id);
        this.isEditMode = edit;
        this.isViewMode = view;
        this.loadAppointment(this.appointmentId);
      } else {
        // Auto-generate appointment ID on init for new appointments
        this.generateAppointmentId();
      }
    });
    
    this.patients = this.mockPatients;
    this.loadDepartments();
    this.loadDoctors();

    // Filter doctors when department changes
    this.appointmentForm.get('departmentId')?.valueChanges.subscribe((deptId: any) => {
      console.log('Department changed to:', deptId, 'Type:', typeof deptId);
      const deptIdNum = deptId ? Number(deptId) : null;
      this.filterDoctorsByDepartment(deptIdNum);
    });
  }

  loadAppointment(id: number): void {
    this.isLoading = true;
    this.appointmentService.getById(id).subscribe({
      next: (appointment) => {
        // Populate form with appointment data
        this.appointmentForm.patchValue({
          appointmentId: appointment.appointmentId || appointment.id?.toString(),
          patientId: appointment.patientId,
          departmentId: appointment.departmentId,
          doctorId: appointment.doctorId,
          appointmentType: appointment.appointmentType,
          appointmentDate: appointment.date,
          appointmentTime: appointment.time,
          appointmentReason: appointment.reason,
          status: appointment.status
        });
        
        // Filter doctors based on selected department
        if (appointment.departmentId) {
          this.filterDoctorsByDepartment(appointment.departmentId);
        }
        
        // Disable form if in view mode
        if (this.isViewMode) {
          this.appointmentForm.disable();
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading appointment:', err);
        this.errorMessage = 'Failed to load appointment';
        this.isLoading = false;
      }
    });
  }

  loadDepartments(): void {
    this.departmentService.getAll().subscribe({
      next: (depts) => {
        this.departments = depts;
      },
      error: (err) => {
        console.error('Error loading departments:', err);
      }
    });
  }

  loadDoctors(): void {
    this.doctorService.getAll().subscribe({
      next: (docs) => {
        console.log('Loaded doctors:', docs.length, docs);
        this.doctors = docs;
        // Initially show all doctors, or filter if department is already selected
        const deptId = this.appointmentForm.get('departmentId')?.value;
        if (deptId) {
          this.filterDoctorsByDepartment(deptId);
        } else {
          this.filteredDoctors = [];
        }
      },
      error: (err) => {
        console.error('Error loading doctors:', err);
        this.filteredDoctors = [];
        // Show mock doctors for development
        this.doctors = [];
      }
    });
  }

  filterDoctorsByDepartment(departmentId: number | null): void {
    console.log('filterDoctorsByDepartment called with:', departmentId, 'Type:', typeof departmentId);
    console.log('Available doctors:', this.doctors.length);
    
    if (!departmentId) {
      this.filteredDoctors = [];
      // Clear doctor selection when department is cleared
      this.appointmentForm.patchValue({ doctorId: '' });
      return;
    }

    // Convert to number if it's a string
    const deptIdNum = typeof departmentId === 'string' ? Number(departmentId) : departmentId;
    
    // For now, show ALL doctors when a department is selected
    // This ensures doctors are always available for selection
    // TODO: Implement proper department-based filtering once doctor-department associations are verified
    if (this.doctors.length > 0) {
      this.filteredDoctors = [...this.doctors]; // Create a new array to trigger change detection
      console.log('Showing all doctors for department selection:', deptIdNum, 'Total:', this.doctors.length);
      console.log('Filtered doctors:', this.filteredDoctors.length);
      return;
    }

    // If no doctors loaded, keep filtered list empty
    this.filteredDoctors = [];
    console.log('No doctors available');
  }

  openAddPatientDialog(): void {
    const dialogRef = this.dialog.open(AddPatientDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((newPatient: Patient | null) => {
      if (newPatient) {
        // Add new patient to list
        this.patients.push(newPatient);
        // Select the new patient
        this.appointmentForm.patchValue({ patientId: newPatient.id });
      }
    });
  }

  getPatientName(patientId: number | null): string {
    if (!patientId) return '';
    const patient = this.patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : '';
  }

  getDoctorName(doctorId: number | null): string {
    if (!doctorId) return '';
    const doctor = this.doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : '';
  }

  getDepartmentName(departmentId: number | null): string {
    if (!departmentId) return '';
    const dept = this.departments.find(d => d.id === departmentId);
    return dept ? dept.name : '';
  }

  getSpecializationName(spec: any): string {
    if (!spec) return '';
    if (typeof spec === 'string') return spec;
    if (typeof spec === 'object' && spec.name) return spec.name;
    return '';
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const formValue = this.appointmentForm.value;
    
    const appointmentData = {
      patientId: formValue.patientId,
      doctorId: formValue.doctorId,
      departmentId: formValue.departmentId,
      appointmentType: formValue.appointmentType,
      date: formValue.appointmentDate,
      time: formValue.appointmentTime,
      reason: formValue.appointmentReason,
      status: formValue.status,
      appointmentId: formValue.appointmentId
    };

    if (this.isEditMode && this.appointmentId) {
      // Update existing appointment
      this.appointmentService.update(this.appointmentId, appointmentData).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/admin/appointments']);
        },
        error: (err) => {
          console.error('Error updating appointment:', err);
          this.errorMessage = err?.error?.message || 'Failed to update appointment';
          this.isLoading = false;
        }
      });
    } else {
      // Create new appointment
      this.appointmentService.create(appointmentData).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/admin/appointments']);
        },
        error: (err) => {
          console.error('Error creating appointment:', err);
          this.errorMessage = err?.error?.message || 'Failed to create appointment';
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/appointments']);
  }

  generateAppointmentId(): void {
    // Generate a unique appointment ID in format AP234354 (AP + 6 digits)
    const random = Math.floor(100000 + Math.random() * 900000); // 6-digit number (100000-999999)
    const appointmentId = `AP${random}`;
    this.appointmentForm.patchValue({ appointmentId });
  }
}
