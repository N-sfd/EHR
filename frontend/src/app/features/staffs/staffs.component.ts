import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { StaffService } from '../../core/services/staff.service';
import { Staff } from '../../core/models/staff.model';

@Component({
  selector: 'app-staffs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './staffs.component.html',
  styleUrls: ['./staffs.component.css']
})
export class StaffsComponent implements OnInit {
  staffs: Staff[] = [];
  filteredStaffs: Staff[] = [];
  searchTerm = '';
  departmentFilter = 'all';
  statusFilter = 'all';
  isLoading = false;
  errorMessage: string | null = null;
  placeholders = Array.from({ length: 6 });

  departments = ['Front Office', 'Pharmacy', 'Billing', 'Nursing', 'Diagnostics', 'Operations'];
  statuses = ['Active', 'On Leave', 'Onboarding', 'Inactive'];

  constructor(
    private staffService: StaffService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStaffs();
  }

  loadStaffs() {
    this.isLoading = true;
    this.staffService.getAll().subscribe({
      next: (staffs) => {
        this.staffs = staffs;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading staff', err);
        this.errorMessage = 'Unable to load staff data.';
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    const term = this.searchTerm?.toLowerCase() ?? '';
    this.filteredStaffs = this.staffs.filter((staff) => {
      const matchesSearch = !term
        ? true
        : `${staff.firstName ?? ''} ${staff.lastName ?? ''}`.toLowerCase().includes(term) ||
          staff.emailAddress?.toLowerCase().includes(term);

      const matchesDept = this.departmentFilter === 'all'
        ? true
        : this.getDepartment(staff) === this.departmentFilter;

      const matchesStatus = this.statusFilter === 'all'
        ? true
        : this.getStatusBadge(staff) === this.statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  getDepartment(staff: Staff): string {
    // Check if department object exists
    if (staff.department && typeof staff.department === 'object') {
      return staff.department.name || 'N/A';
    }
    if (staff.departmentId !== undefined && staff.departmentId !== null) {
      const index = staff.departmentId % this.departments.length;
      return this.departments[index];
    }
    const hash = this.hashString(`${staff.firstName}${staff.lastName}` || '');
    return this.departments[Math.abs(hash) % this.departments.length];
  }

  getStatusBadge(staff: Staff): string {
    if (staff.status) {
      return staff.status === 'ACTIVE' ? 'Active' : 'Inactive';
    }
    if (staff.employmentStatus) {
      return staff.employmentStatus;
    }
    const hash = this.hashString(`${staff.firstName}${staff.lastName}` || '');
    return this.statuses[Math.abs(hash) % this.statuses.length];
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Active':
        return 'success';
      case 'On Leave':
        return 'warning';
      case 'Onboarding':
        return 'info';
      default:
        return 'muted';
    }
  }

  getInitials(staff: Staff): string {
    const first = staff.firstName?.[0] ?? 'S';
    const last = staff.lastName?.[0] ?? '';
    return `${first}${last}`.toUpperCase();
  }

  getStaffId(staff: Staff): string {
    if (staff.staffCode) {
      return staff.staffCode;
    }
    if (staff.id) {
      return `S-${String(staff.id).padStart(3, '0')}`;
    }
    const hash = Math.abs(this.hashString(`${staff.firstName}${staff.lastName}` || ''));
    return `STF${String(hash).padStart(6, '0').slice(0, 6)}`;
  }

  getRole(staff: Staff): string {
    // Check if designation object exists
    if (staff.designation && typeof staff.designation === 'object') {
      return staff.designation.title || 'N/A';
    }
    // Check if designation is a string
    if (typeof staff.designation === 'string') {
      return staff.designation;
    }
    // Fallback to role if available
    if (staff.roles && staff.roles.length > 0) {
      return staff.roles[0].name || 'N/A';
    }
    return 'N/A';
  }

  getStaffImage(staff: Staff): string {
    if (staff.photoUrl) {
      return staff.photoUrl;
    }
    // Return professional staff image placeholder
    const index = this.staffs.indexOf(staff) % 10;
    return `https://i.pravatar.cc/150?img=${21 + index}`;
  }

  onImageError(event: Event, staff: Staff) {
    const img = event.target as HTMLImageElement;
    const initials = this.getInitials(staff);
    img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=5c6ac4&color=fff&size=100`;
  }

  viewDetails(staff: Staff) {
    // Only use numeric ID - backend requires Long, not staffCode
    const id = staff.id;
    if (!id) {
      console.error('Cannot view staff: missing numeric id', staff);
      return;
    }
    this.router.navigate(['/admin/staffs/profile', String(id)]);
  }

  editStaff(staff: Staff) {
    // Only use numeric ID - backend requires Long, not staffCode
    const id = staff.id;
    if (!id) {
      console.error('Cannot edit staff: missing numeric id', staff);
      this.errorMessage = 'Cannot edit staff: missing ID. Please refresh the page and try again.';
      setTimeout(() => this.errorMessage = null, 5000);
      return;
    }
    this.router.navigate(['/admin/staffs/edit', String(id)]);
  }

  deleteStaff(staff: Staff) {
    const staffName = `${staff.firstName} ${staff.lastName}`;
    if (!confirm(`Are you sure you want to delete ${staffName}? This action cannot be undone.`)) {
      return;
    }
    
    // Only use numeric ID - backend requires Long, not staffCode
    const id = staff.id;
    if (!id) {
      console.error('Cannot delete staff: missing numeric id', staff);
      alert('Cannot delete staff: missing ID. Please refresh the page and try again.');
      return;
    }
    
    console.log('Deleting staff with numeric id:', id);
    this.staffService.delete(String(id)).subscribe({
      next: () => {
        console.log('Staff deleted successfully');
        this.loadStaffs();
      },
      error: (err) => {
        console.error('Error deleting staff:', err);
        alert(err.error?.message || err.message || 'Error deleting staff. Please try again.');
      }
    });
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
