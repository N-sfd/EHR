import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ProviderEncounterService } from '../../../core/services/provider-encounter.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProviderEncounter } from '../../../core/models/ambulatory.model';

@Component({
  selector: 'app-provider-encounter-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './provider-encounter-form.component.html',
  styleUrls: ['./provider-encounter-form.component.css']
})
export class ProviderEncounterFormComponent implements OnInit {
  @Input() encounterId!: number;
  @Input() appointmentId?: number;
  @Output() saved = new EventEmitter<void>();

  private providerEncounterService = inject(ProviderEncounterService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  encounterForm!: FormGroup;
  diagnosesFormArray!: FormArray;
  ordersFormArray!: FormArray;
  isLoading = false;
  errorMessage: string | null = null;

  ngOnInit() {
    this.initializeForm();
    this.loadExistingEncounter();
  }

  initializeForm() {
    this.diagnosesFormArray = this.fb.array([]);
    this.ordersFormArray = this.fb.array([]);

    this.encounterForm = this.fb.group({
      primaryDiagnosis: [''],
      diagnosisCodes: [''],
      diagnosisDescriptions: [''],
      assessment: [''],
      subjective: [''],
      objective: [''],
      assessmentSoap: [''],
      planSoap: [''],
      plan: [''],
      followUpInstructions: [''],
      orders: this.ordersFormArray,
      diagnoses: this.diagnosesFormArray,
      followUpAppointmentNeeded: [false],
      followUpDays: [''],
      referralsMade: [false],
      referralReason: [''],
      patientInstructions: [''],
      notes: ['']
    });
  }

  loadExistingEncounter() {
    this.isLoading = true;
    this.providerEncounterService.getByEncounterId(this.encounterId).subscribe({
      next: (existing) => {
        this.encounterForm.patchValue({
          primaryDiagnosis: existing.primaryDiagnosis || '',
          diagnosisCodes: existing.diagnosisCodes || '',
          diagnosisDescriptions: existing.diagnosisDescriptions || '',
          assessment: existing.assessment || '',
          subjective: existing.subjective || '',
          objective: existing.objective || '',
          assessmentSoap: existing.assessmentSoap || '',
          planSoap: existing.planSoap || '',
          plan: existing.plan || '',
          followUpInstructions: existing.followUpInstructions || '',
          followUpAppointmentNeeded: existing.followUpAppointmentNeeded || false,
          followUpDays: existing.followUpDays || '',
          referralsMade: (existing as any).referralsMade || false,
          referralReason: (existing as any).referralReason || '',
          patientInstructions: (existing as any).patientInstructions || '',
          notes: existing.notes || ''
        });
        this.isLoading = false;
      },
      error: () => {
        // No existing encounter, start fresh
        this.isLoading = false;
      }
    });
  }

  addDiagnosis() {
    const diagnosis = prompt('Enter diagnosis (ICD-10 code or description):');
    if (diagnosis && diagnosis.trim()) {
      this.diagnosesFormArray.push(this.fb.control(diagnosis.trim()));
    }
  }

  removeDiagnosis(index: number) {
    this.diagnosesFormArray.removeAt(index);
  }

  addOrder() {
    const order = prompt('Enter order:');
    if (order && order.trim()) {
      this.ordersFormArray.push(this.fb.control(order.trim()));
    }
  }

  removeOrder(index: number) {
    this.ordersFormArray.removeAt(index);
  }

  get labOrdersCount(): number {
    return this.ordersFormArray.value.filter((o: any) => 
      typeof o === 'string' && o.toLowerCase().includes('lab')
    ).length;
  }

  get imagingOrdersCount(): number {
    return this.ordersFormArray.value.filter((o: any) => 
      typeof o === 'string' && (
        o.toLowerCase().includes('imaging') || 
        o.toLowerCase().includes('x-ray') || 
        o.toLowerCase().includes('ct') || 
        o.toLowerCase().includes('mri')
      )
    ).length;
  }

  get medicationOrdersCount(): number {
    return this.ordersFormArray.value.filter((o: any) => 
      typeof o === 'string' && (
        o.toLowerCase().includes('medication') || 
        o.toLowerCase().includes('prescription')
      )
    ).length;
  }

  save() {
    if (this.encounterForm.invalid) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const formValue = this.encounterForm.getRawValue();
    const encounterData: ProviderEncounter = {
      ...formValue,
      encounterId: this.encounterId,
      appointmentId: this.appointmentId,
      patientId: 0,
      providerId: this.authService.getCurrentProviderId(),
      diagnoses: this.diagnosesFormArray.value,
      orders: this.ordersFormArray.value,
      ordersPlaced: this.ordersFormArray.length > 0,
      labOrdersCount: this.ordersFormArray.value.filter((o: string) => o.toLowerCase().includes('lab')).length,
      imagingOrdersCount: this.ordersFormArray.value.filter((o: string) => o.toLowerCase().includes('imaging') || o.toLowerCase().includes('x-ray') || o.toLowerCase().includes('ct') || o.toLowerCase().includes('mri')).length,
      medicationOrdersCount: this.ordersFormArray.value.filter((o: string) => o.toLowerCase().includes('medication') || o.toLowerCase().includes('prescription')).length,
      isSigned: false,
      isComplete: false
    };

    const existingId = (encounterData as any).id;
    if (existingId) {
      this.providerEncounterService.update(existingId, encounterData).subscribe({
        next: () => {
          this.isLoading = false;
          this.saved.emit();
        },
        error: (err) => {
          this.errorMessage = 'Failed to save encounter';
          this.isLoading = false;
        }
      });
    } else {
      this.providerEncounterService.create(encounterData).subscribe({
        next: () => {
          this.isLoading = false;
          this.saved.emit();
        },
        error: (err) => {
          this.errorMessage = 'Failed to create encounter';
          this.isLoading = false;
        }
      });
    }
  }

  sign() {
    if (this.encounterForm.invalid) {
      this.errorMessage = 'Please complete all required fields before signing';
      return;
    }

    this.save();
    // After save, sign the encounter
    const encounterId = (this.encounterForm.value as any).id;
    if (encounterId) {
      this.providerEncounterService.sign(encounterId, this.authService.getCurrentProviderId()).subscribe({
        next: () => {
          this.saved.emit();
        },
        error: (err) => {
          this.errorMessage = 'Failed to sign encounter';
        }
      });
    }
  }
}

