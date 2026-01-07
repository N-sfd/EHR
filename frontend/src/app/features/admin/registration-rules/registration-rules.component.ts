import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../services/admin.service';
import { RegistrationRule } from '../models/admin.model';

@Component({
  selector: 'app-registration-rules',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registration-rules.component.html',
  styleUrls: ['./registration-rules.component.scss']
})
export class RegistrationRulesComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);

  rules: RegistrationRule[] = [];
  selectedRule: RegistrationRule | null = null;
  
  ruleForm!: FormGroup;
  isEditing = false;
  isLoading = false;
  errorMessage: string | null = null;

  ruleTypes = [
    { value: 'INSURANCE', label: 'Insurance' },
    { value: 'CONSENT', label: 'Consent' },
    { value: 'DEMOGRAPHICS', label: 'Demographics' },
    { value: 'GUARANTOR', label: 'Guarantor' },
    { value: 'OTHER', label: 'Other' }
  ];

  actions = [
    { value: 'BLOCK', label: 'Block', description: 'Prevent action' },
    { value: 'WARN', label: 'Warn', description: 'Show warning' },
    { value: 'REQUIRE', label: 'Require', description: 'Require field' }
  ];

  operators = [
    { value: 'EQUALS', label: 'Equals' },
    { value: 'NOT_EQUALS', label: 'Not Equals' },
    { value: 'EXISTS', label: 'Exists' },
    { value: 'NOT_EXISTS', label: 'Not Exists' },
    { value: 'GREATER_THAN', label: 'Greater Than' },
    { value: 'LESS_THAN', label: 'Less Than' }
  ];

  ngOnInit(): void {
    this.loadRules();
    this.initializeForm();
  }

  initializeForm(): void {
    this.ruleForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      ruleType: ['INSURANCE', Validators.required],
      condition: this.fb.group({
        field: ['', Validators.required],
        operator: ['EQUALS', Validators.required],
        value: ['']
      }),
      action: ['BLOCK', Validators.required],
      isActive: [true],
      priority: [1, [Validators.required, Validators.min(1)]]
    });
  }

  loadRules(): void {
    this.isLoading = true;
    this.adminService.getRegistrationRules().subscribe({
      next: (rules) => {
        this.rules = rules.sort((a, b) => a.priority - b.priority);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading registration rules:', err);
        this.errorMessage = 'Failed to load registration rules';
        this.isLoading = false;
      }
    });
  }

  newRule(): void {
    this.isEditing = true;
    this.selectedRule = null;
    this.ruleForm.reset({
      name: '',
      description: '',
      ruleType: 'INSURANCE',
      condition: {
        field: '',
        operator: 'EQUALS',
        value: ''
      },
      action: 'BLOCK',
      isActive: true,
      priority: this.rules.length + 1
    });
  }

  editRule(rule: RegistrationRule): void {
    this.isEditing = true;
    this.selectedRule = rule;
    this.ruleForm.patchValue({
      name: rule.name,
      description: rule.description,
      ruleType: rule.ruleType,
      condition: {
        field: rule.condition.field,
        operator: rule.condition.operator,
        value: rule.condition.value || ''
      },
      action: rule.action,
      isActive: rule.isActive,
      priority: rule.priority
    });
  }

  saveRule(): void {
    if (this.ruleForm.invalid) {
      return;
    }

    const formValue = this.ruleForm.value;
    const rule: RegistrationRule = {
      id: this.selectedRule?.id,
      name: formValue.name,
      description: formValue.description,
      ruleType: formValue.ruleType,
      condition: {
        field: formValue.condition.field,
        operator: formValue.condition.operator,
        value: formValue.condition.value || undefined
      },
      action: formValue.action,
      isActive: formValue.isActive,
      priority: formValue.priority
    };

    this.adminService.saveRegistrationRule(rule).subscribe({
      next: (saved) => {
        this.loadRules();
        this.cancelEdit();
        this.errorMessage = null;
      },
      error: (err) => {
        console.error('Error saving registration rule:', err);
        this.errorMessage = 'Failed to save registration rule';
      }
    });
  }

  toggleRule(rule: RegistrationRule): void {
    this.adminService.toggleRegistrationRule(rule.id!, !rule.isActive).subscribe({
      next: () => {
        rule.isActive = !rule.isActive;
      },
      error: (err) => {
        console.error('Error toggling rule:', err);
        this.errorMessage = 'Failed to toggle rule';
      }
    });
  }

  deleteRule(ruleId: number): void {
    if (confirm('Are you sure you want to delete this rule?')) {
      this.adminService.deleteRegistrationRule(ruleId).subscribe({
        next: () => {
          this.loadRules();
        },
        error: (err) => {
          console.error('Error deleting rule:', err);
          this.errorMessage = 'Failed to delete rule';
        }
      });
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.selectedRule = null;
    this.ruleForm.reset();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.ruleForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getConditionField(): string {
    return this.ruleForm.get('condition.field')?.value || '';
  }

  getConditionOperator(): string {
    return this.ruleForm.get('condition.operator')?.value || 'EQUALS';
  }
}

