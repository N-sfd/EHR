import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
  constructor(private router: Router) {
    // Component initialized
  }

  managementModules = [
    {
      title: 'Doctors Management',
      description: 'Manage doctor profiles, schedules, and professional information.',
      icon: 'fa-user-doctor',
      route: '/admin/doctors',
      buttons: ['Profiles', 'Schedule', 'Records']
    },
    {
      title: 'Staff Management',
      description: 'Manage staff members, roles, and department assignments.',
      icon: 'fa-users',
      route: '/admin/staffs',
      buttons: ['Directory', 'Roles', 'Assignments']
    },
    {
      title: 'Patient Management',
      description: 'Comprehensive patient records, history, and care management.',
      icon: 'fa-bed-pulse',
      route: '/admin/patients',
      buttons: ['Records', 'History', 'Care Plans']
    },
    {
      title: 'Appointment Scheduling',
      description: 'Efficient scheduling system for doctors and patients.',
      icon: 'fa-calendar-check',
      route: '/admin/appointments',
      buttons: ['Booking', 'Calendar', 'Reminders']
    },
    {
      title: 'Billing and Invoicing',
      description: 'Streamlined billing, insurance claim processing, and payment tracking.',
      icon: 'fa-file-invoice-dollar',
      route: '/admin/billing',
      buttons: ['Invoicing', 'Payment', 'Claims']
    },
    {
      title: 'Pharmacy Management',
      description: 'Complete pharmacy inventory and prescription management.',
      icon: 'fa-pills',
      route: '/admin/pharmacy',
      buttons: ['Inventory', 'Prescriptions', 'Dispensing']
    },
    {
      title: 'Lab & Radiology Info System',
      description: 'Laboratory tests, radiology reports, and diagnostic imaging.',
      icon: 'fa-flask',
      route: '/admin/lab-radiology',
      buttons: ['Lab Tests', 'Reports', 'Imaging']
    },
    {
      title: 'Electronic Prescription',
      description: 'Digital prescription management and e-prescribing system.',
      icon: 'fa-prescription',
      route: '/admin/prescriptions',
      buttons: ['E-Prescribe', 'Digital', 'Secure']
    },
    {
      title: 'Inventory Manager',
      description: 'Medical supplies, equipment, and inventory tracking.',
      icon: 'fa-boxes-stacked',
      route: '/admin/inventory',
      buttons: ['Supplies', 'Equipment', 'Tracking']
    },
    {
      title: 'Telehealth',
      description: 'Remote consultation and virtual healthcare services.',
      icon: 'fa-video',
      route: '/admin/telehealth',
      buttons: ['Video Calls', 'Virtual', 'Consultation']
    }
  ];

  navigateToModule(route: string) {
    this.router.navigate([route]);
  }

  navigateToFeature(module: any, feature: string) {
    if (module.title === 'Doctors Management') {
      switch(feature) {
        case 'Profiles':
          this.router.navigate(['/admin/doctors']);
          break;
        case 'Schedule':
          this.router.navigate(['/admin/doctors/schedule']);
          break;
        case 'Records':
          this.router.navigate(['/admin/doctors']);
          break;
        default:
          this.router.navigate([module.route]);
      }
    } else if (module.title === 'Staff Management') {
      switch(feature) {
        case 'Directory':
          this.router.navigate(['/admin/staffs']);
          break;
        case 'Roles':
          this.router.navigate(['/admin/staffs'], { queryParams: { view: 'roles' } });
          break;
        case 'Assignments':
          this.router.navigate(['/admin/staffs'], { queryParams: { view: 'assignments' } });
          break;
        default:
          this.router.navigate([module.route]);
      }
    } else if (module.title === 'Appointment Scheduling') {
      switch(feature) {
        case 'Booking':
          this.router.navigate(['/admin/appointments']);
          break;
        case 'Calendar':
          this.router.navigate(['/admin/appointments/calendar']);
          break;
        case 'Reminders':
          // For now, navigate to appointments list with reminders filter
          // TODO: Create a dedicated reminders component if needed
          this.router.navigate(['/admin/appointments'], { queryParams: { view: 'reminders' } });
          break;
        default:
          this.router.navigate([module.route]);
      }
    } else {
      // Default navigation for other modules
      this.router.navigate([module.route]);
    }
  }
}

