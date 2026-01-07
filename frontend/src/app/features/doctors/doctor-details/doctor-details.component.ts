import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { switchMap, of, catchError } from 'rxjs';
import { DoctorService } from '../../../core/services/doctor.service';
import { Doctor } from '../../../core/models/doctor.model';

@Component({
  selector: 'app-doctor-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './doctor-details.component.html',
  styleUrls: ['./doctor-details.component.css']
})
export class DoctorDetailsComponent implements OnInit {
  doctor: Doctor | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  showImageModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id');
        if (!id) {
          this.errorMessage = 'Doctor ID is missing';
          return of(null);
        }
        this.isLoading = true;
        this.errorMessage = null;
        
        // Check if it's a numeric ID or a doctorCode
        const isNumericId = /^\d+$/.test(id);
        
        if (isNumericId) {
          // It's a numeric ID, use directly
          console.log('Loading doctor by numeric ID:', id);
          return this.doctorService.getById(id).pipe(
            catchError((err) => {
              console.error('Error loading doctor by ID:', err);
              this.errorMessage = `Failed to load doctor details. Error: ${err.error?.message || err.message || 'Unknown error'}`;
              return of(null);
            })
          );
        } else {
          // It's likely a doctorCode, need to find the numeric ID first
          console.log('Doctor ID appears to be doctorCode, searching for numeric ID:', id);
          return this.doctorService.getAll().pipe(
            switchMap((allDoctors) => {
              const foundDoctor = allDoctors.find(d => 
                d.doctorCode === id ||
                String(d.id) === id
              );
              if (foundDoctor && foundDoctor.id) {
                console.log('Found doctor with numeric ID:', foundDoctor.id);
                return this.doctorService.getById(String(foundDoctor.id)).pipe(
                  catchError((err) => {
                    console.error('Error loading doctor by ID:', err);
                    this.errorMessage = `Failed to load doctor details. Error: ${err.error?.message || err.message || 'Unknown error'}`;
                    return of(null);
                  })
                );
              } else {
                this.errorMessage = `Doctor with ID/Code "${id}" not found. Please check the ID and try again.`;
                return of(null);
              }
            }),
            catchError((err) => {
              console.error('Error searching for doctor:', err);
              this.errorMessage = `Failed to load doctor details. Error: ${err.error?.message || err.message || 'Unknown error'}`;
              return of(null);
            })
          );
        }
      })
    ).subscribe({
      next: (doctor) => {
        this.doctor = doctor;
        this.isLoading = false;
        if (!doctor) {
          // Error message already set in catchError
        }
      },
      error: (err) => {
        console.error('Unexpected error:', err);
        this.isLoading = false;
        this.errorMessage = 'Failed to load doctor details. Please try again.';
      }
    });
  }

  getSpecialization(): string {
    if (this.doctor?.specializations && this.doctor.specializations.length > 0) {
      // If it's an object with a name property, return the name
      if (typeof this.doctor.specializations[0] === 'object' && this.doctor.specializations[0].name) {
        return this.doctor.specializations[0].name;
      }
      // If it's already a string, return it
      if (typeof this.doctor.specializations[0] === 'string') {
        return this.doctor.specializations[0];
      }
      return 'General Practitioner';
    }
    // Fallback: use department if available
    if (this.doctor?.department?.name) {
      return this.doctor.department.name;
    }
    // Fallback: use hash of ID for consistent display (same as listing page)
    const id = this.doctor?.id || this.doctor?.doctorCode || '';
    if (id) {
      const specializations = ['Cardiology', 'Orthopedics', 'Pediatrics', 'Neurology', 'Dermatology', 'Radiology'];
      const hash = this.hashString(id.toString());
      return specializations[Math.abs(hash) % specializations.length];
    }
    return 'Cardiologist'; // Default fallback (same as listing page)
  }

  getInitials(): string {
    if (!this.doctor) return 'DR';
    const first = this.doctor.firstName?.[0] ?? '';
    const last = this.doctor.lastName?.[0] ?? '';
    return `${first}${last}`.toUpperCase() || 'DR';
  }

  getAvatar(): string {
    // Check if photoUrl exists and is a valid image
    if (this.doctor?.photoUrl) {
      // If it's already a data URL or HTTP URL, use it directly
      if (this.doctor.photoUrl.startsWith('data:image') || this.doctor.photoUrl.startsWith('http://') || this.doctor.photoUrl.startsWith('https://')) {
        return this.doctor.photoUrl;
      }
      // If it's a base64 string without prefix, add the prefix
      if (this.doctor.photoUrl.length > 100) {
        return `data:image/jpeg;base64,${this.doctor.photoUrl}`;
      }
    }
    // Use the image endpoint if doctor ID is available
    const id = this.doctor?.id || this.doctor?.doctorCode;
    if (id) {
      return `/api/doctors/${id}/image`;
    }
    // Fallback: Generate initials-based avatar with consistent styling
    const initials = this.getInitials();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=5c6ac4&color=fff&size=200&bold=true`;
  }

  getFullImageUrl(): string {
    // Use the same logic as getAvatar for consistency
    return this.getAvatar();
  }

  openImageModal(): void {
    this.showImageModal = true;
  }

  closeImageModal(): void {
    this.showImageModal = false;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const initials = this.getInitials();
    img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=5c6ac4&color=fff&size=200&bold=true`;
  }

  getFullAddress(): string {
    if (!this.doctor) return '-';
    const parts = [
      this.doctor.addressLine1,
      this.doctor.city,
      this.doctor.state,
      this.doctor.zipCode
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '-';
  }

  getYearsOfExperience(): string {
    // Calculate from license date or use default
    if (this.doctor?.licenseExpiry) {
      const licenseDate = new Date(this.doctor.licenseExpiry);
      const years = Math.floor((new Date().getTime() - licenseDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
      return years > 0 ? `${years}+ Years` : '15+ Years';
    }
    return '15+ Years';
  }

  getEducationList(): any[] {
    // Return education data if available, otherwise empty
    return [];
  }

  getAwardsList(): any[] {
    // Return awards data if available, otherwise empty
    return [];
  }

  getCertificationsList(): any[] {
    // Return certifications data if available, otherwise empty
    return [];
  }

  getFormattedDate(date: string | null | undefined): string {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '-';
    }
  }

  getBio(): string {
    if (this.doctor?.bio) {
      return this.doctor.bio;
    }
    const lastName = this.doctor?.lastName || '';
    return `Dr. ${lastName} has been practicing medicine for over 10 years. He/She has extensive experience in managing chronic illnesses, preventive care, and treating a wide range of medical conditions for patients of all ages.`;
  }

  hasExtendedBio(): boolean {
    return !!(this.doctor?.bio);
  }

  getAge(): string {
    if (!this.doctor?.dateOfBirth) return '-';
    try {
      const birthDate = new Date(this.doctor.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age > 0 ? age.toString() : '-';
    } catch {
      return '-';
    }
  }

  getDepartment(): string {
    if (this.doctor?.department?.name) {
      return this.doctor.department.name;
    }
    return this.getSpecialization() || '-';
  }

  getAppointmentCount(): number {
    // TODO: Get actual appointment count from service
    return 35; // Mock data
  }

  getConsultationFee(): string {
    // TODO: Get from doctor.consultationFee
    return '$499';
  }

  getCredentials(): string {
    if (!this.doctor) return '';
    // Get degrees and certifications from doctor data
    const credentials: string[] = [];
    
    // Check if doctor has degrees property (may not exist in model yet)
    if ((this.doctor as any).degrees && Array.isArray((this.doctor as any).degrees)) {
      credentials.push(...(this.doctor as any).degrees);
    }
    
    // Check if doctor has certifications property (may not exist in model yet)
    if ((this.doctor as any).certifications && Array.isArray((this.doctor as any).certifications)) {
      credentials.push(...(this.doctor as any).certifications.map((c: any) => c.name || c));
    }
    
    // Fallback to common medical degrees based on specialization
    if (credentials.length === 0) {
      const specialization = this.getSpecialization();
      credentials.push('MBBS', 'M.D', specialization);
    }
    
    return credentials.join(', ');
  }

  bookAppointment(): void {
    if (this.doctor?.id) {
      // Navigate to new appointment page with doctor pre-selected
      this.router.navigate(['/admin/appointments/new'], {
        queryParams: { doctorId: this.doctor.id }
      });
    } else {
      // Fallback if no doctor ID
      this.router.navigate(['/admin/appointments/new']);
    }
  }

  getLicenseStatus(): string {
    if (!this.doctor?.licenseExpiry) return 'Not Available';
    const expiry = new Date(this.doctor.licenseExpiry);
    const now = new Date();
    return expiry > now ? 'Active' : 'Expired';
  }

  getLicenseStatusClass(): string {
    const status = this.getLicenseStatus();
    if (status === 'Active') return 'in-norm';
    if (status === 'Expired') return 'above-norm';
    return 'in-norm';
  }

  getLicenseStatusText(): string {
    const status = this.getLicenseStatus();
    if (status === 'Active') return 'Valid';
    if (status === 'Expired') return 'Expired';
    return 'N/A';
  }

  getAppointmentHistory(): any[] {
    // TODO: Get actual appointment history from service
    // Mock data for now
    return [
      {
        id: 1,
        date: '20 Jan. 2023',
        patientName: 'John Doe',
        diagnosis: 'Routine Checkup',
        severity: 'Low',
        severityClass: 'low',
        totalVisits: 2,
        status: 'Completed',
        statusClass: 'cured'
      },
      {
        id: 2,
        date: '12 Jan. 2022',
        patientName: 'Jane Smith',
        diagnosis: 'Follow-up',
        severity: 'Low',
        severityClass: 'low',
        totalVisits: 1,
        status: 'Completed',
        statusClass: 'cured'
      },
      {
        id: 3,
        date: '20 Jan. 2021',
        patientName: 'Bob Johnson',
        diagnosis: 'Emergency',
        severity: 'High',
        severityClass: 'high',
        totalVisits: 6,
        status: 'Under Treatment',
        statusClass: 'under-treatment'
      }
    ];
  }

  downloadDocument(appointmentId: number): void {
    // TODO: Implement document download
    console.log('Download document for appointment:', appointmentId);
  }

  private hashString(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}
