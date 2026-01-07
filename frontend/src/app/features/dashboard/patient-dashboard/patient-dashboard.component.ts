import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css']
})
export class PatientDashboardComponent {
  constructor(private router: Router) {}

  navigateToRecords() {
    this.router.navigate(['/admin/patients']);
  }

  navigateToHistory() {
    this.router.navigate(['/admin/patients'], { queryParams: { view: 'history' } });
  }

  navigateToCarePlans() {
    this.router.navigate(['/admin/patients'], { queryParams: { view: 'care-plans' } });
  }
}

