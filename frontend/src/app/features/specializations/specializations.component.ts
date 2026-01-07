import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpecializationService } from '../../core/services/specialization.service';
import { Specialization, CreateSpecializationDto } from '../../core/models/specialization.model';

@Component({
  selector: 'app-specializations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './specializations.component.html',
  styleUrls: ['./specializations.component.css']
})
export class SpecializationsComponent implements OnInit {
  specializations: Specialization[] = [];
  filteredSpecializations: Specialization[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  searchTerm = '';
  
  // Modal states
  showAddModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedSpecialization: Specialization | null = null;
  specializationToDelete: Specialization | null = null;
  
  // Form data
  formData: any = {
    name: '',
    code: '', // Hidden field
    departmentId: null, // Hidden field
    description: '', // Hidden field
    status: 'ACTIVE'
  };
  
  // Filters
  showFilters = false;
  statusFilter = 'all';
  sortBy = 'Recent';

  constructor(private specializationService: SpecializationService) {}

  ngOnInit() {
    this.loadSpecializations();
  }

  loadSpecializations() {
    this.isLoading = true;
    this.errorMessage = null;
    this.specializationService.getAll().subscribe({
      next: (specializations) => {
        this.specializations = specializations.map(s => ({
          ...s,
          id: s.specializationId || s.id
        }));
        this.filteredSpecializations = this.specializations;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading specializations:', err);
        if (err.status === 504 || err.status === 0) {
          this.errorMessage = 'Backend service is not running. Please start the staff-service on port 8082.';
        } else {
          this.errorMessage = 'Unable to load specializations. Please try again.';
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
      const nameInput = document.querySelector('.modal-body input[name="name"]') as HTMLInputElement;
      if (nameInput) {
        nameInput.focus();
      }
    }, 100);
  }

  openEditModal(specialization: Specialization) {
    this.selectedSpecialization = specialization;
    this.formData = {
      name: specialization.name || '',
      code: specialization.code || '', // Hidden field
      departmentId: specialization.departmentId || null, // Hidden field
      description: specialization.description || '', // Hidden field
      status: specialization.status || 'ACTIVE'
    };
    this.showEditModal = true;
  }

  openDeleteModal(specialization: Specialization) {
    this.specializationToDelete = specialization;
    this.showDeleteModal = true;
  }

  closeModals() {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedSpecialization = null;
    this.specializationToDelete = null;
    this.errorMessage = null;
    this.resetForm();
  }

  resetForm() {
    this.formData = {
      name: '',
      code: '', // Hidden field
      departmentId: null, // Hidden field
      description: '', // Hidden field
      status: 'ACTIVE'
    };
  }

  saveSpecialization() {
    if (this.isLoading) {
      return;
    }

    const nameValue = (this.formData.name || '').toString().trim();
    if (!nameValue) {
      this.errorMessage = 'Specialization name is required. Please enter a specialization name.';
      const modalBody = document.querySelector('.modal-body');
      if (modalBody) {
        modalBody.scrollTop = 0;
      }
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    
    const specializationData: CreateSpecializationDto = {
      name: nameValue,
      code: (this.formData.code || '').toString().trim() || undefined,
      departmentId: this.formData.departmentId || undefined,
      description: (this.formData.description || '').toString().trim() || undefined,
      status: (this.formData.status || 'ACTIVE').toString()
    };

    if (this.showAddModal) {
      this.specializationService.create(specializationData).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeModals();
          this.loadSpecializations();
        },
        error: (err) => {
          console.error('Error creating specialization:', err);
          this.isLoading = false;
          
          let errorMessage = 'Error creating specialization. Please try again.';
          if (err?.error?.errors && typeof err.error.errors === 'object') {
            const errorObj = err.error.errors;
            const errorMessages = Object.entries(errorObj).map(([field, msg]) => {
              const fieldLabels: { [key: string]: string } = {
                'name': 'Specialization Name',
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
    } else if (this.showEditModal && this.selectedSpecialization) {
      const specId = this.selectedSpecialization.specializationId || this.selectedSpecialization.id;
      if (!specId) return;
      
      const updateData: Specialization = {
        ...specializationData,
        specializationId: specId,
        id: specId
      };
      
      this.specializationService.update(specId, updateData).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeModals();
          this.loadSpecializations();
        },
        error: (err) => {
          console.error('Error updating specialization:', err);
          this.isLoading = false;
          
          let errorMessage = 'Error updating specialization. Please try again.';
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

  deleteSpecialization() {
    if (!this.specializationToDelete) return;
    
    const specId = this.specializationToDelete.specializationId || this.specializationToDelete.id;
    if (!specId) return;

    this.isLoading = true;
    this.specializationService.delete(specId).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeModals();
        this.loadSpecializations();
      },
      error: (err) => {
        console.error('Error deleting specialization:', err);
        const errorMessage = err?.error?.message || err?.message || 'Error deleting specialization. Please try again.';
        alert(errorMessage);
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.specializations];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(spec =>
        spec.name?.toLowerCase().includes(term) ||
        spec.code?.toLowerCase().includes(term) ||
        spec.description?.toLowerCase().includes(term)
      );
    }

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(spec => {
        const specStatus = spec.status || 'ACTIVE';
        return specStatus === this.statusFilter;
      });
    }

    if (this.sortBy === 'Recent') {
      // Sort by name if createdAt is not available
      filtered.sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }

    this.filteredSpecializations = filtered;
  }

  clearFilters() {
    this.statusFilter = 'all';
    this.searchTerm = '';
    this.applyFilters();
  }

  getTotalSpecializations(): number {
    return this.specializations.length;
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }
}

