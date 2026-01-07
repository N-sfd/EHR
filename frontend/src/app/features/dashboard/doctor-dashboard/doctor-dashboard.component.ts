import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css']
})
export class DoctorDashboardComponent {
  totalAppointments = 658;
  onlineConsultations = 125;
  cancelledAppointments = 35;
  
  appointmentStatsPeriod = 'Monthly';
  
  upcomingAppointment = {
    patient: 'Andrew Billard',
    id: '#AP455698',
    type: 'General Visit',
    date: 'Monday, 31 Mar 2025',
    time: '06:30 PM',
    department: 'Cardiology',
    appointmentType: 'Online Consultation',
    patientImg: 'https://i.pravatar.cc/60?img=50'
  };
}

