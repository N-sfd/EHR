import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EncounterService } from '../../../core/services/encounter.service';
import { RoomingService } from '../../../core/services/rooming.service';
import { ProviderEncounterService } from '../../../core/services/provider-encounter.service';
import { CheckoutService } from '../../../core/services/checkout.service';
import { PatientService } from '../../../core/services/patient.service';
import { Encounter } from '../../../core/models/encounter.model';
import { Rooming, ProviderEncounter, Checkout } from '../../../core/models/ambulatory.model';
import { Patient } from '../../../core/models/patient.model';
import { RoomingFormComponent } from '../rooming-form/rooming-form.component';
import { ProviderEncounterFormComponent } from '../provider-encounter-form/provider-encounter-form.component';
import { CheckoutFormComponent } from '../checkout-form/checkout-form.component';

@Component({
  selector: 'app-ambulatory-encounter',
  standalone: true,
  imports: [CommonModule, FormsModule, RoomingFormComponent, ProviderEncounterFormComponent, CheckoutFormComponent],
  templateUrl: './ambulatory-encounter.component.html',
  styleUrls: ['./ambulatory-encounter.component.css']
})
export class AmbulatoryEncounterComponent implements OnInit {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private encounterService = inject(EncounterService);
  private roomingService = inject(RoomingService);
  private providerEncounterService = inject(ProviderEncounterService);
  private checkoutService = inject(CheckoutService);
  private patientService = inject(PatientService);

  encounterId?: number;
  appointmentId?: number;
  encounter: Encounter | null = null;
  patient: Patient | null = null;
  rooming: Rooming | null = null;
  providerEncounter: ProviderEncounter | null = null;
  checkout: Checkout | null = null;

  activeTab: 'summary' | 'rooming' | 'provider' | 'checkout' = 'summary';
  isLoading = false;
  errorMessage: string | null = null;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.encounterId = params['encounterId'] ? +params['encounterId'] : undefined;
      this.appointmentId = params['appointmentId'] ? +params['appointmentId'] : undefined;
      if (this.encounterId) {
        this.loadEncounter();
      }
    });
  }

  loadEncounter() {
    if (!this.encounterId) return;

    this.isLoading = true;
    this.encounterService.get(this.encounterId).subscribe({
      next: (encounter: Encounter) => {
        this.encounter = encounter;
        if (encounter.patientId) {
          this.loadPatient(encounter.patientId);
        }
        this.loadRooming();
        this.loadProviderEncounter();
        this.loadCheckout();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading encounter:', err);
        this.errorMessage = 'Failed to load encounter';
        this.isLoading = false;
      }
    });
  }

  loadPatient(patientId: number) {
    this.patientService.getById(patientId).subscribe({
      next: (patient: Patient) => {
        this.patient = patient;
      },
      error: (err: any) => {
        console.error('Error loading patient:', err);
      }
    });
  }

  loadRooming() {
    if (!this.encounterId) return;
    this.roomingService.getByEncounterId(this.encounterId).subscribe({
      next: (rooming: Rooming) => {
        this.rooming = rooming;
      },
      error: () => {
        // Rooming may not exist yet
        this.rooming = null;
      }
    });
  }

  loadProviderEncounter() {
    if (!this.encounterId) return;
    this.providerEncounterService.getByEncounterId(this.encounterId).subscribe({
      next: (encounter: ProviderEncounter) => {
        this.providerEncounter = encounter;
      },
      error: () => {
        this.providerEncounter = null;
      }
    });
  }

  loadCheckout() {
    if (!this.encounterId) return;
    this.checkoutService.getByEncounterId(this.encounterId).subscribe({
      next: (checkout: Checkout) => {
        this.checkout = checkout;
      },
      error: () => {
        this.checkout = null;
      }
    });
  }

  setActiveTab(tab: 'summary' | 'rooming' | 'provider' | 'checkout') {
    this.activeTab = tab;
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

