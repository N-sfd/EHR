import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientContextService } from '../../../../core/services/patient-context.service';
import { PreludeMockService, Guarantor } from '../../services/prelude-mock.service';
import { CardComponent } from '../../../../shared/components/card/card.component';

@Component({
  selector: 'app-guarantor',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './guarantor.component.html',
  styleUrls: ['./guarantor.component.scss']
})
export class GuarantorComponent implements OnInit {
  private patientContext = inject(PatientContextService);
  private preludeService = inject(PreludeMockService);

  guarantor: Guarantor | null = null;
  isLoading = false;

  ngOnInit() {
    const patient = this.patientContext.getPatient();
    if (patient && patient.mrn) {
      this.loadGuarantor(patient.mrn);
    }
  }

  loadGuarantor(mrn: string) {
    this.isLoading = true;
    this.preludeService.getGuarantor(mrn).subscribe({
      next: (guarantor) => {
        this.guarantor = guarantor;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}

