import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoomingService } from '../../../core/services/rooming.service';
import { AuthService } from '../../../core/services/auth.service';
import { Rooming } from '../../../core/models/ambulatory.model';

@Component({
  selector: 'app-rooming-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rooming-form.component.html',
  styleUrls: ['./rooming-form.component.css']
})
export class RoomingFormComponent implements OnInit {
  @Input() encounterId!: number;
  @Input() appointmentId?: number;
  @Output() saved = new EventEmitter<void>();

  private roomingService = inject(RoomingService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  roomingForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  ngOnInit() {
    this.initializeForm();
    this.loadExistingRooming();
  }

  initializeForm() {
    this.roomingForm = this.fb.group({
      bloodPressureSystolic: [''],
      bloodPressureDiastolic: [''],
      temperatureF: [''],
      pulse: [''],
      respiratoryRate: [''],
      oxygenSaturation: [''],
      heightInches: [''],
      weightLbs: [''],
      bmi: [{ value: '', disabled: true }],
      painScore: [''],
      chiefComplaint: [''],
      historyOfPresentIllness: [''],
      medicationsReviewed: [false],
      allergiesReviewed: [false],
      smokingStatus: [''],
      fallRiskAssessment: [false],
      fallRiskScore: [''],
      depressionScreening: [false],
      depressionScreeningScore: [''],
      alcoholScreening: [false],
      patientConcerns: [''],
      nursingNotes: ['']
    });

    // Calculate BMI when height/weight change
    this.roomingForm.get('heightInches')?.valueChanges.subscribe(() => this.calculateBMI());
    this.roomingForm.get('weightLbs')?.valueChanges.subscribe(() => this.calculateBMI());
  }

  loadExistingRooming() {
    this.isLoading = true;
    this.roomingService.getByEncounterId(this.encounterId).subscribe({
      next: (existing) => {
        this.roomingForm.patchValue({
          bloodPressureSystolic: existing.bloodPressureSystolic || '',
          bloodPressureDiastolic: existing.bloodPressureDiastolic || '',
          temperatureF: existing.temperatureF || '',
          pulse: existing.pulse || '',
          respiratoryRate: existing.respiratoryRate || '',
          oxygenSaturation: existing.oxygenSaturation || '',
          heightInches: existing.heightInches || '',
          weightLbs: existing.weightLbs || '',
          bmi: existing.bmi || '',
          painScore: existing.painScore || '',
          chiefComplaint: existing.chiefComplaint || '',
          historyOfPresentIllness: existing.historyOfPresentIllness || '',
          medicationsReviewed: existing.medicationsReviewed || false,
          allergiesReviewed: existing.allergiesReviewed || false,
          smokingStatus: existing.smokingStatus || '',
          fallRiskAssessment: existing.fallRiskAssessment || false,
          fallRiskScore: existing.fallRiskScore || '',
          depressionScreening: existing.depressionScreening || false,
          depressionScreeningScore: existing.depressionScreeningScore || '',
          alcoholScreening: existing.alcoholScreening || false,
          patientConcerns: existing.patientConcerns || '',
          nursingNotes: existing.nursingNotes || ''
        });
        this.isLoading = false;
      },
      error: () => {
        // No existing rooming, start fresh
        this.isLoading = false;
      }
    });
  }

  save() {
    if (this.roomingForm.invalid) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const roomingData: Rooming = {
      ...this.roomingForm.getRawValue(),
      encounterId: this.encounterId,
      appointmentId: this.appointmentId,
      patientId: 0,
      roomedByStaffId: this.authService.getCurrentStaffId()
    };

    const existingId = (roomingData as any).id;
    if (existingId) {
      this.roomingService.update(existingId, roomingData).subscribe({
        next: () => {
          this.isLoading = false;
          this.saved.emit();
        },
        error: (err) => {
          this.errorMessage = 'Failed to save rooming';
          this.isLoading = false;
        }
      });
    } else {
      this.roomingService.create(roomingData).subscribe({
        next: () => {
          this.isLoading = false;
          this.saved.emit();
        },
        error: (err) => {
          this.errorMessage = 'Failed to create rooming';
          this.isLoading = false;
        }
      });
    }
  }

  calculateBMI() {
    const heightInches = parseFloat(this.roomingForm.get('heightInches')?.value || '0');
    const weightLbs = parseFloat(this.roomingForm.get('weightLbs')?.value || '0');
    if (heightInches > 0 && weightLbs > 0) {
      const heightM = (heightInches * 0.0254);
      const weightKg = weightLbs * 0.453592;
      const bmi = weightKg / (heightM * heightM);
      this.roomingForm.patchValue({ bmi: bmi.toFixed(1) }, { emitEvent: false });
    }
  }
}

