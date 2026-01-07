import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ProviderTemplatesService } from '../services/provider-templates.service';
import { ProviderService } from '../../../core/services/provider.service';
import { ProviderMockService } from '../../../core/services/provider-mock.service';
import { DepartmentService } from '../../../core/services/department.service';
import { ProviderTemplate, VisitType, NoteTemplate, OrderSet } from '../models/admin.model';
import { Provider } from '../../../core/models/provider.model';
import { Department } from '../../../core/models/department.model';

@Component({
  selector: 'app-provider-templates',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './provider-templates.component.html',
  styleUrls: ['./provider-templates.component.scss']
})
export class ProviderTemplatesComponent implements OnInit {
  private providerTemplatesService = inject(ProviderTemplatesService);
  private providerService = inject(ProviderService);
  private providerMockService = inject(ProviderMockService);
  private departmentService = inject(DepartmentService);
  private fb = inject(FormBuilder);

  templates: ProviderTemplate[] = [];
  selectedTemplate: ProviderTemplate | null = null;
  providers: Provider[] = [];
  filteredProviders: Provider[] = [];
  departments: Department[] = [];
  
  activeTab: 'visitTypes' | 'noteTemplates' | 'orderSets' = 'visitTypes';
  
  visitTypeForm!: FormGroup;
  isEditingVisitType = false;
  editingVisitTypeId: number | null = null;
  
  isLoading = false;
  isLoadingProviders = true;
  errorMessage: string | null = null;
  providerSearchQuery: string = '';
  selectedProviderId: number | null = null;

  ngOnInit(): void {
    this.loadProviders();
    this.loadDepartments();
    this.loadTemplates();
    this.initializeVisitTypeForm();
  }

  initializeVisitTypeForm(): void {
    this.visitTypeForm = this.fb.group({
      name: ['', Validators.required],
      durationMinutes: [30, [Validators.required, Validators.min(10), Validators.max(120)]],
      allowedDepartments: [[], Validators.required],
      defaultProviderType: ['PHYSICIAN'],
      requiredResources: [''],
      allowOverbook: [false],
      isActive: [true]
    });
  }

  loadProviders(): void {
    this.isLoadingProviders = true;
    this.errorMessage = null;
    
    this.providerService.getProviders().subscribe({
      next: (providers) => {
        this.providers = providers ?? [];
        this.filteredProviders = [...this.providers];
        this.isLoadingProviders = false;
      },
      error: (err) => {
        console.error('Error loading providers:', err);
        this.errorMessage = 'Failed to load providers';
        // Fallback to mock
        this.providerMockService.getProviders().subscribe({
          next: (mockProviders) => {
            this.providers = mockProviders ?? [];
            this.filteredProviders = [...this.providers];
            this.isLoadingProviders = false;
          },
          error: () => {
            this.providers = [];
            this.filteredProviders = [];
            this.isLoadingProviders = false;
          }
        });
      }
    });
  }

  seedDemoProviders(): void {
    this.isLoadingProviders = true;
    this.providerService.seedDemoProviders().subscribe({
      next: (providers) => {
        this.providers = providers;
        this.filteredProviders = [...this.providers];
        this.isLoadingProviders = false;
        this.errorMessage = null;
      },
      error: () => {
        this.isLoadingProviders = false;
        this.errorMessage = 'Failed to seed demo providers';
      }
    });
  }

  onProviderSearch(): void {
    const query = this.providerSearchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredProviders = [...this.providers];
      return;
    }
    this.filteredProviders = this.providers.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.specialty.toLowerCase().includes(query) ||
      p.department.toLowerCase().includes(query)
    );
  }

  loadDepartments(): void {
    this.departmentService.getAll().subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (err) => {
        console.error('Error loading departments:', err);
      }
    });
  }

  loadTemplates(): void {
    this.isLoading = true;
    this.providerTemplatesService.getAll().subscribe({
      next: (templates) => {
        this.templates = templates;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading templates:', err);
        this.isLoading = false;
      }
    });
  }

  selectTemplate(providerId: number): void {
    this.selectedProviderId = providerId;
    const provider = this.providers.find(p => p.id === providerId);
    
    this.isLoading = true;
    this.errorMessage = null;
    
    this.providerTemplatesService.getByProvider(providerId).subscribe({
      next: (template) => {
        this.selectedTemplate = {
          ...template,
          providerName: provider?.name || template.providerName || `Provider ${providerId}`
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading template:', err);
        // Create empty template if not found
        this.selectedTemplate = {
          id: undefined,
          providerId,
          providerName: provider?.name || `Provider ${providerId}`,
          visitTypes: [],
          noteTemplates: [],
          orderSets: []
        };
        this.isLoading = false;
      }
    });
  }

  onTabChange(tab: 'visitTypes' | 'noteTemplates' | 'orderSets'): void {
    this.activeTab = tab;
    this.cancelEdit();
  }

  // Visit Types Management
  editVisitType(visitType: VisitType): void {
    this.isEditingVisitType = true;
    this.editingVisitTypeId = visitType.id || null;
    this.visitTypeForm.patchValue({
      name: visitType.name,
      durationMinutes: visitType.durationMinutes,
      allowedDepartments: visitType.allowedDepartments || [],
      defaultProviderType: visitType.defaultProviderType || 'PHYSICIAN',
      requiredResources: visitType.requiredResources?.join(', ') || '',
      allowOverbook: visitType.allowOverbook,
      isActive: visitType.isActive
    });
  }

  newVisitType(): void {
    this.isEditingVisitType = true;
    this.editingVisitTypeId = null;
    this.visitTypeForm.reset({
      name: '',
      durationMinutes: 30,
      allowedDepartments: [],
      defaultProviderType: 'PHYSICIAN',
      requiredResources: '',
      allowOverbook: false,
      isActive: true
    });
  }

  saveVisitType(): void {
    if (this.visitTypeForm.invalid || !this.selectedTemplate) {
      return;
    }

    const formValue = this.visitTypeForm.value;
    const visitType: VisitType = {
      id: this.editingVisitTypeId || undefined,
      name: formValue.name,
      durationMinutes: formValue.durationMinutes,
      allowedDepartments: formValue.allowedDepartments,
      defaultProviderType: formValue.defaultProviderType,
      requiredResources: formValue.requiredResources 
        ? formValue.requiredResources.split(',').map((r: string) => r.trim()).filter((r: string) => r)
        : [],
      allowOverbook: formValue.allowOverbook,
      isActive: formValue.isActive
    };

    // Update local template
    if (this.selectedTemplate) {
      if (this.editingVisitTypeId) {
        const index = this.selectedTemplate.visitTypes.findIndex(vt => vt.id === this.editingVisitTypeId);
        if (index > -1) {
          this.selectedTemplate.visitTypes[index] = visitType;
        }
      } else {
        visitType.id = Math.floor(Math.random() * 10000);
        this.selectedTemplate.visitTypes.push(visitType);
      }

      // Save to service
      this.isLoading = true;
      this.providerTemplatesService.save(this.selectedTemplate.providerId, this.selectedTemplate).subscribe({
        next: (saved) => {
          this.selectedTemplate = saved;
          this.isLoading = false;
          this.cancelEdit();
        },
        error: (err) => {
          console.error('Error saving visit type:', err);
          this.errorMessage = 'Failed to save visit type';
          this.isLoading = false;
        }
      });
    }
  }

  deleteVisitType(visitTypeId: number): void {
    if (confirm('Are you sure you want to delete this visit type?')) {
      if (this.selectedTemplate) {
        this.selectedTemplate.visitTypes = this.selectedTemplate.visitTypes.filter(
          vt => vt.id !== visitTypeId
        );

        // Save to service
        this.isLoading = true;
        this.providerTemplatesService.save(this.selectedTemplate.providerId, this.selectedTemplate).subscribe({
          next: (saved) => {
            this.selectedTemplate = saved;
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error deleting visit type:', err);
            this.errorMessage = 'Failed to delete visit type';
            this.isLoading = false;
          }
        });
      }
    }
  }

  cancelEdit(): void {
    this.isEditingVisitType = false;
    this.editingVisitTypeId = null;
    this.visitTypeForm.reset();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.visitTypeForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getDepartmentId(dept: Department): number | undefined {
    return dept.id || dept.departmentId;
  }

  onDepartmentToggle(deptId: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const currentValue = this.visitTypeForm.get('allowedDepartments')?.value || [];
    let newValue: number[];
    
    if (checkbox.checked) {
      newValue = [...currentValue, deptId];
    } else {
      newValue = currentValue.filter((id: number) => id !== deptId);
    }
    
    this.visitTypeForm.patchValue({ allowedDepartments: newValue });
  }

  getProviderAvatar(provider: Provider): string {
    if (provider.imageUrl || provider.photoUrl) {
      return provider.imageUrl || provider.photoUrl || '';
    }
    // Generate avatar from initials
    const initials = provider.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=004f4f&color=fff&size=100&bold=true`;
  }

  onImageError(event: Event, provider: Provider): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      // Fallback to initials-based avatar
      const initials = provider.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=004f4f&color=fff&size=100&bold=true`;
    }
  }
}

