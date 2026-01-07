import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientContextService } from '../../../../core/services/patient-context.service';
import { PreludeMockService, Document } from '../../services/prelude-mock.service';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, CardComponent, BadgeComponent],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {
  private patientContext = inject(PatientContextService);
  private preludeService = inject(PreludeMockService);

  documents: Document[] = [];
  isLoading = false;

  ngOnInit() {
    const patient = this.patientContext.getPatient();
    if (patient && patient.mrn) {
      this.loadDocuments(patient.mrn);
    }
  }

  loadDocuments(mrn: string) {
    this.isLoading = true;
    this.preludeService.getDocuments(mrn).subscribe({
      next: (documents) => {
        this.documents = documents;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getStatusBadgeClass(status: string): 'success' | 'warning' | 'danger' | 'muted' {
    switch (status.toLowerCase()) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      default: return 'muted';
    }
  }
}

