import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SchedulingService } from '../scheduling/services/scheduling.service';
import { MasterDataService } from '../../core/services/master-data.service';
import { AppointmentFormData, AppointmentBlock } from './models/appointment-scheduling.models';
import { Patient } from '../../core/models/patient.model';
import { Doctor } from '../../core/models/doctor.model';
import { Department } from '../../core/models/department.model';
import { debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';

export interface AddAppointmentDialogData {
  appointment?: AppointmentBlock; // For edit mode
  providerId?: number;
  date?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  patientId?: number;
}

@Component({
  selector: 'app-add-appointment-dialog',
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
    MatAutocompleteModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './add-appointment-dialog.component.html',
  styleUrls: ['./add-appointment-dialog.component.css']
})
export class AddAppointmentDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddAppointmentDialogComponent>);
  private schedulingService = inject(SchedulingService);
  private masterDataService = inject(MasterDataService);
  private dialogData = inject(MAT_DIALOG_DATA, { optional: true }) as AddAppointmentDialogData | undefined;

  form!: FormGroup;
  
  // Patient search
  patientSearchControl = this.fb.control('');
  filteredPatients: Patient[] = [];
  selectedPatient: Patient | null = null;
  isSearchingPatients = false;
  
  // Dropdowns
  providers: Doctor[] = [];
  departments: Department[] = [];
  visitTypes = ['New Patient', 'Follow-up', 'Consultation', 'Procedure', 'Annual Physical', 'Urgent Care'];
  statuses = ['Schedule', 'Confirmed', 'Arrived', 'Checked In', 'Checked Out', 'Cancelled'];
  
  isEditMode = false;
  isLoading = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    const data = this.dialogData || {};
    this.isEditMode = !!data.appointment;

    // Initialize form
    this.form = this.fb.group({
      patientId: [data.patientId || data.appointment?.patientId || '', Validators.required],
      providerId: [data.providerId || data.appointment?.providerId || '', Validators.required],
      departmentId: [data.appointment?.departmentId || '', Validators.required],
      appointmentDate: [data.date || (data.appointment ? this.formatDateFromISO(data.appointment.startDateTime) : ''), Validators.required],
      appointmentTime: [data.startTime || (data.appointment ? this.formatTimeFromISO(data.appointment.startDateTime) : ''), Validators.required],
      durationMinutes: [data.appointment?.durationMinutes || 30, [Validators.required, Validators.min(15), Validators.max(240)]],
      visitType: [data.appointment?.visitType || 'Follow-up', Validators.required],
      status: [data.appointment?.status || 'Schedule', Validators.required],
      reason: [data.appointment?.reason || '', Validators.required],
      notes: [data.appointment?.notes || '']
    });

    // Setup patient search
    this.setupPatientSearch();
    
    // Load initial patient if in edit mode
    if (this.isEditMode && data.appointment?.patientId) {
      this.loadPatientById(data.appointment.patientId);
    }

    this.loadProviders();
    this.loadDepartments();
  }

  setupPatientSearch(): void {
    // Debounced patient search
    this.patientSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || typeof query !== 'string' || query.length < 2) {
          this.filteredPatients = [];
          return of([]);
        }
        this.isSearchingPatients = true;
        return this.schedulingService.searchPatients(query).pipe(
          catchError(() => {
            this.isSearchingPatients = false;
            return of([]);
          })
        );
      })
    ).subscribe(patients => {
      this.filteredPatients = patients || [];
      this.isSearchingPatients = false;
    });
  }

  loadPatientById(patientId: number): void {
    this.schedulingService.searchPatients(String(patientId)).subscribe({
      next: (patients) => {
        const patient = patients.find(p => p.id === patientId);
        if (patient) {
          this.selectPatient(patient);
        }
      }
    });
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient = patient;
    this.form.patchValue({ patientId: patient.id });
    this.patientSearchControl.setValue(`${patient.firstName} ${patient.lastName}`, { emitEvent: false });
    this.filteredPatients = [];
  }

  displayPatientFn(patient: Patient): string {
    return patient ? `${patient.firstName} ${patient.lastName} (${this.getPatientCode(patient)})` : '';
  }

  getPatientCode(patient: Patient): string {
    return (patient as any).patientCode || patient.mrn || 'N/A';
  }

  getProviderName(provider: Doctor): string {
    return (provider as any).name || `${provider.firstName || ''} ${provider.lastName || ''}`.trim() || 'Unknown Provider';
  }

  loadProviders(): void {
    this.schedulingService.getProviders().subscribe({
      next: (providers) => {
        this.providers = providers || [];
      },
      error: () => {
        this.providers = [];
      }
    });
  }

  loadDepartments(): void {
    this.schedulingService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments || [];
      },
      error: () => {
        this.departments = [];
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const formValue = this.form.value;
    const appointmentData: AppointmentFormData = {
      appointmentId: this.dialogData?.appointment?.id || this.dialogData?.appointment?.appointmentId,
      patientId: formValue.patientId,
      providerId: formValue.providerId,
      departmentId: formValue.departmentId,
      appointmentDate: formValue.appointmentDate,
      appointmentTime: formValue.appointmentTime,
      durationMinutes: formValue.durationMinutes,
      visitType: formValue.visitType,
      status: formValue.status,
      visitReason: formValue.reason,
      schedulingNotes: formValue.notes
    };

    const saveObservable = this.isEditMode && appointmentData.appointmentId
      ? this.schedulingService.updateAppointment(appointmentData.appointmentId, appointmentData)
      : this.schedulingService.saveAppointment(appointmentData);

    saveObservable.subscribe({
      next: (result) => {
        this.isLoading = false;
        this.dialogRef.close(result);
      },
      error: (err) => {
        console.error('Error saving appointment:', err);
        this.errorMessage = err?.error?.message || 'Failed to save appointment';
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private formatDateFromISO(isoString?: string): string {
    if (!isoString) return '';
    return isoString.split('T')[0];
  }

  private formatTimeFromISO(isoString: string): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}

