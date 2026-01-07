import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../core/services/doctor.service';
import { Doctor } from '../../core/models/doctor.model';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.css']
})
export class DoctorsComponent implements OnInit {
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  displayedDoctors: Doctor[] = [];
  displayedCount = 12;
  searchTerm: string = '';
  specializationFilter = 'all';
  statusFilter = 'all';
  doctorFilter = 'all';
  designationFilter = 'all';
  departmentFilter = 'all';
  dateFilter = 'all';
  amountFilter = 'all';
  isLoading = false;
  errorMessage: string | null = null;
  loadingPlaceholders = Array.from({ length: 4 });
  openDoctorId: string | null = null;
  highlightedIndex: number | null = null;
  viewMode: 'grid' | 'list' = 'grid';
  showFilters = false;
  editingDoctorId: string | null = null;
  editingDoctor: Doctor | null = null;
  openActionMenuId: string | null = null;

  specializations = ['Cardiology', 'Orthopedics', 'Pediatrics', 'Neurology', 'Dermatology', 'Radiology', 'Surgery', 'Oncology', 'Gynecology'];
  designations = ['Cardiologist', 'Orthopedic Surgeon', 'Pediatrician', 'Gynecologist', 'Psychiatrist', 'Neurosurgeon', 'Oncologist', 'Pulmonologist', 'Urologist', 'Surgeon', 'Dermatologist'];
  departments = ['Cardiology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Psychiatry', 'Neurology', 'Oncology', 'Pulmonology', 'Urology'];
  uniqueDoctors: string[] = [];

  constructor(
    private doctorService: DoctorService,
    private router: Router
  ) {}

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  ngOnInit() {
    this.loadDoctors();
    // Close action menu when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.card-actions')) {
        this.openActionMenuId = null;
      }
      // Also handle existing openDoctorId
      if (this.openDoctorId) {
        if (!target.closest('.card-menu')) {
          this.openDoctorId = null;
        }
      }
    });
  }

  loadDoctors() {
    this.isLoading = true;
    this.doctorService.getAll().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.filteredDoctors = doctors;
        this.uniqueDoctors = [...new Set(doctors.map(d => `Dr. ${d.firstName || ''} ${d.lastName || ''}`))];
        this.displayedCount = 12;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading doctors:', err);
        if (err.status === 504 || err.status === 0) {
          this.errorMessage = 'Backend service is not running. Please start the staff-service on port 8082.';
        } else {
          this.errorMessage = 'Unable to load doctors right now.';
        }
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    const term = this.searchTerm?.toLowerCase() ?? '';
    this.filteredDoctors = this.doctors.filter((doctor) => {
      const doctorName = `Dr. ${doctor.firstName ?? ''} ${doctor.lastName ?? ''}`;
      const matchesSearch = !term
        ? true
        : doctorName.toLowerCase().includes(term) ||
          doctor.licenseNumber?.toLowerCase().includes(term);

      const matchesDoctor = this.doctorFilter === 'all' || doctorName === this.doctorFilter;
      const matchesDesignation = this.designationFilter === 'all' || this.getSpecialization(doctor) === this.designationFilter;
      const matchesDepartment = this.departmentFilter === 'all' || this.getDepartment(doctor) === this.departmentFilter;
      const matchesStatus = this.statusFilter === 'all' || this.getAvailabilityStatus(doctor) === this.statusFilter;
      
      // Specialization filter (for tabs)
      const doctorSpecialization = this.getSpecialization(doctor);
      const matchesSpecialization = this.specializationFilter === 'all' || 
        doctorSpecialization.toLowerCase().includes(this.specializationFilter.toLowerCase()) ||
        this.specializationFilter.toLowerCase().includes(doctorSpecialization.toLowerCase());
      
      // Amount filter
      const price = this.getPriceNumber(doctor);
      let matchesAmount = true;
      if (this.amountFilter === '200-500') {
        matchesAmount = price >= 200 && price <= 500;
      } else if (this.amountFilter === '501-1000') {
        matchesAmount = price >= 501 && price <= 1000;
      } else if (this.amountFilter === '1000+') {
        matchesAmount = price > 1000;
      }

      return matchesSearch && matchesDoctor && matchesDesignation && matchesDepartment && matchesStatus && matchesAmount && matchesSpecialization;
    });
    
    this.displayedCount = 12;
    this.updateDisplayedDoctors();
  }

  updateDisplayedDoctors() {
    this.displayedDoctors = this.filteredDoctors.slice(0, this.displayedCount);
  }

  loadMore() {
    this.displayedCount += 12;
    this.updateDisplayedDoctors();
  }

  getPriceNumber(doctor: Doctor): number {
    return 200; // Default price - can be enhanced with actual fee data
  }

  clearAllFilters() {
    this.doctorFilter = 'all';
    this.designationFilter = 'all';
    this.departmentFilter = 'all';
    this.statusFilter = 'all';
    this.dateFilter = 'all';
    this.amountFilter = 'all';
    this.searchTerm = '';
    this.applyFilters();
  }

  toggleFilters() {
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
      'Radiology': 'Radiology'
    };
    return deptMap[spec] || 'Cardiology';
  }

  getAvailabilityStatus(doctor: Doctor): string {
    const status = this.getLicenseStatus(doctor);
    return status === 'Active' ? 'Available' : 'Unavailable';
  }

  toggleMenu(doctorId: string) {
    this.openDoctorId = this.openDoctorId === doctorId ? null : doctorId;
  }

  onImageError(event: Event, doctor: Doctor): void {
    const img = event.target as HTMLImageElement;
    const initials = this.getInitials(doctor);
    img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=5c6ac4&color=fff&size=200&bold=true`;
  }

  getRating(doctor: Doctor): string {
    // Return default rating - can be enhanced with actual rating data
    return '4.5';
  }

  getAddress(doctor: Doctor): string {
    return doctor.addressLine1 || '1288 Natalie Brook Apt. 966';
  }

  viewAvailability(doctor: Doctor) {
    const doctorId = doctor.id || doctor.doctorCode;
    if (doctorId) {
      this.router.navigate(['/admin/doctors/schedule'], { queryParams: { doctorId: doctorId.toString() } });
    }
  }

  makeCall(doctor: Doctor) {
    const phone = doctor.phoneNumber || '';
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      alert('Phone number not available for this doctor.');
    }
  }

  onSearchChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  toggleActionMenu(doctor: Doctor, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    // Use numeric ID for menu tracking
    const doctorId = doctor.id?.toString() || '';
    if (this.openActionMenuId === doctorId) {
      this.openActionMenuId = null;
    } else {
      this.openActionMenuId = doctorId;
    }
  }

  startEdit(doctor: Doctor) {
    this.openActionMenuId = null;
    // Only use numeric ID - backend requires Long, not doctorCode
    const doctorId = doctor.id;
    if (!doctorId) {
      console.error('Cannot edit doctor: missing numeric id', doctor);
      this.errorMessage = 'Cannot edit doctor: missing ID. Please refresh the page and try again.';
      setTimeout(() => this.errorMessage = null, 5000);
      return;
    }
    this.router.navigate(['/admin/doctors/edit', doctorId.toString()]);
  }

  cancelEdit() {
    this.editingDoctorId = null;
    this.editingDoctor = null;
  }

  saveChanges(doctor: Doctor) {
    if (!this.editingDoctor || (!this.editingDoctor.id && !this.editingDoctor.doctorCode)) {
      return;
    }

    this.isLoading = true;
    
    // Update doctor directly (all fields are in Doctor now)
    const doctorId = this.editingDoctor.id || this.editingDoctor.doctorCode;
    this.doctorService.update(
      doctorId!.toString(),
      this.editingDoctor
    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.cancelEdit();
        this.loadDoctors();
      },
      error: (err) => {
        console.error('Error saving changes:', err);
        this.isLoading = false;
        alert('Error saving changes. Please try again.');
      }
    });
  }

  deleteDoctor(doctor: Doctor) {
    const doctorName = `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`;
    if (!confirm(`Are you sure you want to delete ${doctorName}? This action cannot be undone.`)) {
      return;
    }
    
    // Only use numeric ID - backend requires Long, not doctorCode
    const id = doctor.id;
    if (!id) {
      console.error('Cannot delete doctor: missing numeric id', doctor);
      this.errorMessage = 'Cannot delete doctor: missing ID. Please refresh the page and try again.';
      setTimeout(() => this.errorMessage = null, 5000);
      return;
    }
    
    console.log('Deleting doctor with numeric id:', id);
    this.doctorService.delete(String(id)).subscribe({
      next: () => {
        console.log('Doctor deleted successfully');
        this.loadDoctors();
        this.openActionMenuId = null;
      },
      error: (err) => {
        console.error('Error deleting doctor:', err);
        this.errorMessage = err.error?.message || err.message || 'Error deleting doctor. Please try again.';
        setTimeout(() => this.errorMessage = null, 5000);
      }
    });
  }

  getLicenseStatus(doctor: Doctor): 'Active' | 'Expiring Soon' | 'Expired' {
    if (!doctor.licenseExpiry) {
      return 'Expired';
    }
    const expiry = new Date(doctor.licenseExpiry);
    const now = new Date();
    const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays < 0) {
      return 'Expired';
    }
    if (diffDays <= 60) {
      return 'Expiring Soon';
    }
    return 'Active';
  }

  getStatusBadgeClass(status: string) {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Expiring Soon':
        return 'warning';
      default:
        return 'danger';
    }
  }

  getInitials(doctor: Doctor): string {
    const first = doctor.firstName?.[0] ?? '';
    const last = doctor.lastName?.[0] ?? '';
    return `${first}${last}` || 'DR';
  }

  getAvatar(doctor: Doctor): string {
    // Check if photoUrl exists and is a valid image
    if (doctor.photoUrl) {
      // If it's already a data URL or HTTP URL, use it directly
      if (doctor.photoUrl.startsWith('data:image') || doctor.photoUrl.startsWith('http://') || doctor.photoUrl.startsWith('https://')) {
        return doctor.photoUrl;
      }
      // If it's a base64 string without prefix, add the prefix
      if (doctor.photoUrl.length > 100) {
        return `data:image/jpeg;base64,${doctor.photoUrl}`;
      }
    }
    // Use the image endpoint if doctor ID is available
    const doctorId = doctor.id || doctor.doctorCode;
    if (doctorId) {
      return `/api/doctors/${doctorId}/image`;
    }
    // Fallback: Generate initials-based avatar with consistent styling
    const initials = this.getInitials(doctor);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=5c6ac4&color=fff&size=200&bold=true`;
  }

  getDoctorCode(doctor: Doctor): string {
    return doctor.doctorCode || '';
  }

  getSpecialization(doctor: Doctor): string {
    if (doctor.specializations && doctor.specializations.length > 0) {
      // If it's an object with a name property, return the name
      if (typeof doctor.specializations[0] === 'object' && doctor.specializations[0].name) {
        return doctor.specializations[0].name;
      }
      // If it's already a string, return it
      if (typeof doctor.specializations[0] === 'string') {
        return doctor.specializations[0];
      }
    }
    // Fallback: use department if available
    if (doctor.department?.name) {
      return doctor.department.name;
    }
    // Fallback: use hash of ID for consistent display (same as details page)
    const id = doctor.id || doctor.doctorCode || '';
    if (id) {
      const specializations = ['Cardiology', 'Orthopedics', 'Pediatrics', 'Neurology', 'Dermatology', 'Radiology'];
      const hash = this.hashString(id.toString());
      return specializations[Math.abs(hash) % specializations.length];
    }
    return 'Cardiologist'; // Default fallback
  }

  private hashString(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  getNextAvailability(doctor: Doctor): string {
    // Return default availability - can be enhanced with actual schedule data
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return `Mon, ${date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  }

  getStartingFee(doctor: Doctor): string {
    // Return default fee - can be enhanced with actual fee data
    return '$200';
  }


  goToEdit(id?: string) {
    if (!id) return;
    this.router.navigate(['/admin/doctors/edit', id]);
  }

  viewDoctorProfile(doctor: Doctor) {
    // Only use numeric ID - backend requires Long, not doctorCode
    const doctorId = doctor.id;
    if (!doctorId) {
      console.error('Cannot view doctor profile: missing numeric id', doctor);
      this.errorMessage = 'Cannot view doctor profile: missing ID. Please refresh the page and try again.';
      setTimeout(() => this.errorMessage = null, 5000);
      return;
    }
    this.router.navigate(['/admin/doctors/profile', doctorId.toString()]);
  }
}
