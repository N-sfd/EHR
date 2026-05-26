import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService, SchedulingSummary, HeatmapBucket } from '../../../core/services/reports.service';
import { ReportFilterBarComponent, ReportFilters } from '../../../shared/components/report-filter-bar/report-filter-bar.component';
import { DoctorService } from '../../../core/services/doctor.service';
import { MasterDataService } from '../../../core/services/master-data.service';
import { Doctor } from '../../../core/models/doctor.model';
import { MasterDepartment } from '../../../core/models/master-data.model';
import { BehaviorSubject, Observable, combineLatest, Subject } from 'rxjs';
import { map, switchMap, catchError, startWith, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs';
import { arrayToCSV, downloadCSV, formatDateForCSV, CSVColumn } from '../../../shared/utils/csv-export.util';

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  hour?: number;
  date?: string;
  noShowRate?: number;
}

interface HeatmapCell {
  day: string;
  hour: number;
  count: number;
  intensity: number; // 0-1 for color intensity
}

@Component({
  selector: 'app-scheduling-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, ReportFilterBarComponent],
  templateUrl: './scheduling-analytics.component.html',
  styleUrls: ['./scheduling-analytics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SchedulingAnalyticsComponent implements OnInit, OnDestroy {
  private reportsService = inject(ReportsService);
  private doctorService = inject(DoctorService);
  private masterDataService = inject(MasterDataService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  // Reactive filter stream
  private filters$ = new BehaviorSubject<ReportFilters>({});

  // Filters
  dateRange: 'week' | 'month' | 'quarter' | 'year' = 'month';
  startDate: string = '';
  endDate: string = '';
  departmentFilter: number | null = null;
  statusFilter: string | 'all' = 'all';
  doctorFilter: number[] = [];

  // Data
  departments: MasterDepartment[] = [];
  doctors: Doctor[] = [];

  // KPI Metrics (computed from summary)
  totalAppointments = 0;
  scheduledAppointments = 0;
  confirmedAppointments = 0;
  cancelledAppointments = 0;
  completedAppointments = 0;
  noShowAppointments = 0;
  urgentCount = 0;
  averageAppointmentDuration = 0;
  fillRate = 0; // Percentage of available slots filled

  // Chart Data
  appointmentsByDay: ChartDataPoint[] = [];
  appointmentsByStatus: ChartDataPoint[] = [];
  appointmentsByDepartment: ChartDataPoint[] = [];
  appointmentsByHour: ChartDataPoint[] = [];
  noShowRateByDay: ChartDataPoint[] = [];
  heatmapData: HeatmapCell[] = [];

  // Reactive data streams
  summary$: Observable<SchedulingSummary | null> = of(null);
  detailedAppointments$: Observable<any[]> = of([]);
  
  // Combined data stream
  viewModel$: Observable<{
    summary: SchedulingSummary | null;
    appointments: any[];
    isLoading: boolean;
    error: string | null;
  }> = of({ summary: null, appointments: [], isLoading: true, error: null });

  // Component state (for template)
  isLoading = true;
  errorMessage: string | null = null;
  summary: SchedulingSummary | null = null;
  currentFilters: ReportFilters = {};

  // Tooltip state
  tooltipVisible = false;
  tooltipContent = '';
  tooltipX = 0;
  tooltipY = 0;

  ngOnInit() {
    this.initializeDates();
    this.loadDepartments();
    this.loadDoctors();
    // Initialize with default filters
    this.filters$.next({
      datePreset: 'month',
      startDate: this.startDate,
      endDate: this.endDate
    });
    this.setupReactiveDataFlow();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Setup reactive data flow using combineLatest
   */
  setupReactiveDataFlow() {
    // Create data stream that reacts to filter changes
    this.viewModel$ = this.filters$.pipe(
      switchMap(filters => {
        const startDate = filters.startDate || this.startDate;
        const endDate = filters.endDate || this.endDate;
        const doctorIds = filters.providerIds;

        // Load summary data
        const summaryObs = this.reportsService.getSchedulingSummary(startDate, endDate, doctorIds).pipe(
          catchError(err => {
            console.warn('Error loading summary (will show empty heatmap):', err);
            // Don't show alarming error message - just return null and show empty heatmap
            // This is more user-friendly than "Server error occurred"
            this.errorMessage = null; // Clear error message for graceful degradation
            this.cdr.markForCheck();
            return of(null);
          })
        );

        // Load detailed appointments for heatmap/no-show (if needed)
        // TODO: If dataset is too large, consider backend aggregation endpoint
        const appointmentsObs = this.reportsService.getDetailedAppointments(
          startDate, 
          endDate, 
          doctorIds,
          filters.statuses,
          filters.appointmentTypes,
          filters.includeCancelled,
          filters.businessHoursOnly
        ).pipe(
          catchError(err => {
            console.error('Error loading detailed appointments:', err);
            // Don't fail completely - continue with summary data
            return of([]);
          })
        );

        // Combine both streams
        return combineLatest([
          summaryObs.pipe(startWith(null)),
          appointmentsObs.pipe(startWith([]))
        ]).pipe(
          map(([summary, appointments]) => {
            this.isLoading = false;
            this.summary = summary;
            // Clear error message when we have data or when showing empty state gracefully
            this.errorMessage = null;
            
            if (summary) {
              this.updateMetricsFromSummary(summary);
              this.generateChartData(summary);
            }
            
            // Generate heatmap - prefer backend buckets, fallback to appointments, or empty
            if (summary?.heatmapBuckets && summary.heatmapBuckets.length > 0) {
              // Use backend heatmapBuckets (preferred)
              this.generateHeatmapFromBackend(summary.heatmapBuckets);
            } else if (appointments.length > 0) {
              // Fallback: compute from appointments
              this.generateHeatmapData(appointments);
            } else {
              // No data available - show empty heatmap gracefully
              this.initializeEmptyHeatmap();
            }

            if (appointments.length > 0) {
              this.generateNoShowRateChart(appointments);
              this.calculateAverageDuration(appointments);
            }
            
            this.cdr.markForCheck();
            
            return {
              summary,
              appointments,
              isLoading: false,
              error: null // Don't expose error to view model - show empty state instead
            };
          }),
          startWith({ summary: null, appointments: [], isLoading: true, error: null })
        );
      }),
      takeUntil(this.destroy$)
    );

    // Subscribe to viewModel to trigger change detection
    this.viewModel$.subscribe(() => {
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

  initializeDates() {
    const today = new Date();
    const start = new Date(today);
    
    switch (this.dateRange) {
      case 'week':
        start.setDate(today.getDate() - 7);
        break;
      case 'month':
        start.setMonth(today.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(today.getFullYear() - 1);
        break;
    }
    
    this.startDate = this.formatDateForInput(start);
    this.endDate = this.formatDateForInput(today);
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
      },
      error: (err) => {
        console.error('Error loading doctors:', err);
        this.doctors = [];
      }
    });
  }

  /**
   * Generate heatmap from backend heatmapBuckets (preferred)
   */
  generateHeatmapFromBackend(heatmapBuckets: HeatmapBucket[]) {
    if (!heatmapBuckets || heatmapBuckets.length === 0) {
      // Initialize empty heatmap if no data
      this.initializeEmptyHeatmap();
      return;
    }

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const heatmapMap = new Map<string, number>();

    // Convert backend buckets to map
    heatmapBuckets.forEach(bucket => {
      // Validate dayOfWeek is within valid range (0-6)
      if (bucket.dayOfWeek !== undefined && bucket.dayOfWeek >= 0 && bucket.dayOfWeek <= 6) {
        const day = daysOfWeek[bucket.dayOfWeek];
        const hour = bucket.hour || 0;
        // Only include hours between 7am and 7pm
        if (hour >= 7 && hour <= 19) {
          const key = `${day}-${hour}`;
          heatmapMap.set(key, bucket.count || 0);
        }
      }
    });

    const values = Array.from(heatmapMap.values());
    const maxCount = values.length > 0 ? Math.max(...values, 1) : 1;
    const hours = Array.from({ length: 13 }, (_, i) => i + 7); // 7am to 7pm

    this.heatmapData = [];
    daysOfWeek.forEach(day => {
      hours.forEach(hour => {
        const key = `${day}-${hour}`;
        const count = heatmapMap.get(key) || 0;
        this.heatmapData.push({
          day,
          hour,
          count,
          intensity: count / maxCount
        });
      });
    });
  }

  /**
   * Initialize empty heatmap when no data is available
   */
  initializeEmptyHeatmap() {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({ length: 13 }, (_, i) => i + 7); // 7am to 7pm

    this.heatmapData = [];
    daysOfWeek.forEach(day => {
      hours.forEach(hour => {
        this.heatmapData.push({
          day,
          hour,
          count: 0,
          intensity: 0
        });
      });
    });
  }

  generateHeatmapData(appointments: any[]) {
    const heatmapMap = new Map<string, number>();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({ length: 13 }, (_, i) => i + 7); // 7am to 7pm

    appointments.forEach(apt => {
      if (!apt.startDateTime) return;
      
      const date = new Date(apt.startDateTime);
      const dayOfWeek = daysOfWeek[date.getDay()];
      const hour = date.getHours();
      
      if (hour >= 7 && hour <= 19) {
        const key = `${dayOfWeek}-${hour}`;
        heatmapMap.set(key, (heatmapMap.get(key) || 0) + 1);
      }
    });

    const maxCount = Math.max(...Array.from(heatmapMap.values()), 1);

    this.heatmapData = [];
    daysOfWeek.forEach(day => {
      hours.forEach(hour => {
        const key = `${day}-${hour}`;
        const count = heatmapMap.get(key) || 0;
        this.heatmapData.push({
          day,
          hour,
          count,
          intensity: count / maxCount
        });
      });
    });
  }

  generateNoShowRateChart(appointments: any[]) {
    const dailyMap = new Map<string, { total: number; noShow: number }>();

    appointments.forEach(apt => {
      if (!apt.startDateTime) return;
      
      const date = new Date(apt.startDateTime);
      const dateKey = date.toISOString().split('T')[0];
      
      const daily = dailyMap.get(dateKey) || { total: 0, noShow: 0 };
      daily.total++;
      if (apt.status === 'NO_SHOW' || apt.status === 'CANCELLED') {
        daily.noShow++;
      }
      dailyMap.set(dateKey, daily);
    });

    this.noShowRateByDay = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        label: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        value: data.total,
        date,
        noShowRate: data.total > 0 ? (data.noShow / data.total) * 100 : 0,
        color: '#dc2626'
      }))
      .sort((a, b) => a.date!.localeCompare(b.date!));
  }

  calculateAverageDuration(appointments: any[]) {
    const durations = appointments
      .filter(apt => apt.durationMinutes)
      .map(apt => apt.durationMinutes);
    
    if (durations.length > 0) {
      this.averageAppointmentDuration = Math.round(
        durations.reduce((sum, d) => sum + d, 0) / durations.length
      );
    }
  }

  getFilteredDoctorIds(): number[] | undefined {
    if (this.departmentFilter && this.doctors.length > 0) {
      const filtered = this.doctors
        .filter(d => d.clinicalDepartment?.id === this.departmentFilter || 
                     d.departmentId === this.departmentFilter)
        .map(d => d.id)
        .filter((id): id is number => id !== undefined);
      return filtered.length > 0 ? filtered : undefined;
    }
    return undefined;
  }

  onFilterChange() {
    // Filters are handled reactively through filters$ BehaviorSubject
    // This method is kept for backward compatibility but does nothing
  }

  onFiltersApplied(filters: ReportFilters) {
    console.log('[SchedulingAnalytics] Filters applied:', filters);
    this.currentFilters = filters;
    if (filters.startDate) this.startDate = filters.startDate;
    if (filters.endDate) this.endDate = filters.endDate;
    this.isLoading = true;
    this.errorMessage = null;
    this.filters$.next(filters);
    this.cdr.markForCheck();
  }

  onFiltersReset() {
    console.log('[SchedulingAnalytics] Filters reset');
    this.currentFilters = {};
    this.initializeDates();
    this.isLoading = true;
    this.errorMessage = null;
    this.filters$.next({});
    this.cdr.markForCheck();
  }

  onKpiClick(kpiType: 'total' | 'urgent' | 'cancelled' | 'noshow') {
    // Apply filter based on KPI click and refresh
    const newFilters: ReportFilters = { ...this.currentFilters };
    
    switch (kpiType) {
      case 'urgent':
        newFilters.statuses = ['URGENT', 'HIGH'];
        break;
      case 'cancelled':
        newFilters.statuses = ['CANCELLED'];
        break;
      case 'noshow':
        newFilters.statuses = ['NO_SHOW'];
        break;
      case 'total':
        newFilters.statuses = undefined;
        break;
    }
    
    this.currentFilters = newFilters;
    this.isLoading = true;
    this.errorMessage = null;
    this.filters$.next(newFilters);
  }

  showTooltip(event: MouseEvent, content: string) {
    this.tooltipContent = content;
    this.tooltipX = event.clientX;
    this.tooltipY = event.clientY;
    this.tooltipVisible = true;
  }

  hideTooltip() {
    this.tooltipVisible = false;
  }

  getHeatmapIntensityColor(intensity: number): string {
    if (intensity === 0) return '#f1f5f9';
    if (intensity < 0.25) return '#cfe2ff';
    if (intensity < 0.5) return '#93c5fd';
    if (intensity < 0.75) return '#60a5fa';
    return '#3b82f6';
  }

  getHeatmapCell(day: string, hour: number): HeatmapCell | undefined {
    return this.heatmapData.find(cell => cell.day === day && cell.hour === hour);
  }

  updateMetricsFromSummary(summary: SchedulingSummary) {
    this.totalAppointments = summary.totalAppointments || 0;
    this.urgentCount = summary.urgentCount || 0;
    this.scheduledAppointments = summary.statusCounts?.scheduled || 0;
    this.confirmedAppointments = summary.statusCounts?.confirmed || 0;
    this.cancelledAppointments = summary.statusCounts?.cancelled || 0;
    this.completedAppointments = summary.statusCounts?.arrived || 0; // Using arrived as completed proxy
    this.noShowAppointments = summary.statusCounts?.noshow || 0;

    // Calculate fill rate (simplified - would need availability data)
    this.fillRate = this.totalAppointments > 0 ? Math.min(100, Math.round((this.totalAppointments / (this.totalAppointments + 50)) * 100)) : 0;
  }

  generateChartData(summary: SchedulingSummary) {

    // Appointments by Day - use dailyCounts from summary
    this.appointmentsByDay = (summary.dailyCounts || []).map(dc => {
      const date = new Date(dc.date);
      const dayKey = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      return {
        label: dayKey,
        value: dc.count,
        date: dc.date,
        color: '#0d9488'
      };
    }).sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    // Appointments by Status - use statusCounts from summary
    const statusCounts = summary.statusCounts || {};
    this.appointmentsByStatus = [
      { label: 'Scheduled', value: statusCounts.scheduled || 0, color: this.getStatusColor('Schedule') },
      { label: 'Confirmed', value: statusCounts.confirmed || 0, color: this.getStatusColor('Confirmed') },
      { label: 'Arrived', value: statusCounts.arrived || 0, color: this.getStatusColor('Checked In') },
      { label: 'Cancelled', value: statusCounts.cancelled || 0, color: this.getStatusColor('Cancelled') },
      { label: 'No Show', value: statusCounts.noshow || 0, color: '#94a3b8' }
    ].filter(item => item.value > 0);

    // Appointments by Department - still need to compute from appointments if available
    // For now, leave empty or use a placeholder
    this.appointmentsByDepartment = [];

    // Appointments by Hour - not available in summary, leave empty for now
    // Could be added to backend endpoint if needed
    this.appointmentsByHour = [];
  }

  resetMetricsAndCharts(): void {
    this.totalAppointments = 0;
    this.urgentCount = 0;
    this.scheduledAppointments = 0;
    this.confirmedAppointments = 0;
    this.cancelledAppointments = 0;
    this.completedAppointments = 0;
    this.noShowAppointments = 0;
    this.averageAppointmentDuration = 0;
    this.fillRate = 0;
    this.appointmentsByDay = [];
    this.appointmentsByStatus = [];
    this.appointmentsByDepartment = [];
    this.appointmentsByHour = [];
    this.noShowRateByDay = [];
    this.initializeEmptyHeatmap(); // Initialize empty heatmap instead of clearing
  }


  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Schedule': '#0d9488',
      'Confirmed': '#14b8a6',
      'Checked In': '#059669',
      'Checked Out': '#475569',
      'Cancelled': '#dc2626'
    };
    return colors[status] || '#94a3b8';
  }

  getMaxValue(data: ChartDataPoint[]): number {
    return Math.max(...data.map(d => d.value), 1);
  }

  getBarHeight(value: number, max: number): number {
    return max > 0 ? (value / max) * 100 : 0;
  }

  getTotalStatusValue(): number {
    return this.appointmentsByStatus.reduce((sum, item) => sum + item.value, 0);
  }

  getStatusPercentage(value: number): string {
    const total = this.getTotalStatusValue();
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0';
  }

  /**
   * Calculate donut segment dash array (circumference * percentage)
   */
  getDonutSegment(value: number, total: number): string {
    const circumference = 2 * Math.PI * 80; // radius = 80
    const percentage = total > 0 ? value / total : 0;
    const dashLength = circumference * percentage;
    return `${dashLength} ${circumference}`;
  }

  /**
   * Calculate donut segment offset (cumulative offset for previous segments)
   */
  getDonutOffset(index: number): number {
    const circumference = 2 * Math.PI * 80;
    const total = this.getTotalStatusValue();
    let offset = 0;
    
    for (let i = 0; i < index; i++) {
      const percentage = total > 0 ? this.appointmentsByStatus[i].value / total : 0;
      offset += circumference * percentage;
    }
    
    return -offset;
  }

  toNumber(value: any): number {
    return Number(value);
  }

  /**
   * Export current report data to CSV
   */
  exportToCSV() {
    console.log('[SchedulingAnalytics] Export CSV button clicked');
    try {
      const data: any[] = [];
      const dateRange = this.startDate && this.endDate 
        ? `${this.startDate} to ${this.endDate}` 
        : 'No date range';

    // Add summary KPIs
    data.push({ section: 'Summary', metric: 'Total Appointments', value: this.totalAppointments, dateRange });
    data.push({ section: 'Summary', metric: 'Urgent/High', value: this.urgentCount, dateRange });
    data.push({ section: 'Summary', metric: 'Cancelled', value: this.cancelledAppointments, dateRange });
    data.push({ section: 'Summary', metric: 'No-show', value: this.noShowAppointments, dateRange });
    data.push({ section: 'Summary', metric: 'Avg Duration (min)', value: this.averageAppointmentDuration, dateRange });

    // Add daily counts
    this.appointmentsByDay.forEach(item => {
      data.push({ section: 'Daily Counts', date: item.date || item.label, count: item.value });
    });

    // Add status breakdown
    this.appointmentsByStatus.forEach(item => {
      data.push({ section: 'Status Breakdown', status: item.label, count: item.value });
    });

    // Add no-show rate by day
    this.noShowRateByDay.forEach(item => {
      data.push({ 
        section: 'No-show Rate', 
        date: item.date || item.label, 
        totalAppointments: item.value,
        noShowRate: item.noShowRate?.toFixed(2) + '%' || '0%'
      });
    });

    // Add heatmap data (day x hour)
    this.heatmapData.forEach(item => {
      if (item.count > 0) {
        data.push({ 
          section: 'Heatmap', 
          dayOfWeek: item.day, 
          hour: `${item.hour}:00`,
          count: item.count 
        });
      }
    });

    const columns: CSVColumn[] = [
      { header: 'Section', key: 'section' },
      { header: 'Date', key: 'date', formatter: (v) => v || '' },
      { header: 'Metric/Status/Day/Hour', key: 'metric', formatter: (v) => v || '' },
      { header: 'Status', key: 'status', formatter: (v) => v || '' },
      { header: 'Day of Week', key: 'dayOfWeek', formatter: (v) => v || '' },
      { header: 'Hour', key: 'hour', formatter: (v) => v || '' },
      { header: 'Count/Value', key: 'count', formatter: (v) => v?.toString() || '' },
      { header: 'Value', key: 'value', formatter: (v) => v?.toString() || '' },
      { header: 'Total Appointments', key: 'totalAppointments', formatter: (v) => v?.toString() || '' },
      { header: 'No-show Rate', key: 'noShowRate', formatter: (v) => v || '' },
      { header: 'Date Range', key: 'dateRange', formatter: (v) => v || '' }
    ];

      const csv = arrayToCSV(data, columns);
      const startDateStr = this.startDate || 'unknown';
      const endDateStr = this.endDate || 'unknown';
      const filename = `scheduling-analytics-${startDateStr}-to-${endDateStr}.csv`;
      downloadCSV(csv, filename);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please check the console for details.');
    }
  }

  /**
   * Print report
   */
  printReport() {
    console.log('[SchedulingAnalytics] Print button clicked');
    try {
      window.print();
    } catch (error) {
      console.error('Error printing report:', error);
      alert('Failed to print. Please try again.');
    }
  }
}

