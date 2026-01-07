import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EncounterService } from '../../../core/services/encounter.service';
import { PatientService } from '../../../core/services/patient.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { DepartmentService } from '../../../core/services/department.service';
import { Encounter } from '../../../core/models/encounter.model';
import { Patient } from '../../../core/models/patient.model';
import { Doctor } from '../../../core/models/doctor.model';
import { Department } from '../../../core/models/department.model';

interface EncounterListItem {
  encounter: Encounter;
  patient?: Patient;
  provider?: Doctor;
  department?: Department;
}

@Component({
  selector: 'app-clinical-encounters',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './clinical-encounters.component.html',
  styleUrls: ['./clinical-encounters.component.css']
})
export class ClinicalEncountersComponent implements OnInit {
  private encounterService = inject(EncounterService);
  private patientService = inject(PatientService);
  private doctorService = inject(DoctorService);
  private departmentService = inject(DepartmentService);
  router = inject(Router);

  encounters: EncounterListItem[] = [];
  filteredEncounters: EncounterListItem[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  // Filters
  dateRangeStart: string = '';
  dateRangeEnd: string = '';
  statusFilter: string = '';
  providerFilter: number | null = null;
  departmentFilter: number | null = null;

  // Lookups
  providers: Doctor[] = [];
  departments: Department[] = [];
  patients: Patient[] = [];

  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'ARRIVED', label: 'Arrived' },
    { value: 'ROOMING', label: 'Rooming' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' }
  ];

  ngOnInit() {
    this.initializeDateRange();
    this.loadData();
  }

  initializeDateRange() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    this.dateRangeStart = startOfDay.toISOString().split('T')[0];
    this.dateRangeEnd = today.toISOString().split('T')[0];
  }

  loadData() {
    this.isLoading = true;
    this.errorMessage = null;

    // Load all data in parallel
    Promise.all([
      this.encounterService.getAll().toPromise(),
      this.doctorService.getAll().toPromise(),
      this.departmentService.getAll().toPromise()
    ]).then(([encounters, doctors, departments]) => {
      this.providers = doctors || [];
      this.departments = departments || [];

      // Load patients for each encounter
      const patientIds = new Set<number>();
      (encounters || []).forEach(enc => {
        if (enc.patientId) {
          patientIds.add(enc.patientId);
        }
      });

      // Load all patients (simplified - in real app, load only needed)
      this.patientService.getAll().subscribe({
        next: (patients) => {
          this.patients = patients;
          this.buildEncounterList(encounters || []);
          this.applyFilters();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading patients:', err);
          this.buildEncounterList(encounters || []);
          this.applyFilters();
          this.isLoading = false;
        }
      });
    }).catch((err) => {
      console.error('Error loading data:', err);
      this.errorMessage = 'Failed to load encounters. Please try again.';
      this.isLoading = false;
    });
  }

  buildEncounterList(encounters: Encounter[]) {
    this.encounters = encounters.map(encounter => {
      const patient = this.patients.find(p => (p.id || p.patientId) === encounter.patientId);
      const provider = this.providers.find(d => d.id === encounter.primaryProviderId);
      const department = this.departments.find(dept => (dept.id || dept.departmentId) === encounter.departmentId);

      return {
        encounter,
        patient,
        provider,
        department
      };
    });

    // Sort by arrival date/time (most recent first)
    this.encounters.sort((a, b) => {
      const dateA = a.encounter.arrivalDateTime || a.encounter.checkInDateTime || '';
      const dateB = b.encounter.arrivalDateTime || b.encounter.checkInDateTime || '';
      return dateB.localeCompare(dateA);
    });
  }

  applyFilters() {
    let filtered = [...this.encounters];

    // Date range filter
    if (this.dateRangeStart) {
      const startDate = new Date(this.dateRangeStart);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(item => {
        const encounterDate = item.encounter.arrivalDateTime || item.encounter.checkInDateTime;
        if (!encounterDate) return false;
        const date = new Date(encounterDate);
        return date >= startDate;
      });
    }

    if (this.dateRangeEnd) {
      const endDate = new Date(this.dateRangeEnd);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => {
        const encounterDate = item.encounter.arrivalDateTime || item.encounter.checkInDateTime;
        if (!encounterDate) return false;
        const date = new Date(encounterDate);
        return date <= endDate;
      });
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(item => 
        item.encounter.encounterStatus === this.statusFilter
      );
    }

    // Provider filter
    if (this.providerFilter !== null) {
      filtered = filtered.filter(item => 
        item.encounter.primaryProviderId === this.providerFilter
      );
    }

    // Department filter
    if (this.departmentFilter) {
      filtered = filtered.filter(item => 
        item.encounter.departmentId === this.departmentFilter
      );
    }

    this.filteredEncounters = filtered;
  }

  onFilterChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.statusFilter = '';
    this.providerFilter = null;
    this.departmentFilter = null;
    this.initializeDateRange();
    this.applyFilters();
  }

  openEncounter(encounterId: number) {
    this.router.navigate(['/ambulatory/clinical-encounters', encounterId]);
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'ARRIVED':
        return 'status-arrived';
      case 'ROOMING':
        return 'status-rooming';
      case 'IN_PROGRESS':
        return 'status-in-progress';
      case 'COMPLETED':
        return 'status-completed';
      default:
        return 'status-unknown';
    }
  }

  getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'ARRIVED':
        return 'Arrived';
      case 'ROOMING':
        return 'Rooming';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status || 'Unknown';
    }
  }

  formatDateTime(dateTime: string | undefined): string {
    if (!dateTime) return '-';
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPatientName(item: EncounterListItem): string {
    if (item.patient) {
      return `${item.patient.firstName} ${item.patient.lastName}`;
    }
    return `Patient #${item.encounter.patientId}`;
  }

  getProviderName(item: EncounterListItem): string {
    if (item.provider) {
      return `Dr. ${item.provider.firstName} ${item.provider.lastName}`;
    }
    return item.encounter.primaryProviderId ? `Provider #${item.encounter.primaryProviderId}` : '-';
  }

  getProviderId(provider: Doctor): number | null {
    return provider.id || null;
  }

  getDepartmentName(item: EncounterListItem): string {
    return item.department?.name || '-';
  }
}

