import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientContextService } from '../../../../core/services/patient-context.service';
import { PreludeMockService, Appointment } from '../../services/prelude-mock.service';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, CardComponent, BadgeComponent],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss']
})
export class AppointmentsComponent implements OnInit {
  private patientContext = inject(PatientContextService);
  private preludeService = inject(PreludeMockService);

  appointments: Appointment[] = [];
  isLoading = false;

  ngOnInit() {
    const patient = this.patientContext.getPatient();
    if (patient && patient.mrn) {
      this.loadAppointments(patient.mrn);
    }
  }

  loadAppointments(mrn: string) {
    this.isLoading = true;
    this.preludeService.getAppointments(mrn).subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}

