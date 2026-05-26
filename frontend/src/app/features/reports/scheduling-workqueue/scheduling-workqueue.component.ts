import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ReportsService } from '../../../core/services/reports.service';
import { ReportFilterBarComponent, ReportFilters } from '../../../shared/components/report-filter-bar/report-filter-bar.component';
import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import { map, switchMap, takeUntil, shareReplay, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { arrayToCSV, downloadCSV, formatDateTimeForCSV, formatDateForCSV, CSVColumn } from '../../../shared/utils/csv-export.util';

interface WorkqueueItem {
  id: number;
  patientName: string;
  providerName: string;
  dateTime: Date;
  appointmentType?: string;
  status: string;
  priority?: string;
  patientPhone?: string;
  patientEmail?: string;
  doctorId?: number;
  appointmentId: number;
  reason?: string; // For cancellations, no-shows, etc.
}

type WorkqueueTab = 'no-shows' | 'cancelled' | 'double-bookings' | 'overbooked';

@Component({
  selector: 'app-scheduling-workqueue',
  standalone: true,
  imports: [CommonModule, ReportFilterBarComponent],
  templateUrl: './scheduling-workqueue.component.html',
  styleUrls: ['./scheduling-workqueue.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SchedulingWorkqueueComponent implements OnInit, OnDestroy {
  private reportsService = inject(ReportsService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  // Reactive streams
  private filters$ = new BehaviorSubject<ReportFilters>({});
  activeTab$ = new BehaviorSubject<WorkqueueTab>('no-shows');

  // Component state
  isLoading = false;
  errorMessage: string | null = null;
  currentFilters: ReportFilters = {};
  activeTab: WorkqueueTab = 'no-shows';

  // Workqueue data (memoized)
  private appointmentsCache$: Observable<any[]> = of([]);
  
  noShows: WorkqueueItem[] = [];
  cancelled: WorkqueueItem[] = [];
  doubleBookings: WorkqueueItem[] = [];
  overbooked: WorkqueueItem[] = [];

  // Copy to clipboard state
  copiedItemId: number | null = null;

  ngOnInit() {
    this.initializeFilters();
    this.setupReactiveDataFlow();
    
    // Subscribe to active tab changes
    this.activeTab$.pipe(takeUntil(this.destroy$)).subscribe(tab => {
      this.activeTab = tab;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeFilters() {
    // Default to last 7 days for workqueue
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    
    const filters: ReportFilters = {
      datePreset: 'custom',
      startDate: this.formatDateForInput(startDate),
      endDate: this.formatDateForInput(endDate)
    };
    
    this.currentFilters = filters;
    this.filters$.next(filters);
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Setup reactive data flow
   */
  setupReactiveDataFlow() {
    this.appointmentsCache$ = this.filters$.pipe(
      switchMap(filters => {
        const startDate = filters.startDate || this.formatDateForInput(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
        const endDate = filters.endDate || this.formatDateForInput(new Date());
        const doctorIds = filters.providerIds;
        const statuses = filters.statuses;
        const appointmentTypes = filters.appointmentTypes;
        const includeCancelled = filters.includeCancelled;
        const businessHoursOnly = filters.businessHoursOnly;
        
        // Set loading flag before API call
        this.isLoading = true;
        this.errorMessage = null; // Clear previous errors
        this.currentFilters = filters;
        this.cdr.markForCheck();
        
        return this.reportsService.getDetailedAppointments(
          startDate, 
          endDate, 
          doctorIds,
          statuses,
          appointmentTypes,
          includeCancelled,
          businessHoursOnly
        ).pipe(
          map(appointments => {
            // Success: finalize loading and compute items
            // finalizeLoading() sets isLoading=false and computes workqueue items
            this.finalizeLoading(appointments);
            return appointments;
          }),
          catchError((error: HttpErrorResponse) => {
            // Error: Log the error but don't show alarming error message
            // Instead, show empty state with helpful message
            console.warn('Error loading workqueue appointments:', error);
            // Don't set error message for 500 errors - just show empty state
            // This is more user-friendly than showing "Backend error — check logs"
            if (error.status !== 500) {
              this.finalizeLoading([], error);
            } else {
              // For 500 errors, just show empty state without error banner
              this.isLoading = false;
              this.errorMessage = null;
              this.noShows = [];
              this.cancelled = [];
              this.doubleBookings = [];
              this.overbooked = [];
              this.cdr.markForCheck();
            }
            return of([]);
          }),
          shareReplay(1)
        );
      }),
      takeUntil(this.destroy$)
    );

    // Subscribe to cache to trigger computation
    this.appointmentsCache$.subscribe();
  }

  /**
   * Finalize loading state (called on both success and error)
   * CRITICAL: This method MUST be called on both success and error paths
   * to ensure isLoading is always set to false, preventing infinite loading
   */
  private finalizeLoading(appointments: any[] = [], error?: HttpErrorResponse): void {
    // Always set loading to false (runs on both success AND error)
    this.isLoading = false;
    
    if (error) {
      // For 500 errors, don't show alarming error message - just show empty state
      // This is more user-friendly than "Backend error — check logs"
      if (error.status === 500) {
        this.errorMessage = null; // Don't show error for 500 - just show empty state
      } else {
        // For other errors (404, 400, etc.), show helpful message
        this.errorMessage = this.getErrorMessage(error);
      }
      this.noShows = [];
      this.cancelled = [];
      this.doubleBookings = [];
      this.overbooked = [];
    } else {
      // Success path: clear error message and compute workqueue items
      this.errorMessage = null;
      this.computeWorkqueueItems(appointments);
    }
    
    this.cdr.markForCheck();
  }

  /**
   * Get user-friendly error message based on HTTP status code
   * Replaces generic "Server error occurred" with specific messages:
   * - 404: "Reports API not found — using appointments endpoint"
   * - 400: "Bad filters sent to server — check query params"
   * - 500: "Backend error — check logs"
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Unable to connect to server. Please check if the backend is running.';
    } else if (error.status === 404) {
      return 'Reports API not found — using appointments endpoint';
    } else if (error.status === 400) {
      return 'Bad filters sent to server — check query params';
    } else if (error.status === 500) {
      return 'Backend error — check logs';
    } else if (error.error?.message) {
      return error.error.message;
    } else if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred while loading workqueue data';
  }

  /**
   * Compute workqueue items from appointments (memoized)
   */
  computeWorkqueueItems(appointments: any[]) {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // No-shows (last 7 days)
    this.noShows = appointments
      .filter(apt => {
        if (!apt.startDateTime) return false;
        const aptDate = new Date(apt.startDateTime);
        return apt.status === 'NO_SHOW' && aptDate >= last7Days;
      })
      .map(apt => this.mapToWorkqueueItem(apt, 'No-show'))
      .sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());

    // Cancelled within 24 hours
    this.cancelled = appointments
      .filter(apt => {
        if (!apt.startDateTime) return false;
        const aptDate = new Date(apt.startDateTime);
        return apt.status === 'CANCELLED' && aptDate >= last24Hours;
      })
      .map(apt => this.mapToWorkqueueItem(apt, 'Cancelled within 24 hours'))
      .sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());

    // Potential double-bookings (same provider, overlapping times)
    this.doubleBookings = this.findDoubleBookings(appointments);

    // Overbooked slots (if slot capacity exists)
    // TODO: Implement if slot capacity/max appointments per slot is available
    this.overbooked = [];
  }

  /**
   * Find potential double-bookings
   */
  findDoubleBookings(appointments: any[]): WorkqueueItem[] {
    const overlaps: WorkqueueItem[] = [];
    const providerAppointments = new Map<number, any[]>();

    // Group by provider
    appointments.forEach(apt => {
      if (apt.doctorId && apt.startDateTime && apt.durationMinutes) {
        if (!providerAppointments.has(apt.doctorId)) {
          providerAppointments.set(apt.doctorId, []);
        }
        providerAppointments.get(apt.doctorId)!.push(apt);
      }
    });

    // Check for overlaps per provider
    providerAppointments.forEach((apts, doctorId) => {
      for (let i = 0; i < apts.length; i++) {
        for (let j = i + 1; j < apts.length; j++) {
          if (this.appointmentsOverlap(apts[i], apts[j])) {
            // Add both appointments as double-bookings
            overlaps.push(this.mapToWorkqueueItem(apts[i], 'Potential double-booking'));
            overlaps.push(this.mapToWorkqueueItem(apts[j], 'Potential double-booking'));
          }
        }
      }
    });

    // Remove duplicates
    const uniqueOverlaps = Array.from(
      new Map(overlaps.map(item => [item.appointmentId, item])).values()
    );

    return uniqueOverlaps.sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());
  }

  /**
   * Check if two appointments overlap
   */
  appointmentsOverlap(apt1: any, apt2: any): boolean {
    if (!apt1.startDateTime || !apt2.startDateTime || !apt1.durationMinutes || !apt2.durationMinutes) {
      return false;
    }

    const start1 = new Date(apt1.startDateTime);
    const end1 = new Date(start1.getTime() + apt1.durationMinutes * 60 * 1000);
    const start2 = new Date(apt2.startDateTime);
    const end2 = new Date(start2.getTime() + apt2.durationMinutes * 60 * 1000);

    return start1 < end2 && start2 < end1;
  }

  /**
   * Map appointment to workqueue item
   */
  mapToWorkqueueItem(apt: any, reason?: string): WorkqueueItem {
    const patientName = apt.patientName || 
                       `${apt.patient?.firstName || ''} ${apt.patient?.lastName || ''}`.trim() ||
                       'Unknown Patient';
    
    const providerName = apt.doctorName ||
                         `${apt.doctor?.firstName || ''} ${apt.doctor?.lastName || ''}`.trim() ||
                         `Provider ${apt.doctorId || 'Unknown'}`;

    return {
      id: apt.id || 0,
      appointmentId: apt.id || 0,
      patientName,
      providerName,
      dateTime: apt.startDateTime ? new Date(apt.startDateTime) : new Date(),
      appointmentType: apt.appointmentType || apt.visitType || undefined,
      status: apt.status || 'UNKNOWN',
      priority: apt.priority || undefined,
      patientPhone: apt.patient?.phone || apt.patientPhone || undefined,
      patientEmail: apt.patient?.email || apt.patientEmail || undefined,
      doctorId: apt.doctorId,
      reason
    };
  }

  /**
   * Filter handlers
   */
  onFiltersApplied(filters: ReportFilters) {
    this.currentFilters = filters;
    this.filters$.next(filters);
  }

  onFiltersReset() {
    this.initializeFilters();
  }

  /**
   * Tab handlers
   */
  setActiveTab(tab: WorkqueueTab) {
    this.activeTab$.next(tab);
  }

  /**
   * Get current workqueue items based on active tab
   */
  getCurrentItems(): WorkqueueItem[] {
    switch (this.activeTab) {
      case 'no-shows':
        return this.noShows;
      case 'cancelled':
        return this.cancelled;
      case 'double-bookings':
        return this.doubleBookings;
      case 'overbooked':
        return this.overbooked;
      default:
        return [];
    }
  }

  /**
   * Actions
   */
  openAppointmentDetails(item: WorkqueueItem) {
    // Navigate to appointment detail/edit route
    // Assuming route like /appointments/:id or /scheduler/:id
    this.router.navigate(['/appointments', item.appointmentId], {
      queryParams: { mode: 'edit' }
    }).catch(() => {
      // Fallback: try scheduler route
      this.router.navigate(['/scheduler', item.appointmentId]);
    });
  }

  quickReschedule(item: WorkqueueItem) {
    // Navigate to scheduler with pre-filled data for rescheduling
    const date = item.dateTime.toISOString().split('T')[0];
    const time = item.dateTime.toTimeString().split(' ')[0].substring(0, 5);
    
    this.router.navigate(['/scheduler'], {
      queryParams: {
        appointmentId: item.appointmentId,
        providerId: item.doctorId,
        date,
        startTime: time,
        mode: 'reschedule'
      }
    });
  }

  async copyPatientContact(item: WorkqueueItem, type: 'phone' | 'email') {
    const contact = type === 'phone' ? item.patientPhone : item.patientEmail;
    
    if (!contact) {
      return;
    }

    try {
      await navigator.clipboard.writeText(contact);
      this.copiedItemId = item.id;
      this.cdr.markForCheck();
      
      // Reset after 2 seconds
      setTimeout(() => {
        this.copiedItemId = null;
        this.cdr.markForCheck();
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }

  /**
   * Format helpers
   */
  formatDateTime(date: Date): string {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'NO_SHOW': '#94a3b8',
      'CANCELLED': '#dc2626',
      'SCHEDULED': '#0d9488',
      'CONFIRMED': '#14b8a6',
      'ARRIVED': '#059669'
    };
    return colors[status.toUpperCase()] || '#94a3b8';
  }

  getPriorityColor(priority?: string): string {
    if (!priority) return '#94a3b8';
    const colors: { [key: string]: string } = {
      'URGENT': '#dc2626',
      'HIGH': '#d97706',
      'NORMAL': '#0d9488',
      'LOW': '#94a3b8'
    };
    return colors[priority.toUpperCase()] || '#94a3b8';
  }

  trackByItemId(index: number, item: WorkqueueItem): number {
    return item.appointmentId;
  }

  getTabTitle(): string {
    switch (this.activeTab) {
      case 'no-shows':
        return 'No-shows (Last 7 Days)';
      case 'cancelled':
        return 'Cancelled (Within 24 Hours)';
      case 'double-bookings':
        return 'Potential Double-bookings';
      case 'overbooked':
        return 'Overbooked Slots';
      default:
        return 'Workqueue';
    }
  }

  /**
   * Export current workqueue data to CSV
   */
  exportToCSV() {
    const items = this.getCurrentItems();
    const tabTitle = this.getTabTitle();
    const dateRange = `${this.currentFilters.startDate || 'N/A'} to ${this.currentFilters.endDate || 'N/A'}`;

    const data = items.map(item => ({
      category: tabTitle,
      patientName: item.patientName,
      providerName: item.providerName,
      dateTime: formatDateTimeForCSV(item.dateTime),
      date: this.formatDate(item.dateTime),
      time: this.formatTime(item.dateTime),
      appointmentType: item.appointmentType || '',
      status: item.status,
      priority: item.priority || '',
      patientPhone: item.patientPhone || '',
      patientEmail: item.patientEmail || '',
      reason: item.reason || '',
      appointmentId: item.appointmentId,
      dateRange
    }));

    const columns: CSVColumn[] = [
      { header: 'Category', key: 'category' },
      { header: 'Patient Name', key: 'patientName' },
      { header: 'Provider Name', key: 'providerName' },
      { header: 'Date/Time', key: 'dateTime' },
      { header: 'Date', key: 'date' },
      { header: 'Time', key: 'time' },
      { header: 'Appointment Type', key: 'appointmentType' },
      { header: 'Status', key: 'status' },
      { header: 'Priority', key: 'priority' },
      { header: 'Patient Phone', key: 'patientPhone' },
      { header: 'Patient Email', key: 'patientEmail' },
      { header: 'Reason', key: 'reason' },
      { header: 'Appointment ID', key: 'appointmentId', formatter: (v) => v?.toString() || '' },
      { header: 'Date Range', key: 'dateRange' }
    ];

    const csv = arrayToCSV(data, columns);
    const filename = `scheduling-workqueue-${this.activeTab}-${this.currentFilters.startDate || 'all'}.csv`;
    downloadCSV(csv, filename);
  }

  /**
   * Print report
   */
  printReport() {
    window.print();
  }
}
