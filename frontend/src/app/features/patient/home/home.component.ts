import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../core/models/appointment.model';

interface PatientProfile {
  patientId?: number;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  phoneNumber?: string;
  email?: string;
  primaryDoctorId?: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private http = inject(HttpClient);
  private appointmentService = inject(AppointmentService);
  private router = inject(Router);

  patient: PatientProfile | null = null;
  upcomingAppointments: Appointment[] = [];
  pastAppointments: Appointment[] = [];
  isLoading = true;
  today = new Date();

  ngOnInit(): void {
    this.loadPatientContext();
  }

  private loadPatientContext(): void {
    this.http.get<any>(`${environment.apiUrl}/api/patient/smart/session`, { withCredentials: true })
      .pipe(catchError(() => of(null)))
      .subscribe(session => {
        if (session?.patientId) {
          this.loadPatientData(session.patientId);
        } else {
          this.isLoading = false;
          this.loadSampleAppointments();
        }
      });
  }

  private loadPatientData(patientId: number): void {
    this.http.get<PatientProfile>(`${environment.apiUrl}/api/patients/${patientId}`, { withCredentials: true })
      .pipe(catchError(() => of(null)))
      .subscribe(p => {
        this.patient = p;
        this.loadAppointments(patientId);
      });
  }

  private loadAppointments(patientId: number): void {
    this.appointmentService.getByPatient(patientId)
      .pipe(catchError(() => of([])))
      .subscribe(apts => {
        this.categoriseAppointments(apts);
        this.isLoading = false;
      });
  }

  private loadSampleAppointments(): void {
    this.appointmentService.getAll()
      .pipe(catchError(() => of([])))
      .subscribe(apts => {
        this.categoriseAppointments(apts.slice(0, 6));
        this.isLoading = false;
      });
  }

  private categoriseAppointments(apts: Appointment[]): void {
    const todayStr = this.today.toISOString().slice(0, 10);
    this.upcomingAppointments = apts
      .filter(a => (a.appointmentDate || a.date || '') >= todayStr)
      .sort((a, b) => (a.appointmentDate || a.date || '').localeCompare(b.appointmentDate || b.date || ''))
      .slice(0, 5);
    this.pastAppointments = apts
      .filter(a => (a.appointmentDate || a.date || '') < todayStr)
      .sort((a, b) => (b.appointmentDate || b.date || '').localeCompare(a.appointmentDate || a.date || ''))
      .slice(0, 3);
  }

  get patientName(): string {
    if (!this.patient) return 'Patient';
    return `${this.patient.firstName ?? ''} ${this.patient.lastName ?? ''}`.trim() || 'Patient';
  }

  get greeting(): string {
    const h = this.today.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'Confirmed': return 'status-confirmed';
      case 'Checked In': return 'status-checked-in';
      case 'Checked Out': return 'status-checked-out';
      case 'Cancelled': return 'status-cancelled';
      default: return 'status-scheduled';
    }
  }

  formatDate(d?: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  goToAppointments(): void {
    this.router.navigate(['/patient/appointments']);
  }
}
