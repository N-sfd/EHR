import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentBlock } from '../models/appointment-scheduling.models';

@Component({
  selector: 'app-appointment-detail-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment-detail-panel.component.html',
  styleUrls: ['./appointment-detail-panel.component.scss']
})
export class AppointmentDetailPanelComponent implements OnInit, OnChanges {
  @Input() appointment: AppointmentBlock | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() statusChange = new EventEmitter<{ id: number; status: string; reason?: string }>();

  selectedStatus: string = '';
  statusReason: string = '';
  showReasonInput: boolean = false;

  readonly statuses = [
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'ARRIVED', label: 'Arrived' },
    { value: 'CHECKED_IN', label: 'Checked In' },
    { value: 'CHECKED_OUT', label: 'Checked Out' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'NO_SHOW', label: 'No Show' }
  ];

  ngOnInit(): void {
    if (this.appointment) {
      this.selectedStatus = this.normalizeStatus(this.appointment.status || 'SCHEDULED');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appointment'] && this.appointment) {
      this.selectedStatus = this.normalizeStatus(this.appointment.status || 'SCHEDULED');
      this.statusReason = '';
      this.showReasonInput = false;
    }
  }

  onStatusSelect(status: string): void {
    this.selectedStatus = status;
    this.showReasonInput = status === 'CANCELLED' || status === 'NO_SHOW';
    if (!this.showReasonInput) {
      this.statusReason = '';
    }
  }

  updateStatus(): void {
    if (!this.appointment) return;

    // Validate reason for CANCELLED/NO_SHOW
    if ((this.selectedStatus === 'CANCELLED' || this.selectedStatus === 'NO_SHOW') 
        && (!this.statusReason || this.statusReason.trim().length === 0)) {
      alert('Reason is required for Cancelled or No Show status');
      return;
    }

    this.statusChange.emit({
      id: this.appointment.id || this.appointment.appointmentId || 0,
      status: this.selectedStatus,
      reason: this.statusReason?.trim() || undefined
    });
  }

  onClose(): void {
    this.close.emit();
  }

  formatDateTime(dateTimeStr: string): string {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  getDurationMinutes(): number {
    if (!this.appointment) return 0;
    return this.appointment.durationMinutes || 15;
  }

  private normalizeStatus(status: string): string {
    if (!status) return 'SCHEDULED';
    const upper = status.toUpperCase().replace(/[^A-Z_]/g, '_');
    if (upper.includes('SCHEDULED') || upper.includes('SCHEDULE')) return 'SCHEDULED';
    if (upper.includes('CONFIRMED')) return 'CONFIRMED';
    if (upper.includes('ARRIVED')) return 'ARRIVED';
    if (upper.includes('CHECKED_IN') || upper.includes('CHECKED IN')) return 'CHECKED_IN';
    if (upper.includes('CHECKED_OUT') || upper.includes('CHECKED OUT')) return 'CHECKED_OUT';
    if (upper.includes('CANCELLED') || upper.includes('CANCELED')) return 'CANCELLED';
    if (upper.includes('NO_SHOW') || upper.includes('NOSHOW') || upper.includes('NO SHOW')) return 'NO_SHOW';
    return 'SCHEDULED';
  }
}

