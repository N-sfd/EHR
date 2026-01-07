import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Patient } from '../../../core/models/patient.model';
import { RegistrationCompletenessService } from '../../../core/services/registration-completeness.service';
import { CoverageService } from '../../../core/services/coverage.service';
import { RegistrationCompleteness } from '../../../core/models/registration-completeness.model';

export interface PatientHeaderData {
  firstName: string;
  lastName: string;
  mrn: string;
  dateOfBirth?: string;
  sex?: string;
}

@Component({
  selector: 'app-patient-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-header.component.html',
  styleUrls: ['./patient-header.component.scss']
})
export class PatientHeaderComponent implements OnInit {
  @Input() patient?: PatientHeaderData | Patient;
  @Input() patientModel?: Patient | null; // Full patient model for completeness check

  private completenessService = inject(RegistrationCompletenessService);
  private coverageService = inject(CoverageService);

  completeness: RegistrationCompleteness | null = null;
  isLoadingCompleteness = false;

  ngOnInit(): void {
    if (this.patientModel?.id) {
      this.loadCompleteness();
    }
  }

  loadCompleteness(): void {
    if (!this.patientModel?.id) return;

    this.isLoadingCompleteness = true;

    // Load coverage and consent
    this.coverageService.getByPatientId(this.patientModel.id).subscribe({
      next: (coverage) => {
        this.coverageService.getConsent(this.patientModel!.id!).subscribe({
          next: (consent) => {
            this.completeness = this.completenessService.checkCompleteness(
              this.patientModel!,
              coverage,
              consent
            );
            this.isLoadingCompleteness = false;
          },
          error: () => {
            this.completeness = this.completenessService.checkCompleteness(
              this.patientModel!,
              coverage,
              null
            );
            this.isLoadingCompleteness = false;
          }
        });
      },
      error: () => {
        this.coverageService.getConsent(this.patientModel!.id!).subscribe({
          next: (consent) => {
            this.completeness = this.completenessService.checkCompleteness(
              this.patientModel!,
              null,
              consent
            );
            this.isLoadingCompleteness = false;
          },
          error: () => {
            this.completeness = this.completenessService.checkCompleteness(
              this.patientModel!,
              null,
              null
            );
            this.isLoadingCompleteness = false;
          }
        });
      }
    });
  }

  getPatientFirstName(): string {
    if (this.patientModel) {
      return this.patientModel.firstName || '';
    }
    return (this.patient as PatientHeaderData)?.firstName || '';
  }

  getPatientLastName(): string {
    if (this.patientModel) {
      return this.patientModel.lastName || '';
    }
    return (this.patient as PatientHeaderData)?.lastName || '';
  }

  getPatientMRN(): string {
    if (this.patientModel) {
      return this.patientModel.mrn || this.patientModel.patientCode || '';
    }
    return (this.patient as PatientHeaderData)?.mrn || '';
  }

  getPatientDOB(): string | undefined {
    if (this.patientModel) {
      return this.patientModel.dateOfBirth;
    }
    return (this.patient as PatientHeaderData)?.dateOfBirth;
  }

  getPatientSex(): string | undefined {
    if (this.patientModel) {
      return this.patientModel.sex || this.patientModel.gender;
    }
    return (this.patient as PatientHeaderData)?.sex;
  }

  getTooltipText(): string {
    if (!this.completeness || this.completeness.missing.length === 0) {
      return 'Registration complete (100%)';
    }
    const missingList = this.completeness.missing.map(m => m.label).join(', ');
    return `Missing: ${missingList}`;
  }

  calculateAge(dateOfBirth?: string): number | null {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  formatDate(date?: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}

