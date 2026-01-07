import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor(private router: Router) {}

  navigateToDoctors() {
    this.router.navigate(['/admin/doctors']);
  }

  navigateToDoctorSchedule() {
    this.router.navigate(['/admin/doctors/schedule']);
  }

  navigateToDoctorRecords() {
    // Navigate to doctors list which shows records
    this.router.navigate(['/admin/doctors']);
  }

  navigateToStaff() {
    this.router.navigate(['/admin/staffs']);
  }

  navigateToStaffRoles() {
    // Navigate to roles management (you may need to create this route)
    this.router.navigate(['/admin/staffs'], { queryParams: { view: 'roles' } });
  }

  navigateToStaffAssignments() {
    // Navigate to assignments management
    this.router.navigate(['/admin/staffs'], { queryParams: { view: 'assignments' } });
  }

  navigateToPatientManagement() {
    this.router.navigate(['/admin/patient-management']);
  }
}


