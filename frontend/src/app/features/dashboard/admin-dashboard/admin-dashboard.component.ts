import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin, catchError, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

interface KpiCard { label: string; value: number | string; icon: string; color: string; sub?: string; route?: string; }
interface ScheduleItem { time: string; patientName: string; doctorName: string; reason: string; status: string; appointmentId?: number; }
interface RecentPatient { name: string; reason: string; date: string; status: string; doctor: string; patientId?: number; }

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private auth = inject(AuthService);

  today = new Date();
  greeting = '';
  staffName = 'Administrator';
  readonly systemStatus = 'All systems operational';
  isLoading = true;

  kpis: KpiCard[] = [];
  todaySchedule: ScheduleItem[] = [];
  recentPatients: RecentPatient[] = [];

  readonly quickActions = [
    { label: 'New Appointment', icon: 'fa-calendar-plus', route: '/admin/appointments/new', color: '#004F4F' },
    { label: 'AI Assistant',    icon: 'fa-wand-magic-sparkles', route: '/admin/ai-assistant', color: '#7c3aed' },
    { label: 'Add Patient',     icon: 'fa-user-plus',     route: '/admin/patients/add',    color: '#0891b2' },
    { label: 'Doctor Schedules',icon: 'fa-calendar-alt',  route: '/admin/doctors/schedule',color: '#7c3aed' },
    { label: 'Patient Records',  icon: 'fa-folder-open',   route: '/admin/patients',        color: '#059669' },
    { label: 'Departments',     icon: 'fa-sitemap',       route: '/admin/departments',     color: '#d97706' },
    { label: 'Reports',         icon: 'fa-chart-bar',     route: '/admin/reports/scheduling-analytics', color: '#db2777' },
  ];

  readonly modules = [
    { title: 'Doctors',       icon: 'fa-user-doctor',        route: '/admin/doctors',      color: '#004F4F', desc: 'Profiles & schedules' },
    { title: 'Staff',         icon: 'fa-users',               route: '/admin/staff-management', color: '#0891b2', desc: 'Roles & assignments' },
    { title: 'Patients',      icon: 'fa-bed-pulse',           route: '/admin/patients',     color: '#7c3aed', desc: 'Records & care plans' },
    { title: 'Appointments',  icon: 'fa-calendar-check',      route: '/admin/appointments', color: '#059669', desc: 'Scheduling & booking' },
    { title: 'AI Assistant',  icon: 'fa-wand-magic-sparkles', route: '/admin/ai-assistant', color: '#7c3aed', desc: 'Scheduling insights & chat' },
    { title: 'Departments',   icon: 'fa-sitemap',             route: '/admin/departments',  color: '#d97706', desc: 'Org structure' },
    { title: 'Specializations',icon: 'fa-stethoscope',        route: '/admin/specializations', color: '#dc2626', desc: 'Clinical specialties' },
    { title: 'Schedules',     icon: 'fa-table-columns',       route: '/admin/schedules',    color: '#0284c7', desc: 'Provider templates' },
    { title: 'Reports',       icon: 'fa-file-chart-column',   route: '/admin/reports/scheduling-analytics', color: '#059669', desc: 'Analytics & exports' },
    { title: 'Roles & Access',icon: 'fa-shield-halved',       route: '/admin/roles',        color: '#db2777', desc: 'RBAC configuration' },
  ];

  ngOnInit(): void {
    const h = this.today.getHours();
    this.greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    this.auth.getCurrentUser().subscribe(user => {
      if (user?.name) this.staffName = user.name;
    });
    this.loadData();
  }

  private loadData(): void {
    const todayStr = this.today.toISOString().slice(0, 10);
    forkJoin({
      appointments: this.http.get<any[]>('/api/appointments').pipe(catchError(() => of([]))),
      patients:     this.http.get<any>('/api/patients').pipe(catchError(() => of([]))),
      doctors:      this.http.get<any[]>('/api/doctors').pipe(catchError(() => of([])))
    }).subscribe(({ appointments, patients, doctors }) => {
      const appts = Array.isArray(appointments) ? appointments : [];
      const pList = Array.isArray(patients) ? patients : (patients?.content || []);
      const dList = Array.isArray(doctors) ? doctors : [];
      const todayAppts = appts.filter(a => (a.appointmentDate || a.date || '').startsWith(todayStr));

      this.kpis = [
        { label: "Today's Appointments", value: todayAppts.length,
          icon: 'fa-calendar-day',   color: '#004F4F', sub: 'scheduled today',  route: '/admin/appointments' },
        { label: 'Checked In',          value: todayAppts.filter(a => a.status === 'Checked In').length,
          icon: 'fa-circle-check',    color: '#059669', sub: 'arrived patients', route: '/admin/appointments' },
        { label: 'Scheduled',           value: todayAppts.filter(a => a.status === 'Scheduled' || !a.status).length,
          icon: 'fa-clock',           color: '#0891b2', sub: 'pending today',    route: '/admin/appointments' },
        { label: 'Total Patients',      value: pList.length,
          icon: 'fa-hospital-user',   color: '#7c3aed', sub: 'registered',       route: '/admin/patients' },
        { label: 'Doctors on Staff',    value: dList.length,
          icon: 'fa-user-doctor',     color: '#d97706', sub: 'active providers', route: '/admin/doctors' },
      ];

      this.todaySchedule = todayAppts
        .sort((a, b) => (a.appointmentTime || a.time || '00:00').localeCompare(b.appointmentTime || b.time || '00:00'))
        .slice(0, 10)
        .map(a => ({
          time:        a.appointmentTime || a.time || '—',
          patientName: a.patientName     || `Patient #${a.patientId}`,
          doctorName:  a.doctorName      || 'Unassigned',
          reason:      a.reason          || 'General Visit',
          status:      a.status          || 'Scheduled',
          appointmentId: a.appointmentId || a.id
        }));

      this.recentPatients = appts
        .sort((a, b) =>
          new Date(b.appointmentDate || b.date || 0).getTime() -
          new Date(a.appointmentDate || a.date || 0).getTime()
        )
        .slice(0, 8)
        .map(a => ({
          name:      a.patientName || `Patient #${a.patientId}`,
          reason:    a.reason      || 'General Visit',
          date:      a.appointmentDate || a.date || '',
          status:    a.status      || 'Scheduled',
          doctor:    a.doctorName  || '',
          patientId: a.patientId
        }));

      this.isLoading = false;
    });
  }

  go(route: string): void { this.router.navigate([route]); }

  statusClass(s: string): string {
    switch (s) {
      case 'Checked In':  return 'chip-green';
      case 'Checked Out': return 'chip-grey';
      case 'Cancelled':   return 'chip-red';
      case 'Confirmed':   return 'chip-blue';
      default:            return 'chip-yellow';
    }
  }
}
