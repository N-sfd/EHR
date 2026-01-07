import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientContextService } from '../../../../core/services/patient-context.service';
import { PreludeMockService, Alert } from '../../services/prelude-mock.service';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, CardComponent, BadgeComponent],
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent implements OnInit {
  private patientContext = inject(PatientContextService);
  private preludeService = inject(PreludeMockService);

  alerts: Alert[] = [];
  isLoading = false;

  ngOnInit() {
    const patient = this.patientContext.getPatient();
    if (patient && (patient.mrn || patient.patientCode)) {
      this.loadAlerts(patient.mrn || patient.patientCode || '');
    }
  }

  loadAlerts(mrn: string) {
    this.isLoading = true;
    this.preludeService.getAlerts(mrn).subscribe({
      next: (alerts) => {
        this.alerts = alerts;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'critical': return 'fas fa-exclamation-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'info': return 'fas fa-info-circle';
      default: return 'fas fa-info-circle';
    }
  }
}

