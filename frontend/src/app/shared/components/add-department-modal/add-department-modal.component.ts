import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DepartmentService } from '../../../core/services/department.service';
import { Department, CreateDepartmentDto } from '../../../core/models/department.model';

@Component({
  selector: 'app-add-department-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-department-modal.component.html',
  styleUrls: ['./add-department-modal.component.css']
})
export class AddDepartmentModalComponent {
  private fb = inject(FormBuilder);
  private departmentService = inject(DepartmentService);

  @Output() departmentAdded = new EventEmitter<Department>();
  @Output() close = new EventEmitter<void>();

  isOpen = false;
  isSaving = false;
  errorMessage: string | null = null;

  form = this.fb.group({
    name: ['', Validators.required],
    code: [''],
    description: ['']
  });

  open() {
    this.isOpen = true;
    this.form.reset();
    this.errorMessage = null;
  }

  closeModal() {
    this.isOpen = false;
    this.form.reset();
    this.errorMessage = null;
    this.close.emit();
  }

  onSubmit(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.save();
  }

  save() {
    // Prevent double submission
    if (this.isSaving) {
      return;
    }

    // Mark all fields as touched to show validation errors
    this.form.markAllAsTouched();
    
    // Validate required fields - check form control directly
    const nameControl = this.form.get('name');
    const nameValue = nameControl?.value ? nameControl.value.toString().trim() : '';
    
    // Debug logging
    console.log('Form state:', {
      valid: this.form.valid,
      nameValue: nameValue,
      nameControlValue: nameControl?.value,
      nameControlValid: nameControl?.valid,
      nameControlErrors: nameControl?.errors
    });
    
    if (!nameValue || nameValue.length === 0) {
      this.errorMessage = 'Department name is required. Please enter a department name.';
      nameControl?.setErrors({ required: true });
      // Scroll to top of modal to show the error
      const modalBody = document.querySelector('.modal-body');
      if (modalBody) {
        modalBody.scrollTop = 0;
      }
      // Focus on the name field
      const nameInput = document.querySelector('input[formControlName="name"]') as HTMLInputElement;
      if (nameInput) {
        nameInput.focus();
      }
      return;
    }

    // Double-check form is valid
    if (this.form.invalid) {
      this.errorMessage = 'Please fill in all required fields.';
      const modalBody = document.querySelector('.modal-body');
      if (modalBody) {
        modalBody.scrollTop = 0;
      }
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;

    const department: CreateDepartmentDto = {
      name: nameValue,
      code: (this.form.value.code || '').toString().trim() || undefined,
      description: (this.form.value.description || '').toString().trim() || undefined,
      status: 'ACTIVE' // Default status
    };

    // Debug: Log the payload being sent
    console.log('Sending department data:', JSON.stringify(department, null, 2));

    this.departmentService.create(department).subscribe({
      next: (created) => {
        this.isSaving = false;
        this.departmentAdded.emit(created);
        this.closeModal();
      },
      error: (err) => {
        console.error('Error creating department', err);
        this.isSaving = false;
        
        // Extract validation error message
        let errorMessage = 'Unable to create department. Please try again.';
        
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
        
        this.errorMessage = errorMessage;
        // Scroll to top to show error
        setTimeout(() => {
          const modalBody = document.querySelector('.modal-body');
          if (modalBody) {
            modalBody.scrollTop = 0;
          }
        }, 100);
      }
    });
  }
}

