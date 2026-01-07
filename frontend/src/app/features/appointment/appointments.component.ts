import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AppointmentService } from '../../core/services/appointment.service';
import { Appointment } from '../../core/models/appointment.model';
import { DoctorService } from '../../core/services/doctor.service';
import { DepartmentService } from '../../core/services/department.service';
import { PatientService } from '../../core/services/patient.service';
import { Doctor } from '../../core/models/doctor.model';
import { Patient } from '../../core/models/patient.model';
import { Department } from '../../core/models/department.model';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private doctorService = inject(DoctorService);
  private departmentService = inject(DepartmentService);
  private patientService = inject(PatientService);
  private activatedRoute = inject(ActivatedRoute);
  router = inject(Router); // Public for template access

  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  doctors: Doctor[] = [];
  departments: Department[] = [];
  patients: Patient[] = []; // Store patient data for lookup
  
  // Filters
  searchTerm = '';
  statusFilter = 'all';
  typeFilter = 'all';
  doctorFilter = 'all';
  departmentFilter = 'all';
  dateFilter = '';
  
  // Status options
  statuses = ['all', 'Checked Out', 'Checked In', 'Cancelled', 'Schedule', 'Confirmed'];
  types = ['all', 'In Person', 'Online'];
  
  isLoading = false;
  errorMessage: string | null = null;
  
  // Delete confirmation
  showDeleteModal = false;
  appointmentToDelete: Appointment | null = null;

  ngOnInit() {
    // Check if this is the reminders view
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['view'] === 'reminders') {
        // Filter to show only upcoming appointments that need reminders
        // For now, just load all data - can be enhanced later
      }
    });
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.errorMessage = null;
    
    // Load appointments
    this.appointmentService.getAll().subscribe({
      next: (appointments) => {
        this.appointments = appointments.map(apt => {
          // If patient name is missing, try to get it from patientId
          if (!apt.patientName && apt.patientId) {
            apt.patientName = this.getPatientNameFromId(apt.patientId);
          }
          return apt;
        });
        this.applyFilters();
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
    
    // Load doctors
    this.doctorService.getAll().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
      },
      error: (err) => {
        console.error('Error loading doctors:', err);
      }
    });
    
    // Load departments
    this.departmentService.getAll().subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (err) => {
        console.error('Error loading departments:', err);
      }
    });
    
    // Load patients
    this.patientService.getAll().subscribe({
      next: (patients) => {
        this.patients = patients;
      },
      error: (err) => {
        console.error('Error loading patients:', err);
      }
    });
  }

  loadMockData() {
    // Mock data for development
    this.appointments = [
      {
        id: 1,
        appointmentId: 1,
        appointmentCode: 'AP544658',
        patientId: 1,
        doctorId: 1,
        departmentId: 1,
        appointmentType: 'Online',
        date: '2025-04-25',
        time: '09:00 AM',
        reason: 'Regular checkup',
        status: 'Schedule',
        patientName: 'James Adrian',
        patientPhone: '+1 234 567 8900',
        doctorName: 'Dr. Emily Carter',
        departmentName: 'Pediatrics'
      },
      {
        id: 2,
        appointmentId: 2,
        appointmentCode: 'AP544659',
        patientId: 2,
        doctorId: 2,
        departmentId: 2,
        appointmentType: 'In Person',
        date: '2025-04-15',
        time: '11:20 AM',
        reason: 'Follow-up',
        status: 'Checked In',
        patientName: 'Susan Babin',
        patientPhone: '+1 65658 95654',
        doctorName: 'Dr. Sarah Johnson',
        departmentName: 'Orthopedics'
      }
    ];
    this.applyFilters();
  }

  applyFilters() {
    this.filteredAppointments = this.appointments.filter(apt => {
      // Search filter
      if (this.searchTerm) {
        const search = this.searchTerm.toLowerCase();
        const matchesSearch = 
          apt.patientName?.toLowerCase().includes(search) ||
          apt.doctorName?.toLowerCase().includes(search) ||
          apt.appointmentCode?.toLowerCase().includes(search) ||
          apt.appointmentId?.toString().includes(search) ||
          apt.patientPhone?.includes(search);
        if (!matchesSearch) return false;
      }
      
      // Status filter
      if (this.statusFilter !== 'all' && apt.status !== this.statusFilter) {
        return false;
      }
      
      // Type filter
      if (this.typeFilter !== 'all' && apt.appointmentType !== this.typeFilter) {
        return false;
      }
      
      // Doctor filter
      if (this.doctorFilter !== 'all' && apt.doctorId.toString() !== this.doctorFilter) {
        return false;
      }
      
      // Department filter
      if (this.departmentFilter !== 'all' && apt.departmentId?.toString() !== this.departmentFilter) {
        return false;
      }
      
      // Date filter
      if (this.dateFilter && apt.date !== this.dateFilter) {
        return false;
      }
      
      return true;
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.typeFilter = 'all';
    this.doctorFilter = 'all';
    this.departmentFilter = 'all';
    this.dateFilter = '';
    this.applyFilters();
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

  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  }

  formatDateTime(date: string, time: string): string {
    if (!date && !time) return 'Not scheduled';
    if (!date) return time || 'Not scheduled';
    if (!time) {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    }
    try {
      const d = new Date(date);
      const dateStr = d.toLocaleDateString('en-US', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
      return `${dateStr} - ${time}`;
    } catch (e) {
      return `${date} - ${time}`;
    }
  }

  editAppointment(appointment: Appointment) {
    // Navigate to new appointment page with appointment data for editing
    const appointmentId = appointment.id || (appointment as any).appointmentId;
    if (appointmentId) {
      console.log('Editing appointment:', appointmentId, appointment);
      this.router.navigate(['/admin/appointments/new'], {
        queryParams: { 
          id: appointmentId,
          edit: true
        }
      });
    } else {
      console.error('Cannot edit appointment: No ID found', appointment);
      alert('Cannot edit appointment: Missing appointment ID');
    }
  }

  viewAppointment(appointment: Appointment) {
    // Show appointment details in a modal or navigate to details
    const appointmentId = appointment.id || (appointment as any).appointmentId;
    if (appointmentId) {
      console.log('Viewing appointment:', appointmentId, appointment);
      this.router.navigate(['/admin/appointments/new'], {
        queryParams: { 
          id: appointmentId,
          view: true
        }
      });
    } else {
      console.error('Cannot view appointment: No ID found', appointment);
      alert('Cannot view appointment: Missing appointment ID');
    }
  }

  confirmDelete(appointment: Appointment) {
    this.appointmentToDelete = appointment;
    this.showDeleteModal = true;
  }

  deleteAppointment() {
    if (!this.appointmentToDelete) {
      this.showDeleteModal = false;
      return;
    }
    
    const appointmentId = this.appointmentToDelete.id || (this.appointmentToDelete as any).appointmentId;
    if (!appointmentId) {
      console.error('Cannot delete appointment: No ID found', this.appointmentToDelete);
      alert('Cannot delete appointment: Missing appointment ID');
      this.showDeleteModal = false;
      this.appointmentToDelete = null;
      return;
    }
    
    this.isLoading = true;
    this.appointmentService.delete(appointmentId).subscribe({
      next: () => {
        this.appointments = this.appointments.filter(a => {
          const aId = a.id || (a as any).appointmentId;
          return aId !== appointmentId;
        });
        this.applyFilters();
        this.showDeleteModal = false;
        this.appointmentToDelete = null;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error deleting appointment:', err);
        this.errorMessage = err?.error?.message || 'Failed to delete appointment';
        this.isLoading = false;
      }
    });
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.appointmentToDelete = null;
  }

  getDoctorName(doctorId: number): string {
    const doctor = this.doctors.find(d => d.id === doctorId);
    return doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Unknown Doctor';
  }

  getDepartmentName(departmentId?: number): string {
    if (!departmentId) return '';
    const dept = this.departments.find(d => d.id === departmentId);
    return dept?.name || '';
  }

  getPatientNameFromId(patientId: number): string {
    // Try to find patient in the patients array
    const patient = this.patients.find(p => p.id === patientId);
    if (patient) {
      return `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
    }
    // Use mock patient data as fallback
    const mockPatients: { [key: number]: string } = {
      1: 'James Adrian',
      2: 'Susan Babin',
      3: 'Martin Lisa',
      4: 'Stella Mary',
      5: 'Carol Lam',
      6: 'Jesus Adams',
      7: 'Ezra Belcher',
      8: 'Bernard Griffith'
    };
    return mockPatients[patientId] || `Patient #${patientId}`;
  }

  getPatientImage(appointment: Appointment): string {
    // First check if image is directly on appointment
    if (appointment.patientImage) {
      return appointment.patientImage;
    }
    
    // Look up patient from loaded patients array
    if (appointment.patientId) {
      const patient = this.patients.find(p => (p.id === appointment.patientId || p.patientId === appointment.patientId));
      if (patient?.photoUrl) {
        return patient.photoUrl;
      }
    }
    
    // Return a default SVG avatar
    return this.getDefaultAvatar();
  }

  getDoctorImage(appointment: Appointment): string {
    // First check if image is directly on appointment
    if (appointment.doctorImage) {
      return appointment.doctorImage;
    }
    
    // Look up doctor from loaded doctors array
    if (appointment.doctorId) {
      const doctor = this.doctors.find(d => d.id === appointment.doctorId);
      if (doctor?.photoUrl) {
        return doctor.photoUrl;
      }
    }
    
    // Return a default SVG avatar
    return this.getDefaultAvatar();
  }

  getDefaultAvatar(): string {
    // Return a base64 encoded SVG avatar - simple grey circle with person silhouette
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="20" fill="#E5E7EB"/>
      <circle cx="20" cy="15" r="6" fill="#9CA3AF"/>
      <path d="M10 32 Q10 25 20 25 Q30 25 30 32" fill="#9CA3AF"/>
    </svg>`;
    // Use base64 encoding for better compatibility
    const base64 = btoa(unescape(encodeURIComponent(svg)));
    return 'data:image/svg+xml;base64,' + base64;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    // Prevent infinite loop by checking if already set to fallback
    if (!img.src.includes('data:image') && !img.src.includes('svg')) {
      // Use a simple inline SVG as fallback - a grey circle with person icon
      img.src = this.getDefaultAvatar();
      img.onerror = null; // Remove error handler to prevent loop
    }
  }
}

