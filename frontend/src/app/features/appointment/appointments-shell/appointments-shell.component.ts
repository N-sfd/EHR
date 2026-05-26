import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-appointments-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './appointments-shell.component.html',
  styleUrls: ['./appointments-shell.component.scss']
})
export class AppointmentsShellComponent {
  navTabs = [
    { label: 'Schedule Grid', route: '/admin/appointments/grid', icon: 'fa-calendar-grid' },
    { label: 'New Appointment', route: '/admin/appointments/new', icon: 'fa-calendar-plus' }
  ];
}

