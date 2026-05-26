import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ProviderTemplatesService } from '../services/provider-templates.service';
import { ProviderService } from '../../../core/services/provider.service';
import { ProviderMockService } from '../../../core/services/provider-mock.service';
import { MasterDataService } from '../../../core/services/master-data.service';
import { DepartmentService } from '../../../core/services/department.service';
import { ProviderTemplate, VisitType, NoteTemplate, OrderSet, OrderSetItem } from '../models/admin.model';
import { Provider } from '../../../core/models/provider.model';
import { Department } from '../../../core/models/department.model';
import { MasterDepartment } from '../../../core/models/master-data.model';
import { friendlyHttpError } from '../../../core/utils/http-error.util';
import { HttpErrorResponse } from '@angular/common/http';

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
  private masterDataService = inject(MasterDataService);
  private departmentService = inject(DepartmentService);
  private fb = inject(FormBuilder);

  templates: ProviderTemplate[] = [];
  selectedTemplate: ProviderTemplate | null = null;
  providers: Provider[] = [];
  filteredProviders: Provider[] = [];
  departments: Department[] = [];
  filteredDepartments: Department[] = [];
  isLoadingDepartments = false;
  departmentSearchQuery: string = '';
  
  activeTab: 'visitTypes' | 'noteTemplates' | 'orderSets' = 'visitTypes';
  
  visitTypeForm!: FormGroup;
  isEditingVisitType = false;
  editingVisitTypeId: number | null = null;
  
  orderSetForm!: FormGroup;
  isEditingOrderSet = false;
  editingOrderSetId: number | null = null;
  
  noteTemplateForm!: FormGroup;
  isEditingNoteTemplate = false;
  editingNoteTemplateId: number | null = null;
  
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
    this.initializeOrderSetForm();
    this.initializeNoteTemplateForm();
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

  initializeOrderSetForm(): void {
    this.orderSetForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      orders: this.fb.array([]),
      isActive: [true]
    });
  }

  initializeNoteTemplateForm(): void {
    this.noteTemplateForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      content: ['', Validators.required],
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
        this.errorMessage = null;
      },
      error: (err) => {
        console.error('[ProviderTemplatesComponent] Error loading providers:', err);
        this.errorMessage = friendlyHttpError(err);
        this.providers = [];
        this.filteredProviders = [];
        this.isLoadingProviders = false;
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
      (p.name ?? '').toLowerCase().includes(query) ||
      (p.specialty ?? '').toLowerCase().includes(query) ||
      (p.department ?? '').toLowerCase().includes(query)
    );
  }

  loadDepartments(): void {
    this.isLoadingDepartments = true;
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
        }));
        this.filteredDepartments = [...this.departments];
        this.isLoadingDepartments = false;
      },
      error: (err) => {
        console.error('Error loading departments:', err);
        this.departments = [];
        this.filteredDepartments = [];
        this.isLoadingDepartments = false;
      }
    });
  }

  seedDemoDepartments(): void {
    this.isLoadingDepartments = true;
    this.departmentService.seedDemoDepartments().subscribe({
      next: (departments: Department[]) => {
        this.departments = departments;
        this.filteredDepartments = [...this.departments];
        this.isLoadingDepartments = false;
      },
      error: () => {
        this.isLoadingDepartments = false;
      }
    });
  }

  onDepartmentSearch(): void {
    const query = this.departmentSearchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredDepartments = [...this.departments];
      return;
    }
    this.filteredDepartments = this.departments.filter(dept =>
      dept.name.toLowerCase().includes(query) ||
      (dept.code && dept.code.toLowerCase().includes(query)) ||
      (dept.specialtyGroup && dept.specialtyGroup.toLowerCase().includes(query))
    );
  }

  loadTemplates(): void {
    // This is called on init but templates are loaded per provider
    // No need to load all templates upfront
  }

  selectTemplate(providerId: number): void {
    this.selectedProviderId = providerId;
    const provider = this.providers.find(p => p.id === providerId);
    
    if (!provider) {
      console.error('[ProviderTemplatesComponent] Provider not found:', providerId);
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = null;
    this.selectedTemplate = null; // Clear previous template
    
    this.providerTemplatesService.getByProvider(providerId).subscribe({
      next: (template) => {
        this.selectedTemplate = {
          ...template,
          providerName: provider.name || template.providerName || `Provider ${providerId}`,
          visitTypes: template.visitTypes || [],
          noteTemplates: template.noteTemplates || [],
          orderSets: template.orderSets || []
        };
        this.isLoading = false;
        this.errorMessage = null;
      },
      error: (err) => {
        console.error('[ProviderTemplatesComponent] Error loading template:', err);
        // If 404, create empty template; otherwise show error
        if (err instanceof HttpErrorResponse && err.status === 404) {
          this.selectedTemplate = {
            id: undefined,
            providerId,
            providerName: provider.name || `Provider ${providerId}`,
            visitTypes: [],
            noteTemplates: [],
            orderSets: []
          };
          this.errorMessage = null;
        } else {
          this.errorMessage = friendlyHttpError(err);
          this.selectedTemplate = null;
        }
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
    // Convert department IDs to numbers if they're strings
    const allowedDeptIds = (formValue.allowedDepartments || []).map((id: string | number) => {
      const numId = Number(id);
      return isNaN(numId) ? id : numId;
    });
    
    const visitType: VisitType = {
      id: this.editingVisitTypeId || undefined,
      name: formValue.name,
      durationMinutes: formValue.durationMinutes,
      allowedDepartments: allowedDeptIds as number[],
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
    
    this.isEditingOrderSet = false;
    this.editingOrderSetId = null;
    this.orderSetForm.reset();
    this.clearOrderItems();
    
    this.isEditingNoteTemplate = false;
    this.editingNoteTemplateId = null;
    this.noteTemplateForm.reset();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.visitTypeForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getDepartmentId(dept: Department): number | undefined {
    const id = dept.id || dept.departmentId;
    if (id === undefined || id === null) return undefined;
    const numId = Number(id);
    return isNaN(numId) ? undefined : numId;
  }

  getDepartmentName(deptId: string | number): string {
    const dept = this.departments.find(d => String(this.getDepartmentId(d)) === String(deptId));
    return dept?.name || String(deptId);
  }

  isDepartmentSelected(deptId: string | number): boolean {
    const currentValue = this.visitTypeForm.get('allowedDepartments')?.value || [];
    return currentValue.includes(String(deptId)) || currentValue.includes(Number(deptId));
  }

  toggleDepartment(deptId: string | number): void {
    const currentValue = this.visitTypeForm.get('allowedDepartments')?.value || [];
    const deptIdStr = String(deptId);
    const deptIdNum = Number(deptId);
    
    let newValue: (string | number)[];
    if (this.isDepartmentSelected(deptId)) {
      newValue = currentValue.filter((id: string | number) => 
        String(id) !== deptIdStr && id !== deptIdNum
      );
    } else {
      newValue = [...currentValue, deptId];
    }
    
    this.visitTypeForm.patchValue({ allowedDepartments: newValue });
    this.visitTypeForm.get('allowedDepartments')?.markAsTouched();
  }

  removeDepartment(deptId: string | number): void {
    const currentValue = this.visitTypeForm.get('allowedDepartments')?.value || [];
    const deptIdStr = String(deptId);
    const deptIdNum = Number(deptId);
    const newValue = currentValue.filter((id: string | number) => 
      String(id) !== deptIdStr && id !== deptIdNum
    );
    this.visitTypeForm.patchValue({ allowedDepartments: newValue });
    this.visitTypeForm.get('allowedDepartments')?.markAsTouched();
  }

  getSelectedDepartments(): Department[] {
    const selectedIds = this.visitTypeForm.get('allowedDepartments')?.value || [];
    return this.departments.filter(dept => {
      const deptId = this.getDepartmentId(dept);
      return selectedIds.includes(String(deptId)) || selectedIds.includes(Number(deptId));
    });
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

  // Order Sets Management
  get orderItems(): FormArray {
    return this.orderSetForm.get('orders') as FormArray;
  }

  addOrderItem(): void {
    const orderItem = this.fb.group({
      orderType: ['', Validators.required],
      orderName: ['', Validators.required],
      frequency: [''],
      duration: ['']
    });
    this.orderItems.push(orderItem);
  }

  removeOrderItem(index: number): void {
    this.orderItems.removeAt(index);
  }

  clearOrderItems(): void {
    while (this.orderItems.length !== 0) {
      this.orderItems.removeAt(0);
    }
  }

  newOrderSet(): void {
    this.isEditingOrderSet = true;
    this.editingOrderSetId = null;
    this.clearOrderItems();
    this.orderSetForm.reset({
      name: '',
      category: '',
      orders: [],
      isActive: true
    });
    // Add one empty order item by default
    this.addOrderItem();
  }

  editOrderSet(orderSet: OrderSet): void {
    this.isEditingOrderSet = true;
    this.editingOrderSetId = orderSet.id || null;
    this.clearOrderItems();
    
    // Populate form
    this.orderSetForm.patchValue({
      name: orderSet.name,
      category: orderSet.category,
      isActive: orderSet.isActive
    });

    // Add order items
    if (orderSet.orders && orderSet.orders.length > 0) {
      orderSet.orders.forEach(item => {
        const orderItem = this.fb.group({
          orderType: [item.orderType, Validators.required],
          orderName: [item.orderName, Validators.required],
          frequency: [item.frequency || ''],
          duration: [item.duration || '']
        });
        this.orderItems.push(orderItem);
      });
    } else {
      // Add one empty order item if none exist
      this.addOrderItem();
    }
  }

  saveOrderSet(): void {
    if (this.orderSetForm.invalid || !this.selectedTemplate) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.orderSetForm.controls).forEach(key => {
        this.orderSetForm.get(key)?.markAsTouched();
      });
      this.orderItems.controls.forEach((control: any) => {
        if (control.controls) {
          Object.keys(control.controls).forEach(key => {
            control.get(key)?.markAsTouched();
          });
        }
      });
      return;
    }

    const formValue = this.orderSetForm.value;
    const orders: OrderSetItem[] = this.orderItems.controls.map(control => ({
      orderType: control.get('orderType')?.value || '',
      orderName: control.get('orderName')?.value || '',
      frequency: control.get('frequency')?.value || undefined,
      duration: control.get('duration')?.value || undefined
    })).filter(item => item.orderType && item.orderName); // Only include valid items

    const orderSet: OrderSet = {
      id: this.editingOrderSetId || undefined,
      name: formValue.name,
      category: formValue.category,
      orders: orders,
      isActive: formValue.isActive
    };

    // Update local template
    if (this.selectedTemplate) {
      if (this.editingOrderSetId) {
        const index = this.selectedTemplate.orderSets.findIndex(os => os.id === this.editingOrderSetId);
        if (index > -1) {
          this.selectedTemplate.orderSets[index] = orderSet;
        }
      } else {
        orderSet.id = Math.floor(Math.random() * 10000);
        this.selectedTemplate.orderSets.push(orderSet);
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
          console.error('Error saving order set:', err);
          this.errorMessage = 'Failed to save order set';
          this.isLoading = false;
        }
      });
    }
  }

  deleteOrderSet(orderSetId: number): void {
    if (confirm('Are you sure you want to delete this order set?')) {
      if (this.selectedTemplate) {
        this.selectedTemplate.orderSets = this.selectedTemplate.orderSets.filter(
          os => os.id !== orderSetId
        );

        // Save to service
        this.isLoading = true;
        this.providerTemplatesService.save(this.selectedTemplate.providerId, this.selectedTemplate).subscribe({
          next: (saved) => {
            this.selectedTemplate = saved;
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error deleting order set:', err);
            this.errorMessage = 'Failed to delete order set';
            this.isLoading = false;
          }
        });
      }
    }
  }

  isOrderSetFieldInvalid(fieldName: string): boolean {
    const field = this.orderSetForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isOrderItemFieldInvalid(index: number, fieldName: string): boolean {
    const item = this.orderItems.at(index);
    const field = item?.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Note Templates Management
  newNoteTemplate(): void {
    this.isEditingNoteTemplate = true;
    this.editingNoteTemplateId = null;
    this.noteTemplateForm.reset({
      name: '',
      category: '',
      content: '',
      isActive: true
    });
  }

  editNoteTemplate(noteTemplate: NoteTemplate): void {
    this.isEditingNoteTemplate = true;
    this.editingNoteTemplateId = noteTemplate.id || null;
    this.noteTemplateForm.patchValue({
      name: noteTemplate.name,
      category: noteTemplate.category,
      content: noteTemplate.content,
      isActive: noteTemplate.isActive
    });
  }

  saveNoteTemplate(): void {
    if (this.noteTemplateForm.invalid || !this.selectedTemplate) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.noteTemplateForm.controls).forEach(key => {
        this.noteTemplateForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.noteTemplateForm.value;
    const noteTemplate: NoteTemplate = {
      id: this.editingNoteTemplateId || undefined,
      name: formValue.name,
      category: formValue.category,
      content: formValue.content,
      isActive: formValue.isActive
    };

    // Update local template
    if (this.selectedTemplate) {
      if (this.editingNoteTemplateId) {
        const index = this.selectedTemplate.noteTemplates.findIndex(nt => nt.id === this.editingNoteTemplateId);
        if (index > -1) {
          this.selectedTemplate.noteTemplates[index] = noteTemplate;
        }
      } else {
        noteTemplate.id = Math.floor(Math.random() * 10000);
        this.selectedTemplate.noteTemplates.push(noteTemplate);
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
          console.error('Error saving note template:', err);
          this.errorMessage = 'Failed to save note template';
          this.isLoading = false;
        }
      });
    }
  }

  deleteNoteTemplate(noteTemplateId: number): void {
    if (confirm('Are you sure you want to delete this note template?')) {
      if (this.selectedTemplate) {
        this.selectedTemplate.noteTemplates = this.selectedTemplate.noteTemplates.filter(
          nt => nt.id !== noteTemplateId
        );

        // Save to service
        this.isLoading = true;
        this.providerTemplatesService.save(this.selectedTemplate.providerId, this.selectedTemplate).subscribe({
          next: (saved) => {
            this.selectedTemplate = saved;
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error deleting note template:', err);
            this.errorMessage = 'Failed to delete note template';
            this.isLoading = false;
          }
        });
      }
    }
  }

  isNoteTemplateFieldInvalid(fieldName: string): boolean {
    const field = this.noteTemplateForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}

