import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { PatientContextService } from '../../../core/services/patient-context.service';
import { PreludeMockService } from '../services/prelude-mock.service';
import { PatientHeaderComponent } from '../../../shared/components/patient-header/patient-header.component';
import { PreludeSidebarComponent } from '../../../shared/components/prelude-sidebar/prelude-sidebar.component';
import { Patient } from '../../../core/models/patient.model';

@Component({
  selector: 'app-prelude-patient-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, PatientHeaderComponent, PreludeSidebarComponent],
  templateUrl: './prelude-patient-shell.component.html',
  styleUrls: ['./prelude-patient-shell.component.scss']
})
export class PreludePatientShellComponent implements OnInit {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private patientContext = inject(PatientContextService);
  private preludeService = inject(PreludeMockService);

  patient: Patient | null = null;
  mrn: string = '';
  isLoading = true;
  error: string | null = null;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.mrn = params['mrn'];
      this.loadPatient();
    });
  }

  loadPatient() {
    this.isLoading = true;
    this.error = null;

    this.preludeService.getPatientByMrn(this.mrn).subscribe({
      next: (patient) => {
        if (patient) {
          this.patient = patient;
          this.patientContext.setPatient(patient);
        } else {
          this.error = `Patient with MRN ${this.mrn} not found`;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load patient data';
        this.isLoading = false;
      }
    });
  }

  getPatientHeaderData() {
    if (!this.patient || !this.patient.mrn) return undefined;
    return {
      firstName: this.patient.firstName,
      lastName: this.patient.lastName,
      mrn: this.patient.mrn,
      dateOfBirth: this.patient.dateOfBirth,
      sex: this.patient.sex
    };
  }

  getActiveRoute(): string {
    const url = this.router.url;
    const segments = url.split('/').filter(s => s.length > 0);
    return segments[segments.length - 1] || 'demographics';
  }
}

