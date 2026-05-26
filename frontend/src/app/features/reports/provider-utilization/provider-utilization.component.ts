import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ReportsService } from '../../../core/services/reports.service';
import { ReportFilterBarComponent, ReportFilters } from '../../../shared/components/report-filter-bar/report-filter-bar.component';
import { DoctorService } from '../../../core/services/doctor.service';
import { MasterDataService } from '../../../core/services/master-data.service';
import { Doctor } from '../../../core/models/doctor.model';
import { MasterDepartment } from '../../../core/models/master-data.model';
import { BehaviorSubject, Observable, combineLatest, Subject } from 'rxjs';
import { map, switchMap, catchError, startWith, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs';
import { arrayToCSV, downloadCSV, formatDateForCSV, CSVColumn } from '../../../shared/utils/csv-export.util';

interface ProviderMetric {
  doctor: Doctor;
  totalAppointments: number;
  totalMinutesBooked: number;
  completedAppointments: number;
  cancelledAppointments: number;
  utilizationRate: number; // Percentage
  averageDuration: number;
  revenue?: number;
}

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  doctorId?: number;
  date?: string;
  doctor?: Doctor; // Include doctor object for avatar access
}

@Component({
  selector: 'app-provider-utilization',
  standalone: true,
  imports: [CommonModule, FormsModule, ReportFilterBarComponent],
  templateUrl: './provider-utilization.component.html',
  styleUrls: ['./provider-utilization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProviderUtilizationComponent implements OnInit, OnDestroy {
  private reportsService = inject(ReportsService);
  private doctorService = inject(DoctorService);
  private masterDataService = inject(MasterDataService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  // Reactive streams
  private filters$ = new BehaviorSubject<ReportFilters>({});
  selectedProvider$ = new BehaviorSubject<number | null>(null);

  // Filters (from filter bar)
  startDate: string = '';
  endDate: string = '';
  currentFilters: ReportFilters = {};

  // Data
  doctors: Doctor[] = [];
  departments: MasterDepartment[] = [];
  appointments: any[] = []; // Raw appointments from API

  // Provider Metrics (computed from utilization data)
  providerMetrics: ProviderMetric[] = [];
  topProviders: ProviderMetric[] = [];
  lowUtilizationProviders: ProviderMetric[] = [];

  // Aggregate KPIs
  totalBookedMinutes = 0;
  avgAppointmentsPerProviderPerDay = 0;
  averageUtilization = 0; // Only show if availability data exists
  hasAvailabilityData = false; // Flag to show/hide utilization%

  // Selected provider drilldown data
  selectedProviderId: number | null = null;
  selectedProviderDetails: {
    provider: ProviderMetric | null;
    dailyTrend: ChartDataPoint[];
    statusBreakdown: ChartDataPoint[];
    appointmentTypeBreakdown: ChartDataPoint[];
    busiestHour: number | null;
    busiestDay: string | null;
  } = {
    provider: null,
    dailyTrend: [],
    statusBreakdown: [],
    appointmentTypeBreakdown: [],
    busiestHour: null,
    busiestDay: null
  };

  // Chart Data
  providersByBookedMinutes: ChartDataPoint[] = []; // Bar chart - ranked by minutes
  selectedProviderDailyTrend: ChartDataPoint[] = []; // Trend chart for selected provider

  isLoading = false;
  errorMessage: string | null = null;

  ngOnInit() {
    this.initializeDates();
    this.loadDepartments();
    this.loadDoctors();
    this.setupReactiveDataFlow();
    this.setupSelectedProviderFlow();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeDates() {
    const today = new Date();
    const start = new Date(today);
    start.setMonth(today.getMonth() - 1); // Default to last month
    this.startDate = this.formatDateForInput(start);
    this.endDate = this.formatDateForInput(today);
    
    // Initialize filters
    this.filters$.next({
      datePreset: 'month',
      startDate: this.startDate,
      endDate: this.endDate
    });
  }

  /**
   * Setup reactive data flow - fetch appointments and compute utilization client-side
   */
  setupReactiveDataFlow() {
    this.filters$.pipe(
      switchMap(filters => {
        const startDate = filters.startDate || this.startDate;
        const endDate = filters.endDate || this.endDate;
        const doctorIds = filters.providerIds;
        const statuses = filters.statuses;
        const appointmentTypes = filters.appointmentTypes;
        const includeCancelled = filters.includeCancelled;
        const businessHoursOnly = filters.businessHoursOnly;
        
        this.isLoading = true;
        this.errorMessage = null; // Clear previous errors
        this.currentFilters = filters;
        this.cdr.markForCheck();
        
        // Fetch appointments via AppointmentService endpoint (not reports endpoint)
        return this.reportsService.getDetailedAppointments(
          startDate,
          endDate,
          doctorIds,
          statuses,
          appointmentTypes,
          includeCancelled,
          businessHoursOnly
        ).pipe(
          catchError((err: HttpErrorResponse) => {
            console.error('Error loading appointments:', err);
            // Don't show error banner - show empty state instead
            // Set errorMessage to null so empty state is displayed (not error banner)
            this.errorMessage = null;
            this.isLoading = false;
            this.appointments = [];
            this.calculateKPIs(); // Will reset metrics to empty
            this.generateChartData(); // Will generate empty chart data
            this.cdr.markForCheck();
            return of([]); // Return empty array to prevent further errors
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(appointments => {
      this.appointments = appointments || [];
      this.calculateKPIs();
      this.generateChartData();
      
      // Preserve selected provider if still in filtered list
      if (this.selectedProviderId) {
        const providerAppointments = this.appointments.filter(apt => apt.doctorId === this.selectedProviderId);
        if (providerAppointments.length === 0) {
          this.selectedProviderId = null;
          this.selectedProvider$.next(null);
        }
      }
      
      this.isLoading = false;
      this.cdr.markForCheck();
    });
  }

  /**
   * Setup reactive flow for selected provider drilldown
   */
  setupSelectedProviderFlow() {
    combineLatest([
      this.selectedProvider$,
      this.filters$
    ]).pipe(
      switchMap(([providerId, filters]) => {
        if (!providerId) {
          this.selectedProviderDetails = {
            provider: null,
            dailyTrend: [],
            statusBreakdown: [],
            appointmentTypeBreakdown: [],
            busiestHour: null,
            busiestDay: null
          };
          this.cdr.markForCheck();
          return of(null);
        }
        
        const startDate = filters.startDate || this.startDate;
        const endDate = filters.endDate || this.endDate;
        
        // Load detailed appointments for selected provider
        return this.reportsService.getDetailedAppointments(startDate, endDate, [providerId]).pipe(
          catchError(err => {
            console.error('Error loading provider details:', err);
            return of([]);
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(appointments => {
      if (appointments && this.selectedProviderId) {
        this.loadProviderDrilldown(this.selectedProviderId, appointments);
      }
      this.cdr.markForCheck();
    });
  }

  getErrorMessage(err: any): string {
    if (err?.status === 0) {
      return 'Unable to connect to server. Please check if the backend is running.';
    } else if (err?.status === 404) {
      return 'Reports endpoint not found. Please ensure the backend has been restarted.';
    } else if (err?.status === 500) {
      return 'Server error occurred. Please check backend logs.';
    } else if (err?.error?.message) {
      return err.error.message;
    } else if (err?.message) {
      return err.message;
    }
    return 'An unexpected error occurred';
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  loadDepartments() {
    this.masterDataService.getDepartments().subscribe({
      next: (depts) => {
        this.departments = depts || [];
      },
      error: (err) => {
        console.error('Error loading departments:', err);
        this.departments = [];
      }
    });
  }


  loadDoctors() {
    this.doctorService.getAll().subscribe({
      next: (docs) => {
        this.doctors = docs || [];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading doctors:', err);
        this.doctors = [];
        this.cdr.markForCheck();
      }
    });
  }

  onFiltersApplied(filters: ReportFilters) {
    this.currentFilters = filters;
    if (filters.startDate) this.startDate = filters.startDate;
    if (filters.endDate) this.endDate = filters.endDate;
    this.filters$.next(filters);
  }

  onFiltersReset() {
    this.currentFilters = {};
    this.initializeDates();
    this.filters$.next({
      datePreset: 'month',
      startDate: this.startDate,
      endDate: this.endDate
    });
  }

  /**
   * Calculate KPI metrics from appointments (client-side computation)
   * Computes:
   * - totalBookedMinutes = sum(durationMinutes) across all appointments
   * - avgApptsPerProviderPerDay = totalAppointments / (numProviders * numDays) (safe divide)
   * - providersByBookedMinutes = group by doctorId, sum(durationMinutes), count(appointments)
   */
  calculateKPIs() {
    if (!this.appointments || this.appointments.length === 0) {
      // No data - reset all metrics and show empty state (no error banner)
      this.providerMetrics = [];
      this.totalBookedMinutes = 0;
      this.avgAppointmentsPerProviderPerDay = 0;
      this.averageUtilization = 0;
      this.hasAvailabilityData = false;
      return;
    }

    // Create a map of doctor ID to Doctor object for lookup
    const doctorMap = new Map<number, Doctor>();
    this.doctors.forEach(doctor => {
      if (doctor.id) {
        doctorMap.set(doctor.id, doctor);
      }
    });

    // Group appointments by doctorId and compute metrics
    const providerMap = new Map<number, {
      appointments: any[];
      totalMinutes: number;
      completed: number;
      cancelled: number;
    }>();

    this.appointments.forEach(apt => {
      if (!apt.doctorId) return; // Skip appointments without doctorId

      if (!providerMap.has(apt.doctorId)) {
        providerMap.set(apt.doctorId, {
          appointments: [],
          totalMinutes: 0,
          completed: 0,
          cancelled: 0
        });
      }

      const providerData = providerMap.get(apt.doctorId)!;
      providerData.appointments.push(apt);

      // Sum duration minutes (use durationMinutes if available, otherwise compute from start/end)
      const durationMinutes = apt.durationMinutes || 
        (apt.startDateTime && apt.endDateTime 
          ? Math.round((new Date(apt.endDateTime).getTime() - new Date(apt.startDateTime).getTime()) / (1000 * 60))
          : 0);
      providerData.totalMinutes += durationMinutes;

      // Count statuses
      if (apt.status === 'CHECKED_OUT' || apt.status === 'COMPLETED') {
        providerData.completed++;
      }
      if (apt.status === 'CANCELLED') {
        providerData.cancelled++;
      }
    });

    // Convert to ProviderMetric array
    this.providerMetrics = Array.from(providerMap.entries()).map(([doctorId, data]) => {
      // Get doctor from map or create placeholder
      let doctor = doctorMap.get(doctorId);
      if (!doctor) {
        // Try to get name from appointment data
        const firstAppt = data.appointments[0];
        const doctorName = firstAppt?.doctorName || 
                          (firstAppt?.doctor ? `${firstAppt.doctor.firstName || ''} ${firstAppt.doctor.lastName || ''}`.trim() : null);
        
        if (doctorName) {
          const nameParts = doctorName.split(' ');
          doctor = {
            id: doctorId,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || ''
          } as Doctor;
        } else {
          // No doctor name available - use placeholder
          doctor = {
            id: doctorId,
            firstName: '',
            lastName: ''
          } as Doctor;
        }
      }

      const totalAppointments = data.appointments.length;
      const averageDuration = totalAppointments > 0
        ? Math.round(data.totalMinutes / totalAppointments)
        : 0;

      return {
        doctor,
        totalAppointments,
        totalMinutesBooked: data.totalMinutes,
        completedAppointments: data.completed,
        cancelledAppointments: data.cancelled,
        utilizationRate: 0, // Placeholder - would need schedule/availability data
        averageDuration
      };
    }).sort((a, b) => b.totalMinutesBooked - a.totalMinutesBooked);

    // Calculate aggregate KPIs
    // totalBookedMinutes = sum(durationMinutes) across all appointments
    this.totalBookedMinutes = this.providerMetrics.reduce((sum, m) => sum + m.totalMinutesBooked, 0);
    
    const daysDiff = Math.ceil((new Date(this.endDate).getTime() - new Date(this.startDate).getTime()) / (1000 * 60 * 60 * 24)) || 1;
    const totalAppointments = this.appointments.length;
    const activeProviders = this.providerMetrics.length;
    
    // avgApptsPerProviderPerDay = totalAppointments / (numProviders * numDays) (safe divide)
    // Formula: totalAppointments / (activeProviders * daysDiff)
    // Using safe divide to prevent division by zero
    this.avgAppointmentsPerProviderPerDay = activeProviders > 0 && daysDiff > 0
      ? Math.round((totalAppointments / activeProviders / daysDiff) * 10) / 10
      : 0;

    // Utilization% - only show if availability data exists
    this.hasAvailabilityData = false; // Set to true when availability data is available
    this.averageUtilization = 0; // Calculate when availability data exists
  }

  /**
   * Generate chart data - providers ranked by booked minutes (computed from providerMetrics)
   */
  generateChartData() {
    // Providers ranked by booked minutes (bar chart)
    this.providersByBookedMinutes = this.providerMetrics
      .map(metric => ({
        label: this.getProviderName(metric.doctor),
        value: metric.totalMinutesBooked,
        color: '#0d9488',
        doctorId: metric.doctor.id,
        doctor: metric.doctor // Include doctor object for avatar access
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15); // Top 15 providers
  }

  /**
   * Load drilldown data for selected provider
   */
  loadProviderDrilldown(providerId: number, appointments: any[]) {
    const metric = this.providerMetrics.find(m => m.doctor.id === providerId);
    if (!metric) return;

    // Daily trend (booked minutes by day)
    const dailyMap = new Map<string, number>();
    appointments.forEach(apt => {
      if (apt.startDateTime && apt.durationMinutes) {
        const date = new Date(apt.startDateTime).toISOString().split('T')[0];
        dailyMap.set(date, (dailyMap.get(date) || 0) + apt.durationMinutes);
      }
    });

    this.selectedProviderDetails.dailyTrend = Array.from(dailyMap.entries())
      .map(([date, minutes]) => ({
        label: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        value: minutes,
        date,
        color: '#0d9488'
      }))
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    // Status breakdown
    const statusMap = new Map<string, number>();
    appointments.forEach(apt => {
      const status = apt.status || 'UNKNOWN';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    this.selectedProviderDetails.statusBreakdown = Array.from(statusMap.entries())
      .map(([status, count]) => ({
        label: status.replace('_', ' '),
        value: count,
        color: this.getStatusColor(status)
      }));

    // Appointment type breakdown (if available)
    const typeMap = new Map<string, number>();
    appointments.forEach(apt => {
      const type = apt.appointmentType || apt.visitType || 'UNKNOWN';
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });

    this.selectedProviderDetails.appointmentTypeBreakdown = Array.from(typeMap.entries())
      .map(([type, count]) => ({
        label: type.replace('_', ' '),
        value: count,
        color: '#14b8a6'
      }));

    // Busiest hour
    const hourMap = new Map<number, number>();
    appointments.forEach(apt => {
      if (apt.startDateTime) {
        const hour = new Date(apt.startDateTime).getHours();
        hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
      }
    });

    let maxCount = 0;
    let busiestHour: number | null = null;
    hourMap.forEach((count, hour) => {
      if (count > maxCount) {
        maxCount = count;
        busiestHour = hour;
      }
    });
    this.selectedProviderDetails.busiestHour = busiestHour;

    // Busiest day
    const dayMap = new Map<string, number>();
    appointments.forEach(apt => {
      if (apt.startDateTime) {
        const day = new Date(apt.startDateTime).toLocaleDateString('en-US', { weekday: 'long' });
        dayMap.set(day, (dayMap.get(day) || 0) + 1);
      }
    });

    maxCount = 0;
    let busiestDay: string | null = null;
    dayMap.forEach((count, day) => {
      if (count > maxCount) {
        maxCount = count;
        busiestDay = day;
      }
    });
    this.selectedProviderDetails.busiestDay = busiestDay;

    this.selectedProviderDetails.provider = metric;
  }

  /**
   * Select provider for drilldown
   */
  onProviderClick(providerId: number) {
    this.selectedProviderId = providerId;
    this.selectedProvider$.next(providerId);
  }

  /**
   * Close drilldown panel
   */
  closeDrilldown() {
    this.selectedProviderId = null;
    this.selectedProvider$.next(null);
  }

  /**
   * TrackBy function for provider lists
   */
  trackByProviderId(index: number, item: ProviderMetric): number {
    return item.doctor.id || index;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'SCHEDULED': '#0d9488',
      'CONFIRMED': '#14b8a6',
      'ARRIVED': '#059669',
      'CHECKED_IN': '#475569',
      'CHECKED_OUT': '#64748b',
      'CANCELLED': '#dc2626',
      'NO_SHOW': '#94a3b8'
    };
    return colors[status.toUpperCase()] || '#94a3b8';
  }

  resetMetricsAndCharts(): void {
    this.appointments = [];
    this.providerMetrics = [];
    this.totalBookedMinutes = 0;
    this.avgAppointmentsPerProviderPerDay = 0;
    this.averageUtilization = 0;
    this.providersByBookedMinutes = [];
    this.selectedProviderDailyTrend = [];
  }

  getUtilizationColor(rate: number): string {
    if (rate >= 80) return '#059669'; // Green - High
    if (rate >= 60) return '#14b8a6'; // Teal - Good
    if (rate >= 40) return '#d97706'; // Orange - Medium
    return '#dc2626'; // Red - Low
  }

  getMaxValue(data: ChartDataPoint[]): number {
    return Math.max(...data.map(d => d.value), 1);
  }

  getBarHeight(value: number, max: number): number {
    return max > 0 ? (value / max) * 100 : 0;
  }

  /**
   * Get provider name, with fallback to "Provider #ID" if name is not present
   * Handles missing doctor names gracefully (don't crash)
   */
  getProviderName(doctor: Doctor): string {
    const name = `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
    // If no name available, show "Provider #ID" (don't crash)
    return name || (doctor.id ? `Provider #${doctor.id}` : 'Unknown Provider');
  }

  /**
   * Get provider initials for avatar fallback
   */
  getProviderInitials(doctor: Doctor): string {
    const first = doctor.firstName?.[0] || '';
    const last = doctor.lastName?.[0] || '';
    return `${first}${last}`.toUpperCase() || (doctor.id ? `P${doctor.id}` : 'DR');
  }

  /**
   * Get provider avatar URL with fallback to generated avatar
   * Similar to other components in the app
   */
  getProviderAvatar(doctor: Doctor | undefined): string {
    if (!doctor) {
      // Fallback if doctor is undefined
      return `https://ui-avatars.com/api/?name=DR&background=0d9488&color=fff&size=200&bold=true`;
    }
    
    // Check if photoUrl exists and is a valid image
    const providerWithImage = doctor as { photoUrl?: string; profileImage?: string; imageUrl?: string; avatar?: string };
    const image = providerWithImage?.photoUrl || 
                  providerWithImage?.profileImage || 
                  providerWithImage?.imageUrl || 
                  providerWithImage?.avatar;
    
    if (image) {
      // If it's already a data URL or HTTP URL, use it directly
      if (image.startsWith('data:image') || image.startsWith('http://') || image.startsWith('https://')) {
        return image;
      }
      // If it's a base64 string without prefix, add the prefix
      if (image.length > 100) {
        return `data:image/jpeg;base64,${image}`;
      }
    }
    
    // Use the image endpoint if doctor ID is available
    const doctorId = doctor.id;
    if (doctorId) {
      return `/api/doctors/${doctorId}/image`;
    }
    
    // Fallback: Generate initials-based avatar with teal theme (matching reports style)
    const initials = this.getProviderInitials(doctor);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0d9488&color=fff&size=200&bold=true`;
  }

  /**
   * Handle provider image error - fallback to initials avatar
   */
  onProviderImageError(event: Event, doctor: Doctor | undefined): void {
    if (!doctor) return;
    
    const img = event.target as HTMLImageElement;
    if (img && img.src && !img.src.includes('ui-avatars.com')) {
      // Only fallback if not already using ui-avatars
      const initials = this.getProviderInitials(doctor);
      img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0d9488&color=fff&size=200&bold=true`;
    }
  }

  getProviderSpecialization(doctor: Doctor): string {
    return doctor.specializations?.[0]?.name || 'General';
  }

  round(value: number): number {
    return Math.round(value);
  }

  toNumber(value: any): number {
    return Number(value);
  }

  formatMinutes(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  getHourLabel(hour: number): string {
    return `${hour}:00`;
  }

  // Tooltip state
  tooltipVisible = false;
  tooltipContent = '';
  tooltipX = 0;
  tooltipY = 0;

  showTooltip(event: MouseEvent, content: string) {
    this.tooltipContent = content;
    this.tooltipX = event.clientX;
    this.tooltipY = event.clientY;
    this.tooltipVisible = true;
    this.cdr.markForCheck();
  }

  hideTooltip() {
    this.tooltipVisible = false;
    this.cdr.markForCheck();
  }

  // Donut chart helpers for drilldown
  getTotalStatusValue(): number {
    return this.selectedProviderDetails.statusBreakdown.reduce((sum, item) => sum + item.value, 0);
  }

  getDonutSegment(value: number, total: number): string {
    const circumference = 2 * Math.PI * 60; // radius = 60
    const percentage = total > 0 ? value / total : 0;
    const dashLength = circumference * percentage;
    return `${dashLength} ${circumference}`;
  }

  getDonutOffset(index: number): number {
    const circumference = 2 * Math.PI * 60;
    const total = this.getTotalStatusValue();
    let offset = 0;
    
    for (let i = 0; i < index; i++) {
      const percentage = total > 0 ? this.selectedProviderDetails.statusBreakdown[i].value / total : 0;
      offset += circumference * percentage;
    }
    
    return -offset;
  }

  // TrackBy for chart data points
  trackByChartDataPoint(index: number, item: ChartDataPoint & { doctorId?: number }): any {
    return item.doctorId || index;
  }

  /**
   * Export current report data to CSV
   */
  exportToCSV() {
    const data: any[] = [];
    const dateRange = `${this.startDate} to ${this.endDate}`;

    // Add summary KPIs
    data.push({ section: 'Summary', metric: 'Total Booked Minutes', value: this.totalBookedMinutes, dateRange });
    data.push({ section: 'Summary', metric: 'Avg Appts/Provider/Day', value: this.avgAppointmentsPerProviderPerDay, dateRange });
    if (this.hasAvailabilityData) {
      data.push({ section: 'Summary', metric: 'Avg Utilization %', value: this.averageUtilization, dateRange });
    }

    // Add provider utilization data (from providerMetrics)
    this.providerMetrics.forEach(metric => {
      const providerName = this.getProviderName(metric.doctor);
      
      data.push({
        section: 'Provider Utilization',
        providerName,
        providerId: metric.doctor.id,
        totalAppointments: metric.totalAppointments,
        totalMinutesBooked: metric.totalMinutesBooked,
        avgDurationMinutes: metric.averageDuration
      });
    });

    // Add selected provider details if available
    if (this.selectedProviderDetails.provider && this.selectedProviderId) {
      const provider = this.selectedProviderDetails.provider;
      data.push({ section: 'Selected Provider Details', providerName: this.getProviderName(provider.doctor) });
      
      // Daily trend
      this.selectedProviderDetails.dailyTrend.forEach(item => {
        data.push({
          section: 'Provider Daily Trend',
          date: item.date || item.label,
          minutesBooked: item.value
        });
      });

      // Status breakdown
      this.selectedProviderDetails.statusBreakdown.forEach(item => {
        data.push({
          section: 'Provider Status Breakdown',
          status: item.label,
          count: item.value
        });
      });

      // Appointment type breakdown
      this.selectedProviderDetails.appointmentTypeBreakdown.forEach(item => {
        data.push({
          section: 'Provider Appointment Types',
          type: item.label,
          count: item.value
        });
      });
    }

    const columns: CSVColumn[] = [
      { header: 'Section', key: 'section' },
      { header: 'Provider Name', key: 'providerName', formatter: (v) => v || '' },
      { header: 'Provider ID', key: 'providerId', formatter: (v) => v?.toString() || '' },
      { header: 'Metric', key: 'metric', formatter: (v) => v || '' },
      { header: 'Date', key: 'date', formatter: (v) => v || '' },
      { header: 'Status', key: 'status', formatter: (v) => v || '' },
      { header: 'Type', key: 'type', formatter: (v) => v || '' },
      { header: 'Total Appointments', key: 'totalAppointments', formatter: (v) => v?.toString() || '' },
      { header: 'Total Minutes Booked', key: 'totalMinutesBooked', formatter: (v) => v?.toString() || '' },
      { header: 'Minutes Booked', key: 'minutesBooked', formatter: (v) => v?.toString() || '' },
      { header: 'Avg Duration (min)', key: 'avgDurationMinutes', formatter: (v) => v?.toString() || '' },
      { header: 'Count', key: 'count', formatter: (v) => v?.toString() || '' },
      { header: 'Value', key: 'value', formatter: (v) => v?.toString() || '' },
      { header: 'Date Range', key: 'dateRange', formatter: (v) => v || '' }
    ];

    const csv = arrayToCSV(data, columns);
    const filename = `provider-utilization-${this.startDate}-to-${this.endDate}.csv`;
    downloadCSV(csv, filename);
  }

  /**
   * Print report
   */
  printReport() {
    window.print();
  }
}

