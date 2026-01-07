import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppointmentService } from '../../core/services/appointment.service';
import { Appointment } from '../../core/models/appointment.model';

@Component({
  selector: 'app-appointment-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-calendar.component.html',
  styleUrls: ['./appointment-calendar.component.css']
})
export class AppointmentCalendarComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private router = inject(Router);

  currentDate = new Date();
  selectedDate = new Date();
  appointments: Appointment[] = [];
  appointmentsByDate: { [key: string]: Appointment[] } = {};
  
  viewMode: 'month' | 'week' | 'day' = 'month';
  isLoading = false;
  errorMessage: string | null = null;

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.isLoading = true;
    this.errorMessage = null;
    
    const startDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const endDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    
    this.appointmentService.getByDateRange(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    ).subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.groupAppointmentsByDate();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading appointments:', err);
        this.errorMessage = 'Failed to load appointments';
        this.isLoading = false;
        // Use mock data for development
        this.loadMockData();
      }
    });
  }

  loadMockData() {
    this.appointments = [
      {
        id: 1,
        appointmentId: 1,
        appointmentCode: 'AP544658',
        patientId: 1,
        doctorId: 1,
        appointmentType: 'Online',
        date: '2025-04-25',
        time: '09:00 AM',
        status: 'Schedule',
        patientName: 'James Adrian',
        doctorName: 'Dr. Emily Carter'
      },
      {
        id: 2,
        appointmentId: 2,
        appointmentCode: 'AP544659',
        patientId: 2,
        doctorId: 2,
        appointmentType: 'In Person',
        date: '2025-04-15',
        time: '11:20 AM',
        status: 'Checked In',
        patientName: 'Susan Babin',
        doctorName: 'Dr. Sarah Johnson'
      }
    ];
    this.groupAppointmentsByDate();
  }

  groupAppointmentsByDate() {
    this.appointmentsByDate = {};
    this.appointments.forEach(apt => {
      const dateKey = apt.date?.split('T')[0] || apt.date;
      if (dateKey) {
        if (!this.appointmentsByDate[dateKey]) {
          this.appointmentsByDate[dateKey] = [];
        }
        this.appointmentsByDate[dateKey].push(apt);
      }
    });
  }

  getDaysInMonth(): Date[] {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: Date[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(new Date(year, month, -i));
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }

  getAppointmentsForDate(date: Date): Appointment[] {
    const dateKey = date.toISOString().split('T')[0];
    return this.appointmentsByDate[dateKey] || [];
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  isSelected(date: Date): boolean {
    return date.getDate() === this.selectedDate.getDate() &&
           date.getMonth() === this.selectedDate.getMonth() &&
           date.getFullYear() === this.selectedDate.getFullYear();
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentDate.getMonth() &&
           date.getFullYear() === this.currentDate.getFullYear();
  }

  selectDate(date: Date) {
    if (this.isCurrentMonth(date)) {
      this.selectedDate = new Date(date);
    }
  }

  previousMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.loadAppointments();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.loadAppointments();
  }

  goToToday() {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.loadAppointments();
  }

  getMonthYearString(): string {
    return this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  getDayNames(): string[] {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Checked Out': 'status-checked-out',
      'Checked In': 'status-checked-in',
      'Cancelled': 'status-cancelled',
      'Schedule': 'status-schedule',
      'Confirmed': 'status-confirmed'
    };
    return statusMap[status] || 'status-default';
  }

  viewAppointment(appointment: Appointment) {
    this.router.navigate(['/admin/appointments/view', appointment.id]);
  }

  createAppointment() {
    this.router.navigate(['/admin/appointments/new']);
  }
}

