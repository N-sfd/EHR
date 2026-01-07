import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppointmentService } from '../../core/services/appointment.service';
import { DoctorService } from '../../core/services/doctor.service';
import { DepartmentService } from '../../core/services/department.service';
import { Appointment } from '../../core/models/appointment.model';
import { Doctor } from '../../core/models/doctor.model';
import { Department } from '../../core/models/department.model';

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css']
})
export class AnalysisComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private doctorService = inject(DoctorService);
  private departmentService = inject(DepartmentService);
  private router = inject(Router);

  // Statistics
  totalDoctors = 0;
  totalPatients = 0;
  totalAppointments = 0;
  totalRevenue = 0;
  
  // Appointment Statistics
  allAppointments = 0;
  cancelledAppointments = 0;
  rescheduledAppointments = 0;
  completedAppointments = 0;
  
  // Data
  appointments: Appointment[] = [];
  doctors: Doctor[] = [];
  departments: Department[] = [];
  popularDoctors: any[] = [];
  topDepartments: any[] = [];
  topPatients: any[] = [];
  recentTransactions: any[] = [];
  leaveRequests: any[] = [];
  
  // Filters
  appointmentPeriod = 'Monthly';
  doctorPeriod = 'Weekly';
  departmentPeriod = 'Weekly';
  incomePeriod = 'Weekly';
  transactionPeriod = 'Weekly';
  leavePeriod = 'Today';
  
  isLoading = false;
  errorMessage: string | null = null;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    
    // Load appointments
    this.appointmentService.getAll().subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.calculateStatistics();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading appointments:', err);
        this.loadMockData();
        this.isLoading = false;
      }
    });
    
    // Load doctors
    this.doctorService.getAll().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.calculatePopularDoctors();
      },
      error: (err) => {
        console.error('Error loading doctors:', err);
      }
    });
    
    // Load departments
    this.departmentService.getAll().subscribe({
      next: (departments) => {
        this.departments = departments;
        this.calculateTopDepartments();
      },
      error: (err) => {
        console.error('Error loading departments:', err);
      }
    });
  }

  calculateStatistics() {
    this.totalAppointments = this.appointments.length;
    this.allAppointments = this.appointments.length;
    this.cancelledAppointments = this.appointments.filter(a => a.status === 'Cancelled').length;
    // Note: 'Reschedule' is not a valid status in the model, using 'Schedule' as rescheduled appointments
    this.rescheduledAppointments = this.appointments.filter(a => a.status === 'Schedule' && a.date !== undefined).length;
    // Only 'Checked Out' is a valid status for completed appointments
    this.completedAppointments = this.appointments.filter(a => a.status === 'Checked Out').length;
    
    // Mock data for other stats
    this.totalDoctors = this.doctors.length || 247;
    this.totalPatients = 4178;
    this.totalRevenue = 551240;
  }

  calculatePopularDoctors() {
    // Group appointments by doctor and count
    const doctorCounts: { [key: number]: number } = {};
    this.appointments.forEach(apt => {
      if (apt.doctorId) {
        doctorCounts[apt.doctorId] = (doctorCounts[apt.doctorId] || 0) + 1;
      }
    });
    
    this.popularDoctors = this.doctors
      .map(doctor => ({
        doctor,
        bookings: doctorCounts[doctor.id || 0] || Math.floor(Math.random() * 200) + 50
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 3);
  }

  calculateTopDepartments() {
    // Group appointments by department and count
    const deptCounts: { [key: number]: number } = {};
    this.appointments.forEach(apt => {
      if (apt.departmentId) {
        deptCounts[apt.departmentId] = (deptCounts[apt.departmentId] || 0) + 1;
      }
    });
    
    this.topDepartments = this.departments
      .map(dept => ({
        department: dept,
        count: deptCounts[dept.id || dept.departmentId || 0] || Math.floor(Math.random() * 200) + 50
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }

  loadMockData() {
    // Mock data for development
    this.totalDoctors = 247;
    this.totalPatients = 4178;
    this.totalAppointments = 12178;
    this.totalRevenue = 551240;
    
    this.allAppointments = 6314;
    this.cancelledAppointments = 456;
    this.rescheduledAppointments = 745;
    this.completedAppointments = 4578;
    
    this.popularDoctors = [
      { doctor: { firstName: 'Alex', lastName: 'Morgan', specializations: ['Cardiologist'] }, bookings: 258 },
      { doctor: { firstName: 'Emily', lastName: 'Carter', specializations: ['Pediatrician'] }, bookings: 125 },
      { doctor: { firstName: 'David', lastName: 'Lee', specializations: ['Gynecologist'] }, bookings: 115 }
    ];
    
    this.topDepartments = [
      { department: { name: 'Cardiology' }, count: 214 },
      { department: { name: 'Dental' }, count: 150 },
      { department: { name: 'Neurology' }, count: 121 }
    ];
    
    this.topPatients = [
      { name: 'Jesus Adams', totalPaid: 6589, appointments: 80 },
      { name: 'Ezra Belcher', totalPaid: 5632, appointments: 60 },
      { name: 'Glen Lentz', totalPaid: 4125, appointments: 40 },
      { name: 'Bernard Griffith', totalPaid: 3140, appointments: 25 },
      { name: 'John Elsass', totalPaid: 2654, appointments: 25 }
    ];
    
    this.recentTransactions = [
      { description: 'General Check-up', invoice: '#INV5889', amount: 234, type: 'income' },
      { description: 'Online Consultation', invoice: '#INV7874', amount: 234, type: 'income' },
      { description: 'Purchase Product', invoice: '#INV4458', amount: 69, type: 'expense' },
      { description: 'Online Consultation', invoice: '#INV5456', amount: 234, type: 'income' },
      { description: 'Online Consultation', invoice: '#INV4557', amount: 234, type: 'income' }
    ];
    
    this.leaveRequests = [
      { name: 'James Allaire', days: 4, reason: 'Personal Reason' },
      { name: 'Esther Schmidt', days: 2, reason: 'Going to Hospital' },
      { name: 'Valerie Padgett', days: 1, reason: 'Changing Account' },
      { name: 'Diane Nash', days: 1, reason: 'Not Well' },
      { name: 'Sally Cavazos', days: 2, reason: 'Going to Checkup' }
    ];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  }

  formatDateTime(date: string | undefined, time: string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const dateStr = d.toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
    return time ? `${dateStr} - ${time}` : dateStr;
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

  navigateToAppointments() {
    this.router.navigate(['/admin/appointments']);
  }

  navigateToDoctors() {
    this.router.navigate(['/admin/doctors']);
  }

  navigateToDoctor(doctorId: number) {
    this.router.navigate(['/admin/doctors/profile', doctorId]);
  }
}

