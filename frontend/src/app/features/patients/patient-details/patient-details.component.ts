import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { switchMap, of, catchError } from 'rxjs';
import { PatientService } from '../../../core/services/patient.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { CoverageService } from '../../../core/services/coverage.service';
import { Coverage } from '../../../core/models/coverage.model';
import { Patient } from '../../../core/models/patient.model';
import { Appointment } from '../../../core/models/appointment.model';
import { TabsComponent, TabComponent } from '../../../shared/components';

interface DemoMedication { name: string; dosage: string; status: 'ACTIVE' | 'DISCONTINUED'; prescriber: string; }

@Component({
  selector: 'app-patient-details',
  standalone: true,
  imports: [CommonModule, RouterModule, TabsComponent, TabComponent],
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.css']
})
export class PatientDetailsComponent implements OnInit {
  patient: Patient | null = null;
  appointments: Appointment[] = [];
  labs: any[] = [];
  labsLoading = false;
  isLoading = false;
  errorMessage: string | null = null;
  showImageModal = false;

  coverage: Coverage | null = null;
  coverageLoading = false;

  // Illustrative sample data — medication list has no admin-facing aggregate API yet
  // (the real /api/meds/* endpoints are scoped to the patient-self MyChart portal).
  readonly medications: DemoMedication[] = [
    { name: 'Lisinopril', dosage: '10mg once daily', status: 'ACTIVE', prescriber: 'Dr. Provider' },
    { name: 'Metformin', dosage: '500mg twice daily', status: 'ACTIVE', prescriber: 'Dr. Provider' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private coverageService: CoverageService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id');
        if (!id) {
          this.errorMessage = 'Patient ID is missing';
          return of(null);
        }
        this.isLoading = true;
        this.errorMessage = null;
        
        return this.patientService.getPatient(+id).pipe(
          catchError((err) => {
            console.error('Error loading patient:', err);
            this.errorMessage = `Failed to load patient details. Error: ${err.error?.message || err.message || 'Unknown error'}`;
            return of(null);
          })
        );
      })
    ).subscribe({
      next: (patient) => {
        this.patient = patient;
        if (patient) {
          this.loadAppointments(patient.patientId || 0);
          this.loadLabResults(patient.patientId || 0);
          this.loadCoverage(patient.patientId || 0);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Unexpected error:', err);
        this.isLoading = false;
        this.errorMessage = 'Failed to load patient details. Please try again.';
      }
    });
  }

  loadAppointments(patientId: number) {
    this.appointmentService.getByPatient(patientId).subscribe({
      next: (appointments: Appointment[]) => {
        this.appointments = appointments || [];
      },
      error: (err: any) => {
        console.error('Error loading appointments:', err);
        this.appointments = [];
      }
    });
  }

  loadLabResults(patientId: number): void {
    this.labsLoading = true;
    this.http.get<any[]>(`/api/patients/${patientId}/labs`)
      .pipe(catchError(() => of([])))
      .subscribe(results => {
        this.labs = (results || []).sort((a, b) =>
          new Date(b.resultDate || b.orderDate || 0).getTime() -
          new Date(a.resultDate || a.orderDate || 0).getTime()
        );
        this.labsLoading = false;
      });
  }

  loadCoverage(patientId: number): void {
    this.coverageLoading = true;
    this.coverageService.getByPatientId(patientId).subscribe({
      next: (coverage) => {
        this.coverage = coverage;
        this.coverageLoading = false;
      },
      error: () => {
        this.coverage = null;
        this.coverageLoading = false;
      }
    });
  }

  getAllergyList(): string[] {
    const raw = this.patient?.allergies;
    if (!raw) return [];
    return raw.split(',').map(a => a.trim()).filter(a => a.length > 0);
  }

  labStatusClass(status: string): string {
    if (status === 'ABNORMAL') return 'lab-abnormal';
    if (status === 'CRITICAL')  return 'lab-critical';
    return 'lab-normal';
  }

  labStatusLabel(status: string): string {
    if (status === 'ABNORMAL') return '⚠ Abnormal';
    if (status === 'CRITICAL')  return '🔴 Critical';
    return '✓ Normal';
  }

  getAvatar(): string {
    if (this.patient?.photoUrl) {
      return this.patient.photoUrl.startsWith('http') 
        ? this.patient.photoUrl 
        : `/api/patients/${this.patient.patientId}/image`;
    }
    return '/assets/default-patient.png';
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/default-patient.png';
  }

  openImageModal() {
    this.showImageModal = true;
  }

  closeImageModal() {
    this.showImageModal = false;
  }

  getFullImageUrl(): string {
    return this.getAvatar();
  }

  getAge(): string {
    if (!this.patient?.dateOfBirth) return '-';
    const today = new Date();
    const birthDate = new Date(this.patient.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  }

  getBloodGroup(): string {
    return this.patient?.bloodGroup || '-';
  }

  getStatus(): string {
    return this.patient?.status || 'ACTIVE';
  }

  getFormattedDate(date?: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getRegistrationDate(): string {
    // Use current date as fallback if no registration date available
    return '-';
  }

  getAppointmentCount(): number {
    return this.appointments.length;
  }

  getPrimaryProvider(): string {
    // This would come from patient.primaryProvider or similar
    return this.patient?.primaryDoctorId ? 'Dr. Provider' : 'Not assigned';
  }

  getMedicalHistory(): string {
    return this.patient?.medicalHistory || 'No medical history recorded';
  }

  getAllergies(): string {
    return this.patient?.allergies || 'No known allergies';
  }

  getAppointmentHistory() {
    return this.appointments
      .sort((a, b) => {
        const dateA = a.appointmentDate || a.date ? new Date(a.appointmentDate || a.date || '').getTime() : 0;
        const dateB = b.appointmentDate || b.date ? new Date(b.appointmentDate || b.date || '').getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 10)
      .map(apt => ({
        id: apt.appointmentId || apt.id,
        date: (apt.appointmentDate || apt.date) ? this.getFormattedDate(apt.appointmentDate || apt.date || '') : 'N/A',
        provider: apt.doctorName || 'N/A',
        department: apt.departmentName || 'N/A',
        status: apt.status || 'SCHEDULED',
        statusClass: (apt.status || 'SCHEDULED').toLowerCase().replace('_', '-').replace(' ', '-'),
        type: apt.appointmentType || apt.visitType || 'General'
      }));
  }

  editPatient() {
    if (this.patient?.patientId) {
      this.router.navigate(['/admin/patients/edit', this.patient.patientId]);
    }
  }

  bookAppointment() {
    if (this.patient?.patientId) {
      this.router.navigate(['/admin/appointments/new'], {
        queryParams: { patientId: this.patient.patientId }
      });
    }
  }
}

