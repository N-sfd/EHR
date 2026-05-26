import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { StaffService } from '../../../core/services/staff.service';
import { MasterDataService } from '../../../core/services/master-data.service';
import { Staff } from '../../../core/models/staff.model';
import { DepartmentDto } from '../../../core/models/department.model';
import { DesignationDto } from '../../../core/models/designation.model';
import { MasterDepartment, MasterDesignation } from '../../../core/models/master-data.model';

@Component({
  selector: 'app-staff-directory',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './staff-directory.component.html',
  styleUrls: ['./staff-directory.component.css']
})
export class StaffDirectoryComponent implements OnInit {
  staffs: Staff[] = [];
  filteredStaffs: Staff[] = [];
  departments: DepartmentDto[] = [];
  designations: DesignationDto[] = [];
  
  // Search and filters
  searchTerm = '';
  departmentFilter = 'all';
  designationFilter = 'all';
  statusFilter = 'all';
  employmentTypeFilter = 'all';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  
  statuses = ['ACTIVE', 'INACTIVE', 'On Leave', 'Resigned'];
  employmentTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'];

  constructor(
    private staffService: StaffService,
    private masterDataService: MasterDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.errorMessage = null;
    
    // Load staff
    this.staffService.getAll().subscribe({
      next: (staffs) => {
        this.staffs = staffs;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading staff:', err);
        this.errorMessage = 'Failed to load staff. Please try again.';
        this.isLoading = false;
      }
    });
    
    // Load departments
    this.masterDataService.getDepartments().subscribe({
      next: (masterDepts: MasterDepartment[]) => {
        this.departments = masterDepts.map(dept => ({
          id: dept.id,
          departmentId: Number(dept.id) || undefined,
          name: dept.name,
          code: dept.code,
          description: dept.description,
          active: dept.active,
          status: dept.active ? 'ACTIVE' : 'INACTIVE',
          specialtyGroup: dept.specialtyGroup
        } as DepartmentDto));
      },
      error: (err) => {
        console.error('Error loading departments:', err);
        this.departments = [];
      }
    });
    
    // Load designations
    this.masterDataService.getDesignations().subscribe({
      next: (masterDes: MasterDesignation[]) => {
        const mapped = masterDes.map(d => ({
          id: Number(d.id) || undefined,
          designationId: Number(d.id) || undefined,
          title: d.name,
          code: d.code,
          description: d.description,
          status: d.active ? 'ACTIVE' : 'INACTIVE',
          active: d.active
        }));
        this.designations = Array.from(
          new Map(mapped.map(d => [d.id, d])).values()
        );
      },
      error: (err) => console.error('Error loading designations:', err)
    });
  }

  applyFilters() {
    let filtered = [...this.staffs];
    
    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(staff => 
        `${staff.firstName} ${staff.lastName}`.toLowerCase().includes(term) ||
        (staff.emailAddress || staff.email || '').toLowerCase().includes(term) ||
        (staff.phoneNumber || '').includes(term) ||
        (staff.staffCode || '').toLowerCase().includes(term)
      );
    }
    
    // Department filter
    if (this.departmentFilter !== 'all') {
      filtered = filtered.filter(staff => 
        (staff.department?.id || staff.departmentId)?.toString() === this.departmentFilter
      );
    }
    
    // Designation filter
    if (this.designationFilter !== 'all') {
      filtered = filtered.filter(staff => 
        (staff.designation?.id || staff.designationId || staff.jobId)?.toString() === this.designationFilter
      );
    }
    
    // Status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(staff => {
        const status = staff.status || staff.employmentStatus || 'ACTIVE';
        return status.toLowerCase() === this.statusFilter.toLowerCase();
      });
    }
    
    // Employment type filter
    if (this.employmentTypeFilter !== 'all') {
      filtered = filtered.filter(staff => 
        (staff.employmentType || 'FULL_TIME') === this.employmentTypeFilter
      );
    }
    
    this.filteredStaffs = filtered;
    this.totalPages = Math.ceil(this.filteredStaffs.length / this.itemsPerPage);
    this.currentPage = 1; // Reset to first page when filters change
  }

  onSearchChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  getInitials(staff: Staff): string {
    const first = staff.firstName?.[0] || 'S';
    const last = staff.lastName?.[0] || '';
    return `${first}${last}`.toUpperCase();
  }

  getStaffId(staff: Staff): string {
    return staff.staffCode || `S-${String(staff.id || 0).padStart(3, '0')}`;
  }

  getDepartmentName(staff: Staff): string {
    if (staff.department && typeof staff.department === 'object') {
      return staff.department.name || 'N/A';
    }
    const dept = this.departments.find(d => 
      (d.departmentId || d.id) === staff.departmentId
    );
    return dept?.name || 'N/A';
  }

  getDesignationName(staff: Staff): string {
    if (staff.designation && typeof staff.designation === 'object') {
      return staff.designation.title || 'N/A';
    }
    const des = this.designations.find(d => 
      (d.designationId || d.id) === staff.designationId || 
      (d.designationId || d.id) === staff.jobId
    );
    return des?.title || 'N/A';
  }

  getStatusBadge(staff: Staff): string {
    return staff.status || staff.employmentStatus || 'ACTIVE';
  }

  getStatusClass(status: string): string {
    const s = status.toLowerCase();
    if (s === 'active') return 'success';
    if (s === 'inactive') return 'muted';
    if (s.includes('leave')) return 'warning';
    if (s.includes('resigned')) return 'danger';
    return 'info';
  }

  getStaffImage(staff: Staff): string {
    if (staff.photoUrl) {
      // Handle base64 images - check if it's already a data URL or needs prefix
      if (staff.photoUrl.startsWith('data:image') || staff.photoUrl.startsWith('http://') || staff.photoUrl.startsWith('https://')) {
        return staff.photoUrl;
      } else {
        // Assume it's base64 without prefix, add data URL prefix
        return `data:image/jpeg;base64,${staff.photoUrl}`;
      }
    }
    const initials = this.getInitials(staff);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=059669&color=fff&size=100`;
  }

  onImageError(event: Event, staff: Staff) {
    const img = event.target as HTMLImageElement;
    const initials = this.getInitials(staff);
    img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=059669&color=fff&size=100`;
  }

  viewProfile(staff: Staff) {
    console.log('View profile clicked for staff:', staff);
    // Only use numeric ID - backend requires Long, not staffCode
    const id = staff.id;
    if (!id) {
      console.error('Cannot view staff: missing numeric id', staff);
      this.errorMessage = 'Cannot view staff: missing ID. Please refresh the page and try again.';
      setTimeout(() => this.errorMessage = null, 5000);
      return;
    }
    
    const idString = String(id);
    console.log('Navigating to profile with numeric id:', idString);
    this.router.navigate(['/admin/staffs/profile', idString]).then(
      (success) => {
        if (success) {
          console.log('Navigation successful to profile');
        } else {
          console.warn('Navigation returned false');
          this.errorMessage = 'Failed to navigate to staff profile. Route may not exist.';
          setTimeout(() => this.errorMessage = null, 5000);
        }
      },
      (err) => {
        console.error('Navigation failed:', err);
        this.errorMessage = 'Failed to navigate to staff profile: ' + (err.message || 'Unknown error');
        setTimeout(() => this.errorMessage = null, 5000);
      }
    );
  }

  editStaff(staff: Staff) {
    console.log('Edit staff clicked for staff:', staff);
    // Only use numeric ID - backend requires Long, not staffCode
    const id = staff.id;
    if (!id) {
      console.error('Cannot edit staff: missing numeric id', staff);
      this.errorMessage = 'Cannot edit staff: missing ID. Please refresh the page and try again.';
      setTimeout(() => this.errorMessage = null, 5000);
      return;
    }
    
    const idString = String(id);
    console.log('Navigating to edit with numeric id:', idString);
    this.router.navigate(['/admin/staffs/edit', idString]).then(
      (success) => {
        if (success) {
          console.log('Navigation successful to edit');
        } else {
          console.warn('Navigation returned false');
          this.errorMessage = 'Failed to navigate to edit staff. Route may not exist.';
          setTimeout(() => this.errorMessage = null, 5000);
        }
      },
      (err) => {
        console.error('Navigation failed:', err);
        this.errorMessage = 'Failed to navigate to edit staff: ' + (err.message || 'Unknown error');
        setTimeout(() => this.errorMessage = null, 5000);
      }
    );
  }

  deleteStaff(staff: Staff) {
    const staffName = `${staff.firstName} ${staff.lastName}`;
    if (!confirm(`Are you sure you want to delete ${staffName}? This action cannot be undone.`)) {
      return;
    }
    
    console.log('Delete staff clicked for:', staff);
    this.errorMessage = null;
    this.successMessage = null;
    
    // Only use numeric ID - backend requires Long, not staffCode
    const id = staff.id;
    if (!id) {
      console.error('Cannot delete staff: missing numeric id', staff);
      this.errorMessage = 'Cannot delete staff: missing ID. Please refresh the page and try again.';
      setTimeout(() => this.errorMessage = null, 5000);
      return;
    }
    
    const idString = String(id);
    console.log('Deleting staff with numeric id:', idString);
    
    this.isLoading = true;
    this.staffService.delete(idString).subscribe({
      next: () => {
        console.log('Staff deleted successfully');
        this.isLoading = false;
        this.successMessage = `${staffName} deleted successfully`;
        setTimeout(() => this.successMessage = null, 3000);
        this.loadData();
      },
      error: (err) => {
        console.error('Error deleting staff:', err);
        this.isLoading = false;
        this.errorMessage = err.error?.message || err.message || 'Failed to delete staff. Please try again.';
        setTimeout(() => this.errorMessage = null, 5000);
      }
    });
  }

  addStaff() {
    this.router.navigate(['/admin/staffs/add']);
  }

  // Pagination
  get paginatedStaffs(): Staff[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredStaffs.slice(start, end);
  }

  // Expose Math to template
  Math = Math;

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}

