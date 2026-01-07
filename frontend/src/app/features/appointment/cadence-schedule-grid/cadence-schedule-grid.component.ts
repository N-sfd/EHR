import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ScheduleGridService } from '../../../core/services/schedule-grid.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { ScheduleGrid, TimeSlot } from '../../../core/models/schedule-grid.model';
import { Doctor } from '../../../core/models/doctor.model';

@Component({
  selector: 'app-cadence-schedule-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadence-schedule-grid.component.html',
  styleUrls: ['./cadence-schedule-grid.component.css']
})
export class CadenceScheduleGridComponent implements OnInit {
  private scheduleGridService = inject(ScheduleGridService);
  private doctorService = inject(DoctorService);
  router = inject(Router);

  selectedDate: Date = new Date();
  selectedProviders: number[] = [];
  providers: Doctor[] = [];
  scheduleGrids: ScheduleGrid[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  
  // Mock data fallback
  private useMockData = false;

  // View options
  viewMode: 'day' | 'week' | 'month' = 'day';
  slotInterval: 15 | 30 = 15;

  ngOnInit() {
    this.loadProviders();
  }

  loadProviders(): void {
    this.isLoading = true;
    this.doctorService.getAll().subscribe({
      next: (doctors: Doctor[]) => {
        this.providers = doctors;
        if (doctors.length > 0) {
          // Select first 4 providers by default
          this.selectedProviders = doctors.slice(0, 4).map(d => d.id || 0);
          this.loadScheduleGrids();
        } else {
          this.isLoading = false;
          this.errorMessage = 'No providers available';
        }
      },
      error: (err: any) => {
        console.error('Error loading providers:', err);
        this.errorMessage = 'Failed to load providers - using mock data';
        // Fallback to mock providers
        this.providers = this.getMockProviders();
        this.selectedProviders = this.providers.slice(0, 4).map(d => d.id || 0);
        this.isLoading = false;
        this.loadScheduleGrids();
      }
    });
  }

  private getMockProviders(): Doctor[] {
    return [
      { id: 1, firstName: 'John', lastName: 'Smith', doctorCode: 'DOC001', specializations: [] },
      { id: 2, firstName: 'Sarah', lastName: 'Johnson', doctorCode: 'DOC002', specializations: [] },
      { id: 3, firstName: 'Michael', lastName: 'Williams', doctorCode: 'DOC003', specializations: [] },
      { id: 4, firstName: 'Emily', lastName: 'Brown', doctorCode: 'DOC004', specializations: [] }
    ] as Doctor[];
  }

  loadScheduleGrids() {
    if (this.selectedProviders.length === 0) {
      this.scheduleGrids = [];
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const dateStr = this.formatDate(this.selectedDate);
    
    this.scheduleGridService.getMultiProviderScheduleGrid(this.selectedProviders, dateStr).subscribe({
      next: (grids) => {
        this.scheduleGrids = grids;
        this.isLoading = false;
        this.useMockData = false;
      },
      error: (err) => {
        console.error('Error loading schedule grids:', err);
        // Fallback to mock data if backend unavailable
        this.loadMockScheduleGrids();
        this.isLoading = false;
      }
    });
  }

  private loadMockScheduleGrids() {
    this.useMockData = true;
    const dateStr = this.formatDate(this.selectedDate);
    
    // Generate mock schedule grids for selected providers
    this.scheduleGrids = this.selectedProviders.map(providerId => {
      const provider = this.providers.find(p => p.id === providerId);
      const timeSlots: TimeSlot[] = [];
      
      // Generate time slots from 8 AM to 5 PM
      for (let hour = 8; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += this.slotInterval) {
          const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
          const endHour = minute + this.slotInterval >= 60 ? hour + 1 : hour;
          const endMinute = (minute + this.slotInterval) % 60;
          const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`;
          
          // Randomly assign status for demo
          const rand = Math.random();
          let status: 'AVAILABLE' | 'BOOKED' | 'OVERBOOK' | 'BLOCKED' = 'AVAILABLE';
          let colorCode: 'blue' | 'red' | 'yellow' | 'green' = 'blue';
          
          if (rand < 0.3) {
            status = 'BOOKED';
            colorCode = 'red';
          } else if (rand < 0.35) {
            status = 'OVERBOOK';
            colorCode = 'yellow';
          } else if (rand < 0.4) {
            status = 'BLOCKED';
            colorCode = 'green';
          }
          
          timeSlots.push({
            startTime,
            endTime,
            status,
            colorCode,
            isSelectable: status === 'AVAILABLE',
            appointment: status === 'BOOKED' ? {
              appointmentId: Math.floor(Math.random() * 1000),
              appointmentCode: `AP${Math.floor(Math.random() * 100000)}`,
              patientId: Math.floor(Math.random() * 100),
              patientName: 'Sample Patient',
              visitType: 'Follow-up',
              durationMinutes: this.slotInterval,
              status: 'Schedule'
            } : undefined
          });
        }
      }
      
      return {
        providerId,
        providerName: provider ? `${provider.firstName} ${provider.lastName}` : `Provider ${providerId}`,
        scheduleDate: dateStr,
        startTime: '08:00:00',
        endTime: '17:00:00',
        slotIntervalMinutes: this.slotInterval,
        timeSlots
      };
    });
    
    this.errorMessage = 'Using mock data - backend unavailable';
  }

  onDateChange() {
    this.loadScheduleGrids();
  }

  onProviderToggle(providerId: number) {
    const index = this.selectedProviders.indexOf(providerId);
    if (index > -1) {
      this.selectedProviders.splice(index, 1);
    } else {
      this.selectedProviders.push(providerId);
    }
    this.loadScheduleGrids();
  }

  onSlotClick(slot: TimeSlot, providerId: number) {
    if (slot.isSelectable && slot.status === 'AVAILABLE') {
      // Navigate to book appointment
      const timeStr = this.formatTime(slot.startTime);
      this.router.navigate(['/admin/appointments/new'], {
        queryParams: {
          providerId: providerId,
          date: this.formatDate(this.selectedDate),
          time: timeStr,
          duration: this.slotInterval
        }
      });
    } else if (slot.appointment) {
      // View/edit appointment
      this.router.navigate(['/admin/appointments/view', slot.appointment.appointmentId]);
    }
  }

  getSlotClass(slot: TimeSlot): string {
    const baseClass = 'time-slot';
    const statusClass = `slot-${slot.status.toLowerCase()}`;
    const colorClass = `color-${slot.colorCode}`;
    return `${baseClass} ${statusClass} ${colorClass}`;
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatTime(time: string): string {
    // Convert "HH:mm:ss" to "HH:mm AM/PM"
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  previousDay() {
    this.selectedDate = new Date(this.selectedDate);
    this.selectedDate.setDate(this.selectedDate.getDate() - 1);
    this.loadScheduleGrids();
  }

  nextDay() {
    this.selectedDate = new Date(this.selectedDate);
    this.selectedDate.setDate(this.selectedDate.getDate() + 1);
    this.loadScheduleGrids();
  }

  goToToday() {
    this.selectedDate = new Date();
    this.loadScheduleGrids();
  }

  getDateDisplay(): string {
    return this.selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getTimeSlots(): string[] {
    const slots: string[] = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += this.slotInterval) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
        slots.push(timeStr);
      }
    }
    return slots;
  }

  formatTimeLabel(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  getSlotTooltip(slot: TimeSlot): string {
    if (slot.appointment) {
      return `${slot.appointment.patientName} - ${slot.appointment.visitType || 'Visit'}`;
    }
    return `Available slot - Click to book`;
  }
}

