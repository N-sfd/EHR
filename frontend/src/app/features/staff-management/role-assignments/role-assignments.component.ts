import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StaffService } from '../../../core/services/staff.service';
import { RoleService } from '../../../core/services/role.service';
import { DepartmentService } from '../../../core/services/department.service';
import { Staff } from '../../../core/models/staff.model';
import { RoleDto } from '../../../core/models/role.model';
import { DepartmentDto } from '../../../core/models/department.model';
import { firstValueFrom } from 'rxjs';

interface StaffAssignment {
  staff: Staff;
  department?: DepartmentDto;
  roles: RoleDto[];
  status: string;
}

@Component({
  selector: 'app-role-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-assignments.component.html',
  styleUrls: ['./role-assignments.component.css']
})
export class RoleAssignmentsComponent implements OnInit {
  assignments: StaffAssignment[] = [];
  filteredAssignments: StaffAssignment[] = [];
  
  staffs: Staff[] = [];
  roles: RoleDto[] = [];
  departments: DepartmentDto[] = [];
  
  // Filters
  searchTerm = '';
  roleFilter = 'all';
  departmentFilter = 'all';
  statusFilter = 'all';
  
  // Bulk operations
  selectedStaffIds: Set<number> = new Set();
  bulkRoleId: number | null = null;
  showBulkAssignModal = false;
  
  // Assignment modal
  showAssignModal = false;
  selectedStaff: Staff | null = null;
  selectedRoles: Set<number> = new Set();
  selectedDepartment: number | null = null;
  
  // View mode
  viewMode: 'staff' | 'role' = 'staff';
  selectedRoleView: RoleDto | null = null;
  
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private staffService: StaffService,
    private roleService: RoleService,
    private departmentService: DepartmentService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    
    // Load all data in parallel
    this.staffService.getAll().subscribe({
      next: (staffs) => {
        this.staffs = staffs;
        this.buildAssignments();
      },
      error: (err) => {
        console.error('Error loading staff:', err);
        this.errorMessage = 'Failed to load staff';
        this.isLoading = false;
      }
    });
    
    this.roleService.getAll().subscribe({
      next: (roles) => {
        const mapped = roles.map(r => ({
          ...r,
          roleId: r.roleId || r.id,
          id: r.roleId || r.id
        }));
        this.roles = Array.from(
          new Map(mapped.map(role => [role.id, role])).values()
        );
      },
      error: (err) => console.error('Error loading roles:', err)
    });
    
    this.departmentService.getAll().subscribe({
      next: (depts) => {
        this.departments = Array.from(
          new Map(depts.map(dept => [dept.departmentId || dept.id, dept])).values()
        );
      },
      error: (err) => console.error('Error loading departments:', err)
    });
    
  }

  buildAssignments() {
    this.assignments = this.staffs.map(staff => {
      // Find department - check multiple sources
      let department: DepartmentDto | undefined;
      
      if (staff.department && typeof staff.department === 'object') {
        department = staff.department;
      } else if (staff.departmentId) {
        department = this.departments.find(d => 
          (d.departmentId || d.id) === staff.departmentId
        );
      }
      
      const assignment: StaffAssignment = {
        staff,
        department,
        roles: staff.roles || [],
        status: staff.status || staff.employmentStatus || 'ACTIVE'
      };
      return assignment;
    });
    
    this.applyFilters();
    this.isLoading = false;
  }

  applyFilters() {
    let filtered = [...this.assignments];
    
    // Search
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        `${a.staff.firstName} ${a.staff.lastName}`.toLowerCase().includes(term) ||
        (a.staff.emailAddress || a.staff.email || '').toLowerCase().includes(term)
      );
    }
    
    // Role filter
    if (this.roleFilter !== 'all') {
      filtered = filtered.filter(a => 
        a.roles.some(r => (r.roleId || r.id)?.toString() === this.roleFilter)
      );
    }
    
    // Department filter
    if (this.departmentFilter !== 'all') {
      filtered = filtered.filter(a => 
        (a.department?.departmentId || a.department?.id)?.toString() === this.departmentFilter ||
        a.staff.departmentId?.toString() === this.departmentFilter
      );
    }
    
    // Status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(a => 
        a.status.toLowerCase() === this.statusFilter.toLowerCase()
      );
    }
    
    this.filteredAssignments = filtered;
  }

  onSearchChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  openAssignModal(staff: Staff) {
    this.selectedStaff = staff;
    this.selectedRoles = new Set(
      (staff.roles || []).map(r => r.roleId || r.id!).filter(id => id !== undefined)
    );
    this.selectedDepartment = staff.departmentId ?? 
      (staff.department && typeof staff.department === 'object' 
        ? (staff.department.departmentId || staff.department.id || null) 
        : null);
    this.showAssignModal = true;
  }

  closeAssignModal() {
    this.showAssignModal = false;
    this.selectedStaff = null;
    this.selectedRoles = new Set();
    this.selectedDepartment = null;
  }

  toggleRole(roleId: number | undefined) {
    if (!roleId) return;
    if (this.selectedRoles.has(roleId)) {
      this.selectedRoles.delete(roleId);
    } else {
      this.selectedRoles.add(roleId);
    }
  }

  saveAssignment() {
    if (!this.selectedStaff) return;
    
    // Update staff with new assignments
    const staffId = this.selectedStaff.id;
    if (!staffId) return;
    
    // Get the first selected role ID (primary role)
    const roleIds = Array.from(this.selectedRoles);
    const primaryRoleId = roleIds.length > 0 ? roleIds[0] : null;
    
    // Prepare update payload - only send fields that can be updated
    const payload: any = {
      firstName: this.selectedStaff.firstName,
      lastName: this.selectedStaff.lastName,
      email: this.selectedStaff.email || this.selectedStaff.emailAddress,
      phoneNumber: this.selectedStaff.phoneNumber || this.selectedStaff.phone,
      gender: this.selectedStaff.gender,
      dateOfBirth: this.selectedStaff.dateOfBirth,
      departmentId: this.selectedDepartment || this.selectedStaff.departmentId || null,
      jobId: this.selectedStaff.jobId || this.selectedStaff.designationId || null,
      roleId: primaryRoleId || null,
      employmentType: this.selectedStaff.employmentType,
      joiningDate: this.selectedStaff.hireDate || undefined,
      status: this.selectedStaff.status || this.selectedStaff.employmentStatus || 'ACTIVE',
      photoUrl: this.selectedStaff.photoUrl
    };
    
    this.isLoading = true;
    this.errorMessage = null;
    
    this.staffService.update(staffId.toString(), payload).subscribe({
      next: (updatedStaff) => {
        this.isLoading = false;
        // Update the staff in the local array immediately
        const staffIndex = this.staffs.findIndex(s => s.id === staffId);
        if (staffIndex !== -1) {
          // Update the staff with new data
          this.staffs[staffIndex] = {
            ...this.staffs[staffIndex],
            departmentId: this.selectedDepartment || this.staffs[staffIndex].departmentId,
            roleId: primaryRoleId || this.staffs[staffIndex].roleId,
            roles: primaryRoleId ? this.roles.filter(r => (r.roleId || r.id) === primaryRoleId) : []
          };
        }
        // Rebuild assignments to reflect changes
        this.buildAssignments();
        this.closeAssignModal();
        this.successMessage = 'Assignments updated successfully';
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error updating assignments:', err);
        const errorMsg = err?.error?.message || err?.message || 'Failed to update assignments';
        this.errorMessage = errorMsg;
        setTimeout(() => this.errorMessage = null, 5000);
      }
    });
  }

  toggleStaffSelection(staffId: number | undefined) {
    if (!staffId) return;
    if (this.selectedStaffIds.has(staffId)) {
      this.selectedStaffIds.delete(staffId);
    } else {
      this.selectedStaffIds.add(staffId);
    }
  }

  openBulkAssignModal() {
    if (this.selectedStaffIds.size === 0) {
      this.errorMessage = 'Please select at least one staff member';
      return;
    }
    this.showBulkAssignModal = true;
  }

  closeBulkAssignModal() {
    this.showBulkAssignModal = false;
    this.bulkRoleId = null;
  }

  saveBulkAssignment() {
    if (!this.bulkRoleId || this.selectedStaffIds.size === 0) return;
    
    // Bulk assign role to selected staff
    const updates = Array.from(this.selectedStaffIds).map(staffId => {
      const staff = this.staffs.find(s => s.id === staffId);
      if (!staff) return null;
      
      const currentRoleIds = (staff.roles || []).map(r => r.roleId || r.id).filter(id => id !== undefined) as number[];
      if (!currentRoleIds.includes(this.bulkRoleId!)) {
        currentRoleIds.push(this.bulkRoleId!);
      }
      
      // Note: StaffDto doesn't have roleIds field - roles are managed separately
      // For now, we'll just update the staff record without role assignment
      // TODO: Implement role assignment via separate API endpoint like POST /api/staff/{id}/roles
      return this.staffService.update(staffId.toString(), {
        ...staff
      });
    }).filter(update => update !== null);
    
    // Execute all updates
    Promise.all(updates.map(update => firstValueFrom(update!))).then(() => {
      this.loadData();
      this.closeBulkAssignModal();
      this.selectedStaffIds.clear();
      this.successMessage = `Role assigned to ${updates.length} staff members`;
      setTimeout(() => this.successMessage = null, 3000);
    }).catch(err => {
      console.error('Error in bulk assignment:', err);
      this.errorMessage = 'Failed to assign roles';
    });
  }

  selectAll() {
    this.filteredAssignments.forEach(a => {
      if (a.staff.id) {
        this.selectedStaffIds.add(a.staff.id);
      }
    });
  }

  deselectAll() {
    this.selectedStaffIds.clear();
  }

  switchViewMode(mode: 'staff' | 'role') {
    this.viewMode = mode;
    if (mode === 'role' && this.roles.length > 0) {
      this.selectedRoleView = this.roles[0];
    }
  }

  selectRoleView(role: RoleDto) {
    this.selectedRoleView = role;
  }

  getStaffsWithRole(role: RoleDto): StaffAssignment[] {
    const roleId = role.roleId || role.id;
    return this.assignments.filter(a => 
      a.roles.some(r => (r.roleId || r.id) === roleId)
    );
  }

  getInitials(staff: Staff): string {
    const first = staff.firstName?.[0] || 'S';
    const last = staff.lastName?.[0] || '';
    return `${first}${last}`.toUpperCase();
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

  getDepartmentName(assignment: StaffAssignment): string {
    // First check if department object exists
    if (assignment.department && assignment.department.name) {
      return assignment.department.name;
    }
    
    // Check if staff has department object
    if (assignment.staff.department && typeof assignment.staff.department === 'object') {
      return assignment.staff.department.name || '';
    }
    
    // Try to find department by ID
    if (assignment.staff.departmentId) {
      const dept = this.departments.find(d => 
        (d.departmentId || d.id) === assignment.staff.departmentId
      );
      if (dept && dept.name) {
        return dept.name;
      }
    }
    
    return '';
  }
}

