import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DesignationService } from '../../core/services/designation.service';
import { Designation, CreateDesignationDto } from '../../core/models/designation.model';
import { DepartmentService } from '../../core/services/department.service';
import { Department } from '../../core/models/department.model';

@Component({
  selector: 'app-designations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './designations.component.html',
  styleUrls: ['./designations.component.css']
})
export class DesignationsComponent implements OnInit {
  designations: Designation[] = [];
  filteredDesignations: Designation[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  searchTerm = '';
  
  // Modal states
  showAddModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedDesignation: Designation | null = null;
  designationToDelete: Designation | null = null;
  
  // Form data
  formData: any = {
    title: '',
    code: '', // Hidden field
    category: '',
    departmentId: null,
    managerial: false, // Hidden field
    description: '',
    status: 'ACTIVE'
  };
  
  // Master data
  departments: Department[] = [];
  
  // Filters
  showFilters = false;
  statusFilter = 'all';
  sortBy = 'Recent';

  constructor(
    private designationService: DesignationService,
    private departmentService: DepartmentService
  ) {}

  ngOnInit() {
    this.loadDesignations();
    this.loadDepartments();
  }

  loadDepartments() {
    this.departmentService.getAll().subscribe({
      next: (depts) => {
        this.departments = depts.map(d => ({
          ...d,
          id: d.departmentId || d.id
        }));
      },
      error: (err) => console.error('Error loading departments:', err)
    });
  }

  loadDesignations() {
    this.isLoading = true;
    this.errorMessage = null;
    this.designationService.getAll().subscribe({
      next: (designations) => {
        this.designations = designations.map(des => ({
          ...des,
          id: des.designationId || des.id
        }));
        this.filteredDesignations = this.designations;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading designations:', err);
        if (err.status === 504 || err.status === 0) {
          this.errorMessage = 'Backend service is not running. Please start the staff-service on port 8082.';
        } else {
          this.errorMessage = 'Unable to load designations. Please try again.';
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
    setTimeout(() => {
      const titleInput = document.querySelector('.modal-body input[name="title"]') as HTMLInputElement;
      if (titleInput) {
        titleInput.focus();
      }
    }, 100);
  }

  openEditModal(designation: Designation) {
    this.selectedDesignation = designation;
    this.formData = {
      title: designation.title || '',
      code: designation.code || '', // Hidden field
      category: designation.category || '',
      departmentId: designation.departmentId || null,
      managerial: designation.managerial || false, // Hidden field
      description: designation.description || '', // Hidden field
      status: designation.status || 'ACTIVE'
    };
    this.showEditModal = true;
  }

  openDeleteModal(designation: Designation) {
    this.designationToDelete = designation;
    this.showDeleteModal = true;
  }

  closeModals() {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedDesignation = null;
    this.designationToDelete = null;
    this.errorMessage = null;
    this.resetForm();
  }

  resetForm() {
    this.formData = {
      title: '',
      code: '', // Hidden field
      category: '',
      departmentId: null,
      managerial: false, // Hidden field
      description: '', // Hidden field
      status: 'ACTIVE'
    };
  }

  saveDesignation() {
    if (this.isLoading) {
      return;
    }

    const titleValue = (this.formData.title || '').toString().trim();
    if (!titleValue) {
      this.errorMessage = 'Designation title is required. Please enter a title.';
      const modalBody = document.querySelector('.modal-body');
      if (modalBody) {
        modalBody.scrollTop = 0;
      }
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    
    const designationData: CreateDesignationDto = {
      title: titleValue,
      code: (this.formData.code || '').toString().trim() || undefined,
      category: (this.formData.category || '').toString().trim() || undefined,
      departmentId: this.formData.departmentId || undefined,
      managerial: this.formData.managerial || false,
      description: (this.formData.description || '').toString().trim() || undefined,
      status: (this.formData.status || 'ACTIVE').toString()
    };

    if (this.showAddModal) {
      this.designationService.create(designationData).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeModals();
          this.loadDesignations();
        },
        error: (err) => {
          console.error('Error creating designation:', err);
          this.isLoading = false;
          
          let errorMessage = 'Error creating designation. Please try again.';
          if (err?.error?.errors && typeof err.error.errors === 'object') {
            const errorObj = err.error.errors;
            const errorMessages = Object.entries(errorObj).map(([field, msg]) => {
              const fieldLabels: { [key: string]: string } = {
                'title': 'Title',
                'category': 'Category',
                'status': 'Status'
              };
              const fieldLabel = fieldLabels[field] || field.charAt(0).toUpperCase() + field.slice(1);
              return `${fieldLabel}: ${msg}`;
            });
            errorMessage = errorMessages.join(', ');
          } else if (err?.error?.message) {
            errorMessage = err.error.message;
          }
          
          this.errorMessage = errorMessage;
          setTimeout(() => alert(errorMessage), 100);
        }
      });
    } else if (this.showEditModal && this.selectedDesignation) {
      const desId = this.selectedDesignation.designationId || this.selectedDesignation.id;
      if (!desId) return;
      
      const updateData: Designation = {
        ...designationData,
        designationId: desId,
        id: desId
      };
      
      this.designationService.update(desId, updateData).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeModals();
          this.loadDesignations();
        },
        error: (err) => {
          console.error('Error updating designation:', err);
          this.isLoading = false;
          
          let errorMessage = 'Error updating designation. Please try again.';
          if (err?.error?.errors && typeof err.error.errors === 'object') {
            const errorObj = err.error.errors;
            const errorMessages = Object.entries(errorObj).map(([field, msg]) => {
              const fieldLabel = field.charAt(0).toUpperCase() + field.slice(1);
              return `${fieldLabel}: ${msg}`;
            });
            errorMessage = errorMessages.join(', ');
          } else if (err?.error?.message) {
            errorMessage = err.error.message;
          }
          
          this.errorMessage = errorMessage;
          setTimeout(() => alert(errorMessage), 100);
        }
      });
    }
  }

  deleteDesignation() {
    if (!this.designationToDelete) return;
    
    const desId = this.designationToDelete.designationId || this.designationToDelete.id;
    if (!desId) return;

    this.isLoading = true;
    this.designationService.delete(desId).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeModals();
        this.loadDesignations();
      },
      error: (err) => {
        console.error('Error deleting designation:', err);
        const errorMessage = err?.error?.message || err?.message || 'Error deleting designation. Please try again.';
        alert(errorMessage);
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.designations];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(des =>
        des.title?.toLowerCase().includes(term) ||
        des.code?.toLowerCase().includes(term) ||
        des.description?.toLowerCase().includes(term)
      );
    }

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(des => {
        const desStatus = des.status || 'ACTIVE';
        return desStatus === this.statusFilter;
      });
    }

    if (this.sortBy === 'Recent') {
      filtered.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    this.filteredDesignations = filtered;
  }

  clearFilters() {
    this.statusFilter = 'all';
    this.searchTerm = '';
    this.applyFilters();
  }

  getTotalDesignations(): number {
    return this.designations.length;
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  getFormattedDate(dateString?: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return '-';
    }
  }

  getDesignationCode(designation: Designation): string {
    if (designation.code && designation.code.trim()) {
      return designation.code;
    }
    // Generate code from title if not present
    if (designation.title) {
      return designation.title.toUpperCase().replace(/\s+/g, '_').substring(0, 20);
    }
    return '-';
  }

  getDesignationType(designation: Designation): string {
    if (designation.category && designation.category.trim()) {
      return designation.category;
    }
    // Default based on title if category not set
    const title = (designation.title || '').toLowerCase();
    if (title.includes('nurse') || title.includes('doctor') || title.includes('physician')) {
      return 'CLINICAL';
    }
    if (title.includes('admin') || title.includes('manager') || title.includes('director')) {
      return 'ADMIN';
    }
    return 'NON_CLINICAL';
  }
}

