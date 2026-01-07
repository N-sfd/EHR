import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Patient } from '../../../core/models/patient.model';
import { Coverage } from '../../../core/models/coverage.model';
import { PatientConsent } from '../../../core/models/coverage.model';
import { RegistrationCompletenessService } from '../../../core/services/registration-completeness.service';
import { CoverageService } from '../../../core/services/coverage.service';
import { RoleService } from '../../../core/services/role.service';
import { RegistrationCompleteness } from '../../../core/models/registration-completeness.model';

@Component({
  selector: 'app-registration-completeness-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './registration-completeness-banner.component.html',
  styleUrls: ['./registration-completeness-banner.component.scss']
})
export class RegistrationCompletenessBannerComponent implements OnInit {
  @Input() patient!: Patient;
  @Output() updateRequested = new EventEmitter<void>();

  private completenessService = inject(RegistrationCompletenessService);
  private coverageService = inject(CoverageService);
  private roleService = inject(RoleService);

  completeness: RegistrationCompleteness | null = null;
  coverage: Coverage | null = null;
  consent: PatientConsent | null = null;
  isLoading = false;

  ngOnInit(): void {
    this.loadCompleteness();
  }

  loadCompleteness(): void {
    if (!this.patient?.id) return;

    this.isLoading = true;

    // Load coverage and consent
    this.coverageService.getByPatientId(this.patient.id).subscribe({
      next: (coverage) => {
        this.coverage = coverage;
        this.checkCompleteness();
      },
      error: () => {
        this.coverage = null;
        this.checkCompleteness();
      }
    });

    this.coverageService.getConsent(this.patient.id).subscribe({
      next: (consent) => {
        this.consent = consent;
        this.checkCompleteness();
      },
      error: () => {
        this.consent = null;
        this.checkCompleteness();
      }
    });
  }

  checkCompleteness(): void {
    if (!this.patient) return;

    this.completeness = this.completenessService.checkCompleteness(
      this.patient,
      this.coverage,
      this.consent
    );
    this.isLoading = false;
  }

  onUpdateClick(): void {
    this.updateRequested.emit();
  }

  canEdit(): boolean {
    return this.roleService.canEditPatient();
  }

  hasBlockers(): boolean {
    return (this.completeness?.blockers.length ?? 0) > 0;
  }

  hasWarnings(): boolean {
    return (this.completeness?.warnings.length ?? 0) > 0 && !this.hasBlockers();
  }
}

