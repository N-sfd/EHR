import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

type Tab = 'active' | 'past';

@Component({
  selector: 'app-patient-medications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './medications.component.html',
  styleUrls: ['./medications.component.css']
})
export class MedicationsComponent implements OnInit {
  private http = inject(HttpClient);

  allMeds: any[] = [];
  isLoading = true;
  activeTab: Tab = 'active';
  refillSuccess: number | null = null;
  refillError: string | null = null;

  ngOnInit(): void {
    this.http.get<any[]>('/api/meds', { withCredentials: true })
      .pipe(catchError(() => of([])))
      .subscribe(data => {
        this.allMeds = data || [];
        this.isLoading = false;
      });
  }

  get active(): any[] { return this.allMeds.filter(m => m.isActive); }
  get past(): any[]   { return this.allMeds.filter(m => !m.isActive); }
  get displayed(): any[] { return this.activeTab === 'active' ? this.active : this.past; }

  setTab(t: Tab): void { this.activeTab = t; }

  requestRefill(med: any): void {
    this.refillSuccess = null;
    this.refillError = null;
    this.http.post<any>(`/api/meds/${med.medicationId}/refill-request`, null, { withCredentials: true })
      .pipe(catchError(err => { this.refillError = 'Refill request failed. Please try again.'; return of(null); }))
      .subscribe(res => { if (res) this.refillSuccess = med.medicationId; });
  }
}
