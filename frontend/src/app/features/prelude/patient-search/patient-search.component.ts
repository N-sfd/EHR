import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/patient.model';

@Component({
  selector: 'app-patient-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-search.component.html',
  styleUrls: ['./patient-search.component.css']
})
export class PatientSearchComponent implements OnInit {
  private patientService = inject(PatientService);
  router = inject(Router);

  searchType: 'name' | 'dob' | 'mrn' | 'phone' = 'name';
  searchTerm = '';
  searchResults: Patient[] = [];
  isLoading = false;
  showDuplicateWarning = false;
  duplicatePatients: Patient[] = [];
  recentlyAccessed: Patient[] = [];

  ngOnInit() {
    this.loadRecentlyAccessed();
  }

  onSearchTypeChange() {
    this.searchTerm = '';
    this.searchResults = [];
    this.showDuplicateWarning = false;
  }

  search() {
    if (!this.searchTerm.trim()) {
      this.searchResults = [];
      return;
    }

    this.isLoading = true;
    this.showDuplicateWarning = false;

    // Smart partial match search
    this.patientService.getAll().subscribe({
      next: (patients) => {
        this.searchResults = this.filterPatients(patients, this.searchTerm, this.searchType);
        
        // Check for potential duplicates
        if (this.searchResults.length > 1) {
          this.showDuplicateWarning = true;
          this.duplicatePatients = this.searchResults;
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Search error:', err);
        this.isLoading = false;
      }
    });
  }

  filterPatients(patients: Patient[], term: string, type: string): Patient[] {
    const lowerTerm = term.toLowerCase();
    
    return patients.filter(patient => {
      switch (type) {
        case 'name':
          const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
          return fullName.includes(lowerTerm);
        case 'dob':
          return patient.dateOfBirth?.includes(term) || false;
        case 'mrn':
          return patient.patientCode?.toLowerCase().includes(lowerTerm) || false;
        case 'phone':
          return patient.phoneNumber?.includes(term) || false;
        default:
          return false;
      }
    });
  }

  selectPatient(patient: Patient) {
    this.router.navigate(['/admin/prelude/patient', patient.id]);
  }

  createNewPatient() {
    this.router.navigate(['/admin/patients/add']);
  }

  loadRecentlyAccessed() {
    // Load recently accessed patients (mock for now)
    this.patientService.getAll().subscribe({
      next: (patients) => {
        this.recentlyAccessed = patients.slice(0, 5);
      }
    });
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US');
  }

  getSearchPlaceholder(): string {
    switch (this.searchType) {
      case 'name': return 'Enter patient name...';
      case 'dob': return 'MM/DD/YYYY';
      case 'mrn': return 'Enter MRN...';
      case 'phone': return 'Enter phone number...';
      default: return 'Search...';
    }
  }

  calculateAge(dob: string | undefined): string {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  }
}

