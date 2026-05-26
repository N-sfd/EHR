import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InsuranceService } from '../../../../core/services/insurance.service';
import { EligibilityVerificationService } from '../../../../core/services/eligibility-verification.service';
import { PatientService } from '../../../../core/services/patient.service';
import { Insurance } from '../../../../core/models/insurance.model';
import { EligibilityVerification } from '../../../../core/models/eligibility-verification.model';

// Insurance Eligibility - Patient insurance and eligibility verification
@Component({
  selector: 'app-insurance-eligibility',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './insurance-eligibility.component.html',
  styleUrls: ['./insurance-eligibility.component.css']
})
export class InsuranceEligibilityComponent implements OnInit {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private insuranceService = inject(InsuranceService);
  private eligibilityService = inject(EligibilityVerificationService);
  private patientService = inject(PatientService);

  patientId?: number;
  patient: any = null;
  insurances: Insurance[] = [];
  eligibilityChecks: EligibilityVerification[] = [];
  selectedInsurance: Insurance | null = null;
  isLoading = false;

  // Filters
  appointmentDateFilter = '';
  checkedFromFilter = '';
  checkedToFilter = '';

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.patientId = params['id'] ? +params['id'] : undefined;
      if (this.patientId) {
        this.loadData();
      }
    });
  }

  loadData() {
    if (!this.patientId) return;

    this.isLoading = true;
    
    // Load patient
    this.patientService.getById(this.patientId).subscribe({
      next: (patient) => {
        this.patient = patient;
      }
    });

    // Load insurances
    this.insuranceService.getByPatientId(this.patientId).subscribe({
      next: (insurances) => {
        this.insurances = insurances;
        if (insurances.length > 0) {
          this.selectedInsurance = insurances[0];
        }
      }
    });

    // Load eligibility checks
    this.eligibilityService.getByPatientId(this.patientId).subscribe({
      next: (checks) => {
        this.eligibilityChecks = checks;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getEligibilityStatusClass(status: string | undefined): string {
    if (!status) return 'status-unknown';
    
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('active')) {
      return 'status-active';
    } else if (lowerStatus.includes('inactive') || lowerStatus.includes('expired')) {
      return 'status-inactive';
    } else if (lowerStatus.includes('pending')) {
      return 'status-pending';
    }
    return 'status-unknown';
  }

  getEligibilityStatusIcon(status: string | undefined): string {
    const lowerStatus = status?.toLowerCase() || '';
    if (lowerStatus.includes('active')) {
      return 'fa-check-circle';
    } else if (lowerStatus.includes('inactive') || lowerStatus.includes('expired')) {
      return 'fa-times-circle';
    } else if (lowerStatus.includes('pending')) {
      return 'fa-clock';
    }
    return 'fa-question-circle';
  }

  verifyEligibility(insuranceId: number) {
    if (!this.patientId) return;

    this.eligibilityService.verify(this.patientId, insuranceId).subscribe({
      next: (verification) => {
        this.eligibilityChecks.unshift(verification);
        this.loadData();
      },
      error: (err) => {
        console.error('Error verifying eligibility:', err);
      }
    });
  }

  filterEligibilityChecks() {
    // Filter logic would go here
    this.loadData();
  }

  resetFilters() {
    this.appointmentDateFilter = '';
    this.checkedFromFilter = '';
    this.checkedToFilter = '';
    this.loadData();
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(date: string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

