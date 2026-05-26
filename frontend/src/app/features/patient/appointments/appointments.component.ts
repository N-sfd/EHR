import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../core/models/appointment.model';

type FilterTab = 'upcoming' | 'past' | 'all';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
  private http = inject(HttpClient);
  private appointmentService = inject(AppointmentService);

  allAppointments: Appointment[] = [];
  filtered: Appointment[] = [];
  isLoading = true;
  activeTab: FilterTab = 'upcoming';
  searchTerm = '';
  today = new Date().toISOString().slice(0, 10);

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/api/patient/smart/session`, { withCredentials: true })
      .pipe(catchError(() => of(null)))
      .subscribe(session => {
        if (session?.patientId) {
          this.loadByPatient(session.patientId);
        } else {
          this.appointmentService.getAll()
            .pipe(catchError(() => of([])))
            .subscribe(apts => { this.allAppointments = apts; this.applyFilter(); this.isLoading = false; });
        }
      });
  }

  private loadByPatient(id: number): void {
    this.appointmentService.getByPatient(id)
      .pipe(catchError(() => of([])))
      .subscribe(apts => { this.allAppointments = apts; this.applyFilter(); this.isLoading = false; });
  }

  setTab(tab: FilterTab): void {
    this.activeTab = tab;
    this.applyFilter();
  }

  onSearch(): void { this.applyFilter(); }

  applyFilter(): void {
    let list = [...this.allAppointments];

    if (this.activeTab === 'upcoming') {
      list = list.filter(a => (a.appointmentDate || a.date || '') >= this.today && a.status !== 'Cancelled');
      list.sort((a, b) => (a.appointmentDate || a.date || '').localeCompare(b.appointmentDate || b.date || ''));
    } else if (this.activeTab === 'past') {
      list = list.filter(a => (a.appointmentDate || a.date || '') < this.today);
      list.sort((a, b) => (b.appointmentDate || b.date || '').localeCompare(a.appointmentDate || a.date || ''));
    } else {
      list.sort((a, b) => (b.appointmentDate || b.date || '').localeCompare(a.appointmentDate || a.date || ''));
    }

    const s = this.searchTerm.trim().toLowerCase();
    if (s) {
      list = list.filter(a =>
        (a.reason || '').toLowerCase().includes(s) ||
        (a.doctorName || '').toLowerCase().includes(s) ||
        (a.status || '').toLowerCase().includes(s) ||
        (a.appointmentDate || a.date || '').includes(s)
      );
    }

    this.filtered = list;
  }

  get upcomingCount(): number {
    return this.allAppointments.filter(a => (a.appointmentDate || a.date || '') >= this.today && a.status !== 'Cancelled').length;
  }
  get pastCount(): number {
    return this.allAppointments.filter(a => (a.appointmentDate || a.date || '') < this.today).length;
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
}
