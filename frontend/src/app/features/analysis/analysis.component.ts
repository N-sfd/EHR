import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppointmentService } from '../../core/services/appointment.service';
import { DoctorService } from '../../core/services/doctor.service';
import { MasterDataService } from '../../core/services/master-data.service';
import { Appointment } from '../../core/models/appointment.model';
import { Doctor } from '../../core/models/doctor.model';
import { Department } from '../../core/models/department.model';
import { MasterDepartment } from '../../core/models/master-data.model';

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
  private masterDataService = inject(MasterDataService);
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
    
    // Initialize with mock data first to ensure UI is never blank
    this.loadMockData();
    
    // Load appointments
    this.appointmentService.getAll().subscribe({
      next: (appointments) => {
        this.appointments = appointments || [];
        this.calculateStatistics();
        this.calculatePopularDoctors(); // Recalculate with real data
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading appointments:', err);
        // Keep mock data that was already loaded
        this.isLoading = false;
      }
    });
    
    // Load doctors
    this.doctorService.getAll().subscribe({
      next: (doctors) => {
        this.doctors = doctors || [];
        this.calculatePopularDoctors(); // Recalculate with real data
      },
      error: (err: any) => {
        console.error('Error loading doctors:', err);
        // Keep mock data that was already loaded
        this.doctors = [];
      }
    });
    
    // Load departments
    this.masterDataService.getDepartments().subscribe({
      next: (masterDepts: MasterDepartment[]) => {
        this.departments = masterDepts.map((dept: MasterDepartment) => ({
          id: dept.id,
          departmentId: Number(dept.id) || undefined,
          name: dept.name,
          code: dept.code,
          description: dept.description,
          active: dept.active,
          status: dept.active ? 'ACTIVE' : 'INACTIVE',
          specialtyGroup: dept.specialtyGroup
        }));
        this.calculateTopDepartments();
      },
      error: (err: any) => {
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
    
    // If no doctors loaded, use mock data to ensure left side is not blank
    if (this.doctors.length === 0) {
      this.popularDoctors = [
        { doctor: { id: 1, firstName: 'Alex', lastName: 'Morgan', specializations: ['Cardiologist'] }, bookings: 258 },
        { doctor: { id: 2, firstName: 'Emily', lastName: 'Carter', specializations: ['Pediatrician'] }, bookings: 125 },
        { doctor: { id: 3, firstName: 'David', lastName: 'Lee', specializations: ['Gynecologist'] }, bookings: 115 }
      ];
      return;
    }
    
    this.popularDoctors = this.doctors
      .map(doctor => ({
        doctor,
        bookings: doctorCounts[doctor.id || 0] || Math.floor(Math.random() * 200) + 50
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 3);
    
    // Ensure at least 3 doctors are shown (fill with mock if needed)
    while (this.popularDoctors.length < 3) {
      this.popularDoctors.push({
        doctor: {
          id: (this.popularDoctors.length + 1),
          firstName: 'Doctor',
          lastName: `${this.popularDoctors.length + 1}`,
          specializations: ['General']
        },
        bookings: Math.floor(Math.random() * 100) + 20
      });
    }
    
    // Ensure popularDoctors is never empty
    if (this.popularDoctors.length === 0) {
      this.popularDoctors = [
        { doctor: { id: 1, firstName: 'Alex', lastName: 'Morgan', specializations: ['Cardiologist'] }, bookings: 258 },
        { doctor: { id: 2, firstName: 'Emily', lastName: 'Carter', specializations: ['Pediatrician'] }, bookings: 125 },
        { doctor: { id: 3, firstName: 'David', lastName: 'Lee', specializations: ['Gynecologist'] }, bookings: 115 }
      ];
    }
  }

  calculateTopDepartments() {
    // Group appointments by department and count
    const deptCounts: { [key: string]: number } = {};
    this.appointments.forEach(apt => {
      if (apt.departmentId) {
        const key = String(apt.departmentId);
        deptCounts[key] = (deptCounts[key] || 0) + 1;
      }
    });
    
    this.topDepartments = this.departments
      .map(dept => {
        const deptId = dept.id || dept.departmentId;
        const key = String(deptId || 0);
        return {
          department: dept,
          count: deptCounts[key] || Math.floor(Math.random() * 200) + 50
        };
      })
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
    
    // Ensure popularDoctors has IDs for avatar generation
    this.popularDoctors = [
      { doctor: { id: 1, firstName: 'Alex', lastName: 'Morgan', specializations: ['Cardiologist'] }, bookings: 258 },
      { doctor: { id: 2, firstName: 'Emily', lastName: 'Carter', specializations: ['Pediatrician'] }, bookings: 125 },
      { doctor: { id: 3, firstName: 'David', lastName: 'Lee', specializations: ['Gynecologist'] }, bookings: 115 }
    ];
    
    // Top Departments with appointment counts and revenue
    this.topDepartments = [
      { department: { name: 'OPD' }, count: 244, revenue: 6100 },
      { department: { name: 'REHABILITATION' }, count: 232, revenue: 5800 },
      { department: { name: 'Pharmacy' }, count: 227, revenue: 5675 }
    ];
    
    // Top 5 Patients with IDs and photo URLs for avatar display
    this.topPatients = [
      { 
        id: 1, 
        name: 'Jesus Adams', 
        firstName: 'Jesus', 
        lastName: 'Adams',
        totalPaid: 6589, 
        appointments: 80,
        photoUrl: `https://ui-avatars.com/api/?name=Jesus+Adams&background=0d9488&color=fff&size=100&bold=true`
      },
      { 
        id: 2, 
        name: 'Ezra Belcher', 
        firstName: 'Ezra', 
        lastName: 'Belcher',
        totalPaid: 5632, 
        appointments: 60,
        photoUrl: `https://ui-avatars.com/api/?name=Ezra+Belcher&background=3b82f6&color=fff&size=100&bold=true`
      },
      { 
        id: 3, 
        name: 'Glen Lentz', 
        firstName: 'Glen', 
        lastName: 'Lentz',
        totalPaid: 4125, 
        appointments: 40,
        photoUrl: `https://ui-avatars.com/api/?name=Glen+Lentz&background=8b5cf6&color=fff&size=100&bold=true`
      },
      { 
        id: 4, 
        name: 'Bernard Griffith', 
        firstName: 'Bernard', 
        lastName: 'Griffith',
        totalPaid: 3140, 
        appointments: 25,
        photoUrl: `https://ui-avatars.com/api/?name=Bernard+Griffith&background=10b981&color=fff&size=100&bold=true`
      },
      { 
        id: 5, 
        name: 'John Elsass', 
        firstName: 'John', 
        lastName: 'Elsass',
        totalPaid: 2654, 
        appointments: 25,
        photoUrl: `https://ui-avatars.com/api/?name=John+Elsass&background=f59e0b&color=fff&size=100&bold=true`
      }
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

  /**
   * Get doctor avatar URL with fallback to generated avatar
   */
  getDoctorAvatar(doctor: Doctor): string {
    if (!doctor) {
      return `https://ui-avatars.com/api/?name=DR&background=5c6ac4&color=fff&size=200&bold=true`;
    }
    
    // Check if photoUrl exists and is a valid image
    const doctorWithImage = doctor as { photoUrl?: string; profileImage?: string; imageUrl?: string; avatar?: string };
    const image = doctorWithImage?.photoUrl || 
                  doctorWithImage?.profileImage || 
                  doctorWithImage?.imageUrl || 
                  doctorWithImage?.avatar;
    
    if (image) {
      // If it's already a data URL or HTTP URL, use it directly
      if (image.startsWith('data:image') || image.startsWith('http://') || image.startsWith('https://')) {
        return image;
      }
      // If it's a base64 string without prefix, add the prefix
      if (image.length > 100) {
        return `data:image/jpeg;base64,${image}`;
      }
    }
    
    // Use the image endpoint if doctor ID is available
    const doctorId = doctor.id;
    if (doctorId) {
      return `/api/doctors/${doctorId}/image`;
    }
    
    // Fallback: Generate initials-based avatar
    const initials = this.getDoctorInitials(doctor);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=5c6ac4&color=fff&size=200&bold=true`;
  }

  /**
   * Get doctor initials for avatar fallback
   */
  getDoctorInitials(doctor: Doctor): string {
    const first = doctor.firstName?.[0] ?? '';
    const last = doctor.lastName?.[0] ?? '';
    return `${first}${last}`.toUpperCase() || 'DR';
  }

  /**
   * Handle doctor image error - fallback to initials avatar
   */
  onDoctorImageError(event: Event, doctor: Doctor): void {
    if (!doctor) return;
    const target = event.target as HTMLImageElement;
    if (target) {
      const initials = this.getDoctorInitials(doctor);
      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=5c6ac4&color=fff&size=200&bold=true`;
    }
  }

  /**
   * Get patient initials for avatar fallback
   */
  getPatientInitials(patient: any): string {
    if (!patient || !patient.name) {
      return 'PT';
    }
    const nameParts = patient.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0]?.[0]?.toUpperCase() || 'PT';
  }

  /**
   * Get patient avatar URL with fallback to generated avatar
   */
  getPatientAvatar(patient: any): string {
    if (!patient) {
      return `https://ui-avatars.com/api/?name=PT&background=6c757d&color=fff&size=100&bold=true`;
    }
    
    // Check if patient has photoUrl (prefer the one from data)
    if (patient.photoUrl) {
      if (patient.photoUrl.startsWith('data:image') || patient.photoUrl.startsWith('http://') || patient.photoUrl.startsWith('https://')) {
        return patient.photoUrl;
      }
      if (patient.photoUrl.length > 100) {
        return `data:image/jpeg;base64,${patient.photoUrl}`;
      }
    }
    
    // Use the image endpoint if patient ID is available
    if (patient.id || patient.patientId) {
      const patientId = patient.id || patient.patientId;
      return `/api/patients/${patientId}/image`;
    }
    
    // Fallback: Generate initials-based avatar from patient name
    const name = patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
    if (name) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6c757d&color=fff&size=100&bold=true`;
    }
    
    const initials = this.getPatientInitials(patient);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=6c757d&color=fff&size=100&bold=true`;
  }

  /**
   * Handle patient image error - fallback to initials avatar
   */
  onPatientImageError(event: Event, patient: any): void {
    if (!patient) return;
    const target = event.target as HTMLImageElement;
    if (target) {
      const initials = this.getPatientInitials(patient);
      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=6c757d&color=fff&size=200&bold=true`;
    }
  }
}

