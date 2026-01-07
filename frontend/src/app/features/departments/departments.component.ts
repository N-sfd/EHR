import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentService } from '../../core/services/department.service';
import { Department, CreateDepartmentDto } from '../../core/models/department.model';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.css']
})
export class DepartmentsComponent implements OnInit {
  departments: Department[] = [];
  filteredDepartments: Department[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  searchTerm = '';
  
  // Modal states
  showAddModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedDepartment: Department | null = null;
  departmentToDelete: Department | null = null;
  
  // Form data
  formData: any = {
    name: '',
    code: '',
    type: '',
    description: '',
    phoneNumber: '',
    email: '',
    status: 'ACTIVE'
  };
  
  // Filters
  showFilters = false;
  departmentFilter = '';
  statusFilter = 'all';
  dateFilter = 'all';
  sortBy = 'Recent';
  
  // Available departments for filter
  availableDepartments: string[] = [];
  statuses = ['Active', 'Inactive'];

  constructor(private departmentService: DepartmentService) {}

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.isLoading = true;
    this.errorMessage = null;
    this.departmentService.getAll().subscribe({
      next: (departments) => {
        // Map backend fields to frontend model and remove duplicates
        const mapped = departments.map(dept => ({
          ...dept,
          id: dept.departmentId || dept.id,
          name: dept.name || '',
          code: dept.code || '',
          type: dept.type || '',
          status: dept.status || 'ACTIVE',
          createdAt: dept.createdAt || undefined
        }));
        // Remove duplicates by id
        this.departments = Array.from(
          new Map(mapped.map(dept => [dept.id, dept])).values()
        );
        this.filteredDepartments = this.departments;
        this.availableDepartments = [...new Set(this.departments.map(d => d.name))];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading departments:', err);
        if (err.status === 504 || err.status === 0) {
          this.errorMessage = 'Backend service is not running. Please start the staff-service on port 8082.';
        } else {
          this.errorMessage = 'Unable to load departments. Please try again.';
        }
        this.isLoading = false;
      }
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  openAddModal() {
    this.resetForm();
    this.errorMessage = null;
    this.showAddModal = true;
    // Focus on the name field after modal opens
    setTimeout(() => {
      const nameInput = document.querySelector('.modal-body input[name="name"]') as HTMLInputElement;
      if (nameInput) {
        nameInput.focus();
      }
    }, 100);
  }

  openEditModal(department: Department) {
    this.selectedDepartment = department;
    this.formData = {
      name: department.name || '',
      code: department.code || '',
      type: department.type || '',
      description: department.description || '',
      phoneNumber: department.phoneNumber || '',
      email: department.email || '',
      status: department.status || 'ACTIVE'
    };
    this.showEditModal = true;
  }

  openDeleteModal(department: Department) {
    this.departmentToDelete = department;
    this.showDeleteModal = true;
  }

  closeModals() {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedDepartment = null;
    this.departmentToDelete = null;
    this.errorMessage = null;
    this.resetForm();
  }

  resetForm() {
    this.formData = {
      name: '',
      code: '', // Hidden field, auto-generated or optional
      type: '', // Hidden field, optional
      description: '',
      phoneNumber: '', // Hidden field, optional
      email: '', // Hidden field, optional
      status: 'ACTIVE'
    };
  }

  saveDepartment() {
    // Prevent double submission
    if (this.isLoading) {
      return;
    }

    // Validate required fields - read directly from formData
    const nameValue = (this.formData.name || '').toString().trim();
    if (!nameValue) {
      this.errorMessage = 'Department name is required. Please enter a department name.';
      // Scroll to top of modal to show the error and field
      const modalBody = document.querySelector('.modal-body');
      if (modalBody) {
        modalBody.scrollTop = 0;
      }
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    
    // Ensure we have a valid name value
    const departmentData: CreateDepartmentDto = {
      name: nameValue,
      code: (this.formData.code || '').toString().trim() || undefined,
      type: (this.formData.type || '').toString().trim() || undefined,
      description: (this.formData.description || '').toString().trim() || undefined,
      phoneNumber: (this.formData.phoneNumber || '').toString().trim() || undefined,
      email: (this.formData.email || '').toString().trim() || undefined,
      status: (this.formData.status || 'ACTIVE').toString()
    };

    // Debug: Log the data being sent
    console.log('Form data:', this.formData);
    console.log('Sending department data:', JSON.stringify(departmentData, null, 2));

    if (this.showAddModal) {
      this.departmentService.create(departmentData).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeModals();
          this.loadDepartments();
        },
        error: (err) => {
          console.error('Error creating department:', err);
          this.isLoading = false;
          
          // Extract validation error message
          let errorMessage = 'Error creating department. Please try again.';
          
          // Backend returns errors as an object (Map), not array
          if (err?.error?.errors && typeof err.error.errors === 'object') {
            const errorObj = err.error.errors;
            const errorMessages = Object.entries(errorObj).map(([field, msg]) => {
              // Map field names to user-friendly labels
              const fieldLabels: { [key: string]: string } = {
                'name': 'Department Name',
                'code': 'Code',
                'type': 'Type',
                'description': 'Description',
                'phoneNumber': 'Phone Number',
                'email': 'Email',
                'status': 'Status'
              };
              const fieldLabel = fieldLabels[field] || field.charAt(0).toUpperCase() + field.slice(1);
              return `${fieldLabel}: ${msg}`;
            });
            errorMessage = errorMessages.join(', ');
          } else if (err?.error?.message) {
            errorMessage = err.error.message;
          } else if (err?.message) {
            errorMessage = err.message;
          }
          
          // Debug: Log the full error
          console.error('Full error response:', err);
          
          this.errorMessage = errorMessage;
          // Also show alert for visibility
          setTimeout(() => alert(errorMessage), 100);
        }
      });
    } else if (this.showEditModal && this.selectedDepartment) {
      const deptId = this.selectedDepartment.departmentId || this.selectedDepartment.id;
      if (!deptId) return;
      
      // Don't include departmentId in updateData - backend will use the ID from the path parameter
      const updateData: CreateDepartmentDto = {
        name: departmentData.name,
        code: departmentData.code,
        type: departmentData.type,
        description: departmentData.description,
        phoneNumber: departmentData.phoneNumber,
        email: departmentData.email,
        status: departmentData.status
      };
      
      this.departmentService.update(deptId, updateData).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeModals();
          this.loadDepartments();
        },
        error: (err) => {
          console.error('Error updating department:', err);
          this.isLoading = false;
          
          // Extract validation error message
          let errorMessage = 'Error updating department. Please try again.';
          
          // Backend returns errors as an object (Map), not array
          if (err?.error?.errors && typeof err.error.errors === 'object') {
            const errorObj = err.error.errors;
            const errorMessages = Object.entries(errorObj).map(([field, msg]) => {
              // Capitalize field name and show message
              const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
              return `${fieldName}: ${msg}`;
            });
            errorMessage = errorMessages.join(', ');
          } else if (err?.error?.message) {
            errorMessage = err.error.message;
          } else if (err?.message) {
            errorMessage = err.message;
          }
          
          this.errorMessage = errorMessage;
          // Also show alert for visibility
          setTimeout(() => alert(errorMessage), 100);
        }
      });
    }
  }

  deleteDepartment() {
    if (!this.departmentToDelete) return;
    
    const deptId = this.departmentToDelete.departmentId || this.departmentToDelete.id;
    if (!deptId) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.departmentService.delete(deptId).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeModals();
        this.loadDepartments();
      },
      error: (err) => {
        console.error('Error deleting department:', err);
        // Extract user-friendly error message
        let errorMessage = 'Error deleting department. Please try again.';
        
        // Try to get message from error response body first
        const errorBody = err?.error;
        if (errorBody?.message) {
          errorMessage = errorBody.message;
        } else {
          // Parse raw error message
          const rawMessage = err?.error?.error || err?.error || err?.message || JSON.stringify(err);
          const messageStr = typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage);
          
          // Check for foreign key constraint violations
          if (messageStr.includes('foreign key constraint') || 
              messageStr.includes('violates foreign key') ||
              messageStr.includes('still referenced from table') ||
              messageStr.includes('violates foreign key constraint') ||
              messageStr.includes('Key (') && messageStr.includes(') is still referenced')) {
            if (messageStr.includes('designations')) {
              errorMessage = 'Cannot delete this department because it is still being used by one or more designations. Please remove or reassign the designations first.';
            } else if (messageStr.includes('staff') || messageStr.includes('doctors')) {
              errorMessage = 'Cannot delete this department because it is still assigned to staff members. Please reassign the staff first.';
            } else {
              errorMessage = 'Cannot delete this department because it is still being used elsewhere in the system. Please remove all references first.';
            }
          } else if (messageStr.length < 500 && !messageStr.includes('could not execute batch')) {
            // Only use raw message if it's reasonably short (not a full stack trace or batch error)
            errorMessage = messageStr;
          }
        }
        
        this.errorMessage = errorMessage;
        this.isLoading = false;
        // Auto-hide error after 8 seconds
        setTimeout(() => {
          this.errorMessage = null;
        }, 8000);
      }
    });
  }

  applyFilters() {
    let filtered = [...this.departments];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(dept =>
        dept.name?.toLowerCase().includes(term) ||
        dept.code?.toLowerCase().includes(term) ||
        dept.description?.toLowerCase().includes(term)
      );
    }

    // Department filter
    if (this.departmentFilter) {
      filtered = filtered.filter(dept => dept.name === this.departmentFilter);
    }

    // Status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(dept => {
        const deptStatus = dept.status || 'ACTIVE';
        return deptStatus === this.statusFilter;
      });
    }

    // Date filter (simplified - you can enhance this)
    if (this.dateFilter !== 'all') {
      // Add date filtering logic here if needed
    }

    // Sort
    if (this.sortBy === 'Recent') {
      filtered.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    } else if (this.sortBy === 'Oldest') {
      filtered.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });
    }

    this.filteredDepartments = filtered;
  }

  clearFilters() {
    this.departmentFilter = '';
    this.statusFilter = 'all';
    this.dateFilter = 'all';
    this.searchTerm = '';
    this.applyFilters();
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d.getTime())) return '-';
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (e) {
      return '-';
    }
  }

  getDepartmentCode(department: Department): string {
    if (department.code && department.code.trim()) {
      return department.code;
    }
    // Generate code from name if not present
    if (department.name) {
      return department.name.toUpperCase().replace(/\s+/g, '_').substring(0, 20);
    }
    return '-';
  }

  getDepartmentType(department: Department): string {
    if (department.type && department.type.trim()) {
      return department.type;
    }
    // Infer type from name if type not set
    const name = (department.name || '').toLowerCase();
    if (name.includes('cardiology') || name.includes('surgery') || name.includes('emergency') || 
        name.includes('opd') || name.includes('icu') || name.includes('radiology') ||
        name.includes('laboratory') || name.includes('lab') || name.includes('pharmacy') ||
        name.includes('nursing') || name.includes('pharmacist')) {
      return 'CLINICAL';
    }
    if (name.includes('admin') || name.includes('hr') || name.includes('finance') || 
        name.includes('billing') || name.includes('accounting')) {
      return 'ADMIN';
    }
    if (name.includes('support') || name.includes('maintenance') || name.includes('housekeeping')) {
      return 'SUPPORT';
    }
    return 'CLINICAL'; // Default to CLINICAL
  }

  getTotalDepartments(): number {
    return this.departments.length;
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }
}

