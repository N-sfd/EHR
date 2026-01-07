import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DoctorService } from '../../../core/services/doctor.service';
import { Doctor } from '../../../core/models/doctor.model';

interface DaySchedule {
  day: string;
  sessions: Session[];
}

interface Session {
  type: 'Morning' | 'Noon';
  from: string;
  to: string;
}

@Component({
  selector: 'app-doctor-schedule',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './doctor-schedule.component.html',
  styleUrls: ['./doctor-schedule.component.css']
})
export class DoctorScheduleComponent implements OnInit {
  private fb = inject(FormBuilder);
  private doctorService = inject(DoctorService);

  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  isLoading = false;
  showFilters = false;
  showScheduleModal = false;
  selectedDoctor: Doctor | null = null;
  showExportMenu = false;

  // Filters
  doctorFilter = 'all';
  designationFilter = 'all';
  departmentFilter = 'all';
  dateFilter = '';
  amountFilter = 'all';
  statusFilter = 'all';
  sortBy = 'recent';

  // Filter options
  uniqueDoctors: string[] = [];
  designations = ['Cardiologist', 'Orthopedic Surgeon', 'Pediatrician', 'Gynecologist', 'Psychiatrist', 'Neurosurgeon', 'Oncologist', 'Pulmonologist', 'Urologist'];
  departments = ['Cardiology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Psychiatry', 'Neurology', 'Oncology', 'Pulmonology', 'Urology'];
  amountRanges = ['$501 - $1000', '$501 - $1100', '$701 - $1200'];
  statuses = ['Available', 'Unavailable'];

  // Schedule form
  scheduleForm = this.fb.group({
    from: [''],
    to: [''],
    recurEvery: ['1 Week'],
    schedules: this.fb.array<DaySchedule>([])
  });

  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  dayAbbreviations = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  ngOnInit(): void {
    this.loadDoctors();
    this.initializeScheduleForm();
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
      this.showExportMenu = false;
    });
  }

  initializeScheduleForm(): void {
    const schedulesArray = this.scheduleForm.get('schedules') as FormArray;
    schedulesArray.clear();
    
    this.daysOfWeek.forEach(day => {
      const dayGroup = this.fb.group({
        day: [day],
        sessions: this.fb.array<Session>([])
      });
      schedulesArray.push(dayGroup);
    });
  }

  loadDoctors(): void {
    this.isLoading = true;
    this.doctorService.getAll().subscribe({
      next: (doctors) => {
        // Remove duplicates based on doctor ID
        const uniqueDoctorsMap = new Map<number | string, Doctor>();
        doctors.forEach(doctor => {
          const key = doctor.id || doctor.doctorCode || `${doctor.firstName}-${doctor.lastName}`;
          if (!uniqueDoctorsMap.has(key as any)) {
            uniqueDoctorsMap.set(key as any, doctor);
          }
        });
        this.doctors = Array.from(uniqueDoctorsMap.values());
        this.uniqueDoctors = [...new Set(this.doctors.map(d => `Dr. ${d.firstName || ''} ${d.lastName || ''}`))];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading doctors:', err);
        this.isLoading = false;
    }
    });
  }

  applyFilters(): void {
    // Remove duplicates based on doctor ID
    const uniqueDoctorsMap = new Map<number | string, Doctor>();
    this.doctors.forEach(doctor => {
      const key = doctor.id || doctor.doctorCode || `${doctor.firstName}-${doctor.lastName}`;
      if (!uniqueDoctorsMap.has(key as any)) {
        uniqueDoctorsMap.set(key as any, doctor);
      }
    });
    const uniqueDoctorsList = Array.from(uniqueDoctorsMap.values());

    this.filteredDoctors = uniqueDoctorsList.filter((doctor) => {
      const doctorName = `Dr. ${doctor.firstName ?? ''} ${doctor.lastName ?? ''}`;
      const matchesDoctor = this.doctorFilter === 'all' || doctorName === this.doctorFilter;
      const matchesDesignation = this.designationFilter === 'all' || this.getSpecialization(doctor) === this.designationFilter;
      const matchesDepartment = this.departmentFilter === 'all' || this.getDepartment(doctor) === this.departmentFilter;
      const matchesStatus = this.statusFilter === 'all' || this.getAvailabilityStatus(doctor) === this.statusFilter;
      
      // Amount filter
      const price = this.getPriceNumber(doctor);
      let matchesAmount = true;
      if (this.amountFilter === '$501 - $1000') {
        matchesAmount = price >= 501 && price <= 1000;
      } else if (this.amountFilter === '$501 - $1100') {
        matchesAmount = price >= 501 && price <= 1100;
      } else if (this.amountFilter === '$701 - $1200') {
        matchesAmount = price >= 701 && price <= 1200;
      }

      return matchesDoctor && matchesDesignation && matchesDepartment && matchesStatus && matchesAmount;
    });

    this.applySorting();
  }

  applySorting(): void {
    switch (this.sortBy) {
      case 'recent':
        this.filteredDoctors = [...this.filteredDoctors].sort((a, b) => {
          const idA = a.id || 0;
          const idB = b.id || 0;
          return idB - idA;
        });
        break;
      case 'ascending':
        this.filteredDoctors = [...this.filteredDoctors].sort((a, b) => {
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;
      case 'descending':
        this.filteredDoctors = [...this.filteredDoctors].sort((a, b) => {
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          return nameB.localeCompare(nameA);
        });
        break;
    }
  }

  clearAllFilters(): void {
    this.doctorFilter = 'all';
    this.designationFilter = 'all';
    this.departmentFilter = 'all';
    this.dateFilter = '';
    this.amountFilter = 'all';
    this.statusFilter = 'all';
    this.applyFilters();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  getDepartment(doctor: Doctor): string {
    const spec = this.getSpecialization(doctor);
    const deptMap: { [key: string]: string } = {
      'Cardiology': 'Cardiology',
      'Orthopedics': 'Orthopedics',
      'Pediatrics': 'Pediatrics',
      'Neurology': 'Neurology',
      'Dermatology': 'Dermatology',
      'Radiology': 'Radiology',
      'Gynecology': 'Gynecology',
      'Psychiatry': 'Psychiatry',
      'Oncology': 'Oncology',
      'Pulmonology': 'Pulmonology',
      'Urology': 'Urology'
    };
    return deptMap[spec] || 'Cardiology';
  }

  getSpecialization(doctor: Doctor): string {
    if (doctor.specializations && doctor.specializations.length > 0) {
      if (typeof doctor.specializations[0] === 'object' && doctor.specializations[0].name) {
        return doctor.specializations[0].name;
      }
      if (typeof doctor.specializations[0] === 'string') {
        return doctor.specializations[0];
      }
    }
    if (doctor.department?.name) {
      return doctor.department.name;
    }
    return 'Cardiologist';
  }

  getAvailabilityStatus(doctor: Doctor): string {
    // Check if doctor has working days
    if (doctor.workingDays && doctor.workingDays.length > 0) {
      return 'Available';
    }
    return 'Unavailable';
    }

  getPriceNumber(doctor: Doctor): number {
    // Default price - can be enhanced with actual fee data
    return 500 + (doctor.id || 0) % 500;
  }

  getAvailabilityDays(doctor: Doctor): boolean[] {
    const days = [false, false, false, false, false, false, false]; // M T W T F S S
    if (doctor.workingDays) {
      doctor.workingDays.forEach(day => {
        const dayIndex = this.daysOfWeek.findIndex(d => d.toUpperCase().startsWith(day.toUpperCase().substring(0, 3)));
        if (dayIndex >= 0) {
          days[dayIndex] = true;
        }
      });
    }
    return days;
  }

  getAvatar(doctor: Doctor): string {
    if (doctor.photoUrl) {
      if (doctor.photoUrl.startsWith('data:image') || doctor.photoUrl.startsWith('http://') || doctor.photoUrl.startsWith('https://')) {
        return doctor.photoUrl;
      }
      if (doctor.photoUrl.length > 100) {
        return `data:image/jpeg;base64,${doctor.photoUrl}`;
      }
    }
    const doctorId = doctor.id || doctor.doctorCode;
    if (doctorId) {
      return `/api/doctors/${doctorId}/image`;
    }
    const initials = this.getInitials(doctor);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=5c6ac4&color=fff&size=200&bold=true`;
  }

  getInitials(doctor: Doctor): string {
    const first = doctor.firstName?.[0] ?? '';
    const last = doctor.lastName?.[0] ?? '';
    return `${first}${last}` || 'DR';
  }

  getCredentials(doctor: Doctor): string {
    const credentials: string[] = [];
    
    // Get degrees from educations
    if ((doctor as any).educations && Array.isArray((doctor as any).educations)) {
      (doctor as any).educations.forEach((edu: any) => {
        if (edu.degree) {
          credentials.push(edu.degree);
    }
      });
    }
    
    // Get certifications
    if ((doctor as any).certifications && Array.isArray((doctor as any).certifications)) {
      (doctor as any).certifications.forEach((cert: any) => {
        if (cert.name) {
          credentials.push(cert.name);
        }
      });
    }
    
    // If no credentials found, return default
    if (credentials.length === 0) {
      return 'MD'; // Default credential
    }
    
    // Return unique credentials joined by comma
    return [...new Set(credentials)].join(', ');
  }

  onImageError(event: Event, doctor: Doctor): void {
    const img = event.target as HTMLImageElement;
    const initials = this.getInitials(doctor);
    img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=5c6ac4&color=fff&size=200&bold=true`;
  }

  openScheduleModal(doctor: Doctor): void {
    this.selectedDoctor = doctor;
    this.showScheduleModal = true;
    this.loadDoctorSchedule(doctor);
  }

  closeScheduleModal(): void {
    this.showScheduleModal = false;
    this.selectedDoctor = null;
    this.initializeScheduleForm();
  }

  loadDoctorSchedule(doctor: Doctor): void {
    // Load existing schedule if available
    if (doctor.workingDays) {
      const schedulesArray = this.scheduleForm.get('schedules') as FormArray;
      schedulesArray.controls.forEach((dayGroup, index) => {
        const dayName = this.daysOfWeek[index];
        const isWorking = doctor.workingDays?.some(d => dayName.toUpperCase().startsWith(d.toUpperCase().substring(0, 3)));
        if (isWorking) {
          const sessionsArray = dayGroup.get('sessions') as FormArray;
          // Add default morning session
          sessionsArray.push(this.fb.group({
            type: ['Morning'],
            from: ['09:00'],
            to: ['12:00']
          }));
      }
    });
  }
  }

  addSession(dayIndex: number): void {
    const schedulesArray = this.scheduleForm.get('schedules') as FormArray;
    const dayGroup = schedulesArray.at(dayIndex);
    const sessionsArray = dayGroup.get('sessions') as FormArray;
    sessionsArray.push(this.fb.group({
      type: ['Morning'],
      from: [''],
      to: ['']
    }));
  }

  removeSession(dayIndex: number, sessionIndex: number): void {
    const schedulesArray = this.scheduleForm.get('schedules') as FormArray;
    const dayGroup = schedulesArray.at(dayIndex);
    const sessionsArray = dayGroup.get('sessions') as FormArray;
    sessionsArray.removeAt(sessionIndex);
  }

  getDaySessions(dayIndex: number): FormArray {
    const schedulesArray = this.scheduleForm.get('schedules') as FormArray;
    const dayGroup = schedulesArray.at(dayIndex);
    return dayGroup.get('sessions') as FormArray;
  }

  saveSchedule(): void {
    if (!this.selectedDoctor) return;

    const formValue = this.scheduleForm.value;
    const workingDays: string[] = [];
    
    formValue.schedules?.forEach((schedule: any, index: number) => {
      if (schedule.sessions && schedule.sessions.length > 0) {
        const dayName = this.daysOfWeek[index];
        workingDays.push(dayName.toUpperCase().substring(0, 3));
      }
    });

    // Update doctor with schedule
    const updatedDoctor: Doctor = {
      ...this.selectedDoctor,
      workingDays
    };

    const doctorId = this.selectedDoctor.id?.toString() || this.selectedDoctor.doctorCode;
    if (doctorId) {
      this.doctorService.update(doctorId, updatedDoctor).subscribe({
        next: () => {
          this.loadDoctors();
          this.closeScheduleModal();
        },
        error: (err) => {
          console.error('Error saving schedule:', err);
          alert('Error saving schedule. Please try again.');
        }
      });
    }
  }

  toggleExportMenu(): void {
    this.showExportMenu = !this.showExportMenu;
  }

  exportPDF(): void {
    // TODO: Implement PDF export
    console.log('Exporting to PDF...');
    this.showExportMenu = false;
  }

  exportExcel(): void {
    // TODO: Implement Excel export
    console.log('Exporting to Excel...');
    this.showExportMenu = false;
  }
}
