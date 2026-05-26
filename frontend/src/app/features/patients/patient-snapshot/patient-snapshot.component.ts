import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../../core/services/patient.service';
import { CoverageService } from '../../../core/services/coverage.service';
import { BillingMockService } from '../../../core/services/billing-mock.service';
import { ActivityService } from '../../../core/services/activity.service';
import { RoleService } from '../../../core/services/role.service';
import { Patient } from '../../../core/models/patient.model';
import { Coverage } from '../../../core/models/coverage.model';
import { PatientBalance, PatientStatement, PatientPayment, PatientActivity, PatientVisit, Guarantor } from '../../../core/models/patient-snapshot.model';
import { PatientUpdateDrawerComponent } from '../patient-update-drawer/patient-update-drawer.component';
import { PhoneFormatPipe } from '../../../core/pipes/phone-format.pipe';
import { Subscription, combineLatest } from 'rxjs';

@Component({
  selector: 'app-patient-snapshot',
  standalone: true,
  imports: [CommonModule, FormsModule, PatientUpdateDrawerComponent, PhoneFormatPipe],
  templateUrl: './patient-snapshot.component.html',
  styleUrls: ['./patient-snapshot.component.scss']
})
export class PatientSnapshotComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private patientService = inject(PatientService);
  private coverageService = inject(CoverageService);
  private billingService = inject(BillingMockService);
  private activityService = inject(ActivityService);
  private roleService = inject(RoleService);

  patientId!: number;
  patient: Patient | null = null;
  coverages: Coverage[] = [];
  balance: PatientBalance | null = null;
  statements: PatientStatement[] = [];
  payments: PatientPayment[] = [];
  visits: PatientVisit[] = [];
  activities: PatientActivity[] = [];
  guarantor: Guarantor | null = null;
  showUpdateDrawer = false;
  newActivityComment = '';
  newActivityType: PatientActivity['type'] = 'NOTE';

  canEdit = false;
  isLoading = true;
  error: string | null = null;

  private subscriptions: Subscription[] = [];

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.patientId = +params['id'];
      if (this.patientId) {
        this.loadPatientData();
        this.checkPermissions();
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  checkPermissions() {
    const role = this.roleService.getCurrentRole();
    this.canEdit = role === 'ADMIN' || role === 'FRONT_DESK';
  }

  loadPatientData() {
    this.isLoading = true;
    this.error = null;

    combineLatest([
      this.patientService.getPatient(this.patientId),
      this.coverageService.getCoverages(this.patientId),
      this.billingService.getBalances(this.patientId),
      this.billingService.getStatements(this.patientId),
      this.billingService.getPayments(this.patientId),
      this.activityService.listActivities(this.patientId)
    ]).subscribe({
      next: ([patient, coverages, balance, statements, payments, activities]) => {
        this.patient = patient;
        this.coverages = coverages;
        this.balance = balance;
        this.statements = statements;
        this.payments = payments;
        this.activities = activities;
        this.loadGuarantor();
        this.loadVisits();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load patient data';
        console.error('Error loading patient data:', err);
        this.isLoading = false;
      }
    });
  }

  loadGuarantor() {
    // Mock guarantor data - in real app, this would come from a service
    if (this.patient) {
      this.guarantor = {
        id: 1,
        patientId: this.patientId,
        relationship: 'Self',
        firstName: this.patient.firstName,
        lastName: this.patient.lastName,
        dateOfBirth: this.patient.dateOfBirth,
        addressLine1: this.patient.addressLine1,
        addressLine2: this.patient.addressLine2,
        city: this.patient.city,
        state: this.patient.state,
        zipCode: this.patient.zipCode || this.patient.pincode,
        homePhone: this.patient.phoneNumber,
        mobilePhone: this.patient.phoneNumber,
        myChartStatus: 'ENROLLED'
      };
    }
  }

  loadVisits() {
    // Mock visit data - in real app, this would come from appointments/encounters service
    this.visits = [
      {
        id: 1,
        patientId: this.patientId,
        visitDate: '2024-12-15',
        department: 'Cardiology',
        provider: 'Dr. Sarah Johnson',
        copay: 25.00,
        status: 'COMPLETED'
      },
      {
        id: 2,
        patientId: this.patientId,
        visitDate: '2024-11-20',
        department: 'Primary Care',
        provider: 'Dr. Michael Williams',
        copay: 25.00,
        status: 'COMPLETED'
      },
      {
        id: 3,
        patientId: this.patientId,
        visitDate: '2024-10-10',
        department: 'Cardiology',
        provider: 'Dr. Sarah Johnson',
        copay: 25.00,
        status: 'COMPLETED'
      }
    ];
  }

  openUpdateDrawer() {
    this.showUpdateDrawer = true;
  }

  closeUpdateDrawer() {
    this.showUpdateDrawer = false;
    this.loadPatientData(); // Refresh data after update
  }

  addActivity() {
    if (!this.newActivityComment.trim()) {
      return;
    }

    this.activityService.addActivity(this.patientId, this.newActivityType, this.newActivityComment)
      .subscribe({
        next: () => {
          this.newActivityComment = '';
          this.loadPatientData();
        },
        error: (err) => {
          console.error('Failed to add activity:', err);
          alert('Failed to add activity. Please try again.');
        }
      });
  }

  getAge(dateOfBirth?: string): number | null {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getTimeAgo(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return this.formatDate(timestamp);
  }

  print() {
    window.print();
  }

  close() {
    this.router.navigate(['/admin/patients']);
  }
}

