import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PatientContextService } from '../../../../core/services/patient-context.service';
import { PreludeMockService } from '../../services/prelude-mock.service';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { Insurance } from '../../../../core/models/insurance.model';

@Component({
  selector: 'app-insurance',
  standalone: true,
  imports: [CommonModule, CardComponent, BadgeComponent],
  templateUrl: './insurance.component.html',
  styleUrls: ['./insurance.component.scss']
})
export class InsuranceComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private patientContext = inject(PatientContextService);
  private preludeService = inject(PreludeMockService);

  coverage: Insurance[] = [];
  isLoading = false;

  ngOnInit() {
    const patient = this.patientContext.getPatient();
    if (patient && patient.mrn) {
      this.loadCoverage(patient.mrn);
    }
  }

  loadCoverage(mrn: string) {
    this.isLoading = true;
    this.preludeService.getCoverage(mrn).subscribe({
      next: (coverage) => {
        this.coverage = coverage;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getEligibilityBadgeClass(isActive?: boolean): 'success' | 'warning' | 'danger' | 'muted' {
    if (isActive === true) return 'success';
    if (isActive === false) return 'warning';
    return 'muted';
  }
}

