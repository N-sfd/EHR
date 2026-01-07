import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AdminService } from '../services/admin.service';
import { AlertRule } from '../models/admin.model';

@Component({
  selector: 'app-alerts-warnings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './alerts-warnings.component.html',
  styleUrls: ['./alerts-warnings.component.scss']
})
export class AlertsWarningsComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);

  rules: AlertRule[] = [];
  selectedRule: AlertRule | null = null;
  
  alertForm!: FormGroup;
  isEditing = false;
  isLoading = false;
  errorMessage: string | null = null;

  severities = [
    { value: 'INFO', label: 'Info', color: '#0277bd' },
    { value: 'WARN', label: 'Warning', color: '#f57f17' },
    { value: 'CRITICAL', label: 'Critical', color: '#c62828' }
  ];

  triggerTypes = [
    { value: 'PATIENT_FIELD', label: 'Patient Field' },
    { value: 'INSURANCE_STATUS', label: 'Insurance Status' },
    { value: 'APPOINTMENT_STATUS', label: 'Appointment Status' },
    { value: 'DEMOGRAPHICS', label: 'Demographics' },
    { value: 'CUSTOM', label: 'Custom' }
  ];

  operators = [
    { value: 'EQUALS', label: 'Equals' },
    { value: 'NOT_EQUALS', label: 'Not Equals' },
    { value: 'EXISTS', label: 'Exists' },
    { value: 'NOT_EXISTS', label: 'Not Exists' },
    { value: 'GREATER_THAN', label: 'Greater Than' },
    { value: 'LESS_THAN', label: 'Less Than' }
  ];

  frequencies = [
    { value: 'ONCE', label: 'Once' },
    { value: 'ALWAYS', label: 'Always' },
    { value: 'SCHEDULED', label: 'Scheduled' }
  ];

  roles = [
    { value: 'FRONT_DESK', label: 'Front Desk' },
    { value: 'NURSE', label: 'Nurse' },
    { value: 'PROVIDER', label: 'Provider' },
    { value: 'ADMIN', label: 'Admin' }
  ];

  ngOnInit(): void {
    this.loadRules();
    this.initializeForm();
  }

  initializeForm(): void {
    this.alertForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      severity: ['WARN', Validators.required],
      trigger: this.fb.group({
        triggerType: ['PATIENT_FIELD', Validators.required],
        condition: this.fb.group({
          field: ['', Validators.required],
          operator: ['EQUALS', Validators.required],
          value: ['']
        }),
        frequency: ['ALWAYS', Validators.required]
      }),
      visibleRoles: [[], Validators.required],
      isActive: [true],
      message: ['', Validators.required],
      autoDismiss: [false],
      dismissAfterMinutes: [5]
    });
  }

  loadRules(): void {
    this.isLoading = true;
    this.adminService.getAlertRules().subscribe({
      next: (rules) => {
        this.rules = rules;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading alert rules:', err);
        this.errorMessage = 'Failed to load alert rules';
        this.isLoading = false;
      }
    });
  }

  newRule(): void {
    this.isEditing = true;
    this.selectedRule = null;
    this.alertForm.reset({
      name: '',
      description: '',
      severity: 'WARN',
      trigger: {
        triggerType: 'PATIENT_FIELD',
        condition: {
          field: '',
          operator: 'EQUALS',
          value: ''
        },
        frequency: 'ALWAYS'
      },
      visibleRoles: [],
      isActive: true,
      message: '',
      autoDismiss: false,
      dismissAfterMinutes: 5
    });
  }

  editRule(rule: AlertRule): void {
    this.isEditing = true;
    this.selectedRule = rule;
    this.alertForm.patchValue({
      name: rule.name,
      description: rule.description,
      severity: rule.severity,
      trigger: {
        triggerType: rule.trigger.triggerType,
        condition: {
          field: rule.trigger.condition.field,
          operator: rule.trigger.condition.operator,
          value: rule.trigger.condition.value || ''
        },
        frequency: rule.trigger.frequency
      },
      visibleRoles: rule.visibleRoles,
      isActive: rule.isActive,
      message: rule.message,
      autoDismiss: rule.autoDismiss || false,
      dismissAfterMinutes: rule.dismissAfterMinutes || 5
    });
  }

  saveRule(): void {
    if (this.alertForm.invalid) {
      return;
    }

    const formValue = this.alertForm.value;
    const rule: AlertRule = {
      id: this.selectedRule?.id,
      name: formValue.name,
      description: formValue.description,
      severity: formValue.severity,
      trigger: {
        triggerType: formValue.trigger.triggerType,
        condition: {
          field: formValue.trigger.condition.field,
          operator: formValue.trigger.condition.operator,
          value: formValue.trigger.condition.value || undefined
        },
        frequency: formValue.trigger.frequency
      },
      visibleRoles: formValue.visibleRoles,
      isActive: formValue.isActive,
      message: formValue.message,
      autoDismiss: formValue.autoDismiss,
      dismissAfterMinutes: formValue.autoDismiss ? formValue.dismissAfterMinutes : undefined
    };

    this.adminService.saveAlertRule(rule).subscribe({
      next: (saved) => {
        this.loadRules();
        this.cancelEdit();
        this.errorMessage = null;
      },
      error: (err) => {
        console.error('Error saving alert rule:', err);
        this.errorMessage = 'Failed to save alert rule';
      }
    });
  }

  toggleRule(rule: AlertRule): void {
    this.adminService.toggleAlertRule(rule.id!, !rule.isActive).subscribe({
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
    if (confirm('Are you sure you want to delete this alert rule?')) {
      this.adminService.deleteAlertRule(ruleId).subscribe({
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
    this.alertForm.reset();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.alertForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getSeverityColor(severity: string): string {
    const severityObj = this.severities.find(s => s.value === severity);
    return severityObj?.color || '#666';
  }

  getConditionOperator(): string {
    return this.alertForm.get('trigger.condition.operator')?.value || 'EQUALS';
  }

  onRoleToggle(roleValue: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const visibleRoles = this.alertForm.get('visibleRoles')?.value || [];
    
    if (checkbox.checked) {
      if (!visibleRoles.includes(roleValue)) {
        this.alertForm.patchValue({
          visibleRoles: [...visibleRoles, roleValue]
        });
      }
    } else {
      this.alertForm.patchValue({
        visibleRoles: visibleRoles.filter((r: string) => r !== roleValue)
      });
    }
  }
}

