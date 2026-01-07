import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PatientService } from '../../core/services/patient.service';
import { CoverageService } from '../../core/services/coverage.service';
import { RegistrationCompletenessService } from '../../core/services/registration-completeness.service';
import { Patient } from '../../core/models/patient.model';
import { RegistrationCompleteness } from '../../core/models/registration-completeness.model';
import { RegistrationCompletenessBannerComponent } from '../../shared/components/registration-completeness-banner/registration-completeness-banner.component';
import { PatientUpdateDrawerComponent } from '../../shared/components/patient-update-drawer/patient-update-drawer.component';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    RegistrationCompletenessBannerComponent,
    PatientUpdateDrawerComponent
  ],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {
  private patientService = inject(PatientService);
  private coverageService = inject(CoverageService);
  private completenessService = inject(RegistrationCompletenessService);
  router = inject(Router);

  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  patientCompleteness: Map<number, RegistrationCompleteness> = new Map();
  isLoading = false;
  errorMessage: string | null = null;
  searchTerm = '';
  statusFilter = 'all';
  
  selectedPatient: Patient | null = null;
  showUpdateDrawer = false;

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.patientService.getAll().subscribe({
      next: (patients) => {
        this.patients = patients.map(p => ({
          ...p,
          id: (p as any).patientId || p.id
        }));
        this.applyFilters();
        this.loadCompletenessForAll();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading patients:', err);
        this.errorMessage = 'Failed to load patients';
        this.isLoading = false;
      }
    });
  }

  loadCompletenessForAll(): void {
    this.patients.forEach(patient => {
      if (patient.id) {
        this.coverageService.getByPatientId(patient.id).subscribe({
          next: (coverage) => {
            this.coverageService.getConsent(patient.id!).subscribe({
              next: (consent) => {
                const completeness = this.completenessService.checkCompleteness(
                  patient,
                  coverage,
                  consent
                );
                this.patientCompleteness.set(patient.id!, completeness);
              },
              error: () => {
                const completeness = this.completenessService.checkCompleteness(
                  patient,
                  coverage,
                  null
                );
                this.patientCompleteness.set(patient.id!, completeness);
              }
            });
          },
          error: () => {
            this.coverageService.getConsent(patient.id!).subscribe({
              next: (consent) => {
                const completeness = this.completenessService.checkCompleteness(
                  patient,
                  null,
                  consent
                );
                this.patientCompleteness.set(patient.id!, completeness);
              },
              error: () => {
                const completeness = this.completenessService.checkCompleteness(
                  patient,
                  null,
                  null
                );
                this.patientCompleteness.set(patient.id!, completeness);
              }
            });
          }
        });
      }
    });
  }

  getCompletenessStatus(patient: Patient): 'CRITICAL' | 'WARN' | 'OK' {
    if (!patient.id) return 'OK';
    const completeness = this.patientCompleteness.get(patient.id);
    if (!completeness) return 'OK';
    if (completeness.blockers.length > 0) return 'CRITICAL';
    if (completeness.warnings.length > 0) return 'WARN';
    return 'OK';
  }

  getCompletenessTooltip(patient: Patient): string {
    if (!patient.id) return 'OK';
    const completeness = this.patientCompleteness.get(patient.id);
    if (!completeness || completeness.missing.length === 0) {
      return 'Registration complete';
    }
    return completeness.missing.map(m => m.label).join(', ');
  }

  applyFilters(): void {
    this.filteredPatients = this.patients.filter(patient => {
      if (this.searchTerm) {
        const search = this.searchTerm.toLowerCase();
        const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.toLowerCase();
        const patientCode = (patient as any).patientCode?.toLowerCase() || '';
        const phone = patient.phoneNumber?.toLowerCase() || '';
        const email = patient.emailAddress?.toLowerCase() || '';
        const dob = patient.dateOfBirth || '';
        
        const matchesSearch = 
          fullName.includes(search) ||
          patientCode.includes(search) ||
          phone.includes(search) ||
          email.includes(search) ||
          dob.includes(search);
        if (!matchesSearch) return false;
      }
      
      if (this.statusFilter !== 'all' && patient.status !== this.statusFilter) {
        return false;
      }
      
      return true;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  deletePatient(patient: Patient): void {
    if (!patient.id) return;
    
    if (confirm(`Are you sure you want to delete ${patient.firstName} ${patient.lastName}?`)) {
      this.patientService.delete(patient.id).subscribe({
        next: () => {
          this.loadPatients();
        },
        error: (err) => {
          console.error('Error deleting patient:', err);
          alert('Failed to delete patient');
        }
      });
    }
  }

  getPatientImage(patient: Patient): string {
    if (patient.photoUrl) {
      return patient.photoUrl;
    }
    return this.getDefaultAvatar();
  }

  getDefaultAvatar(): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="20" fill="#E5E7EB"/>
      <circle cx="20" cy="15" r="6" fill="#9CA3AF"/>
      <path d="M10 32 Q10 25 20 25 Q30 25 30 32" fill="#9CA3AF"/>
    </svg>`;
    const base64 = btoa(unescape(encodeURIComponent(svg)));
    return 'data:image/svg+xml;base64,' + base64;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.includes('data:image')) {
      img.src = this.getDefaultAvatar();
      img.onerror = null;
    }
  }

  onUpdateRequested(patient: Patient): void {
    this.selectedPatient = patient;
    this.showUpdateDrawer = true;
  }

  onDrawerClose(): void {
    this.showUpdateDrawer = false;
    this.selectedPatient = null;
  }

  onPatientSaved(updatedPatient: Patient): void {
    // Update the patient in the list
    const index = this.patients.findIndex(p => p.id === updatedPatient.id);
    if (index >= 0) {
      this.patients[index] = updatedPatient;
      this.applyFilters();
    }
    this.onDrawerClose();
  }
}

