import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CheckoutService } from '../../../core/services/checkout.service';
import { AuthService } from '../../../core/services/auth.service';
import { Checkout } from '../../../core/models/ambulatory.model';

@Component({
  selector: 'app-checkout-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout-form.component.html',
  styleUrls: ['./checkout-form.component.css']
})
export class CheckoutFormComponent implements OnInit {
  @Input() encounterId!: number;
  @Input() appointmentId?: number;
  @Output() saved = new EventEmitter<void>();

  private checkoutService = inject(CheckoutService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  checkoutForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  ngOnInit() {
    this.initializeForm();
    this.loadExistingCheckout();
  }

  initializeForm() {
    this.checkoutForm = this.fb.group({
      followUpAppointmentScheduled: [false],
      followUpDate: [''],
      followUpProviderId: [''],
      followUpReason: [''],
      referralsMade: [false],
      referralSpecialty: [''],
      referralProviderName: [''],
      referralNotes: [''],
      patientInstructions: [''],
      medicationInstructions: [''],
      activityRestrictions: [''],
      dietInstructions: [''],
      whenToReturn: [''],
      billingCaptured: [false],
      copayCollected: [false],
      copayAmount: [''],
      paymentMethod: [''],
      dischargeDisposition: [''],
      dischargeInstructionsProvided: [false],
      patientUnderstoodInstructions: [false],
      notes: [''],
      isComplete: [false]
    });
  }

  loadExistingCheckout() {
    this.isLoading = true;
    this.checkoutService.getByEncounterId(this.encounterId).subscribe({
      next: (existing) => {
        this.checkoutForm.patchValue({
          followUpAppointmentScheduled: existing.followUpAppointmentScheduled || false,
          followUpDate: existing.followUpDate || '',
          followUpProviderId: existing.followUpProviderId || '',
          followUpReason: existing.followUpReason || '',
          referralsMade: existing.referralsMade || false,
          referralSpecialty: existing.referralSpecialty || '',
          referralProviderName: existing.referralProviderName || '',
          referralNotes: existing.referralNotes || '',
          patientInstructions: existing.patientInstructions || '',
          medicationInstructions: existing.medicationInstructions || '',
          activityRestrictions: existing.activityRestrictions || '',
          dietInstructions: existing.dietInstructions || '',
          whenToReturn: existing.whenToReturn || '',
          billingCaptured: existing.billingCaptured || false,
          copayCollected: existing.copayCollected || false,
          copayAmount: existing.copayAmount || '',
          paymentMethod: existing.paymentMethod || '',
          dischargeDisposition: existing.dischargeDisposition || '',
          dischargeInstructionsProvided: existing.dischargeInstructionsProvided || false,
          patientUnderstoodInstructions: existing.patientUnderstoodInstructions || false,
          notes: existing.notes || '',
          isComplete: existing.isComplete || false
        });
        this.isLoading = false;
      },
      error: () => {
        // No existing checkout, start fresh
        this.isLoading = false;
      }
    });
  }

  save() {
    if (this.checkoutForm.invalid) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const checkoutData: Checkout = {
      ...this.checkoutForm.getRawValue(),
      encounterId: this.encounterId,
      appointmentId: this.appointmentId,
      patientId: 0,
      checkedOutByStaffId: this.authService.getCurrentStaffId()
    };

    const existingId = (checkoutData as any).id;
    if (existingId) {
      this.checkoutService.update(existingId, checkoutData).subscribe({
        next: () => {
          this.isLoading = false;
          this.saved.emit();
        },
        error: (err) => {
          this.errorMessage = 'Failed to save checkout';
          this.isLoading = false;
        }
      });
    } else {
      this.checkoutService.create(checkoutData).subscribe({
        next: () => {
          this.isLoading = false;
          this.saved.emit();
        },
        error: (err) => {
          this.errorMessage = 'Failed to create checkout';
          this.isLoading = false;
        }
      });
    }
  }
}

