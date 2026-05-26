import { Component, OnInit, OnDestroy, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { SchedulingService } from '../../scheduling/services/scheduling.service';
import { MasterDataService } from '../../../core/services/master-data.service';
import { AppointmentBlock, WaitlistItem } from '../models/appointment-scheduling.models';
// Note: AppointmentBlock uses startDateTime, not startAt
import { SchedulingEvent } from '../models/scheduling-event.model';
import { MasterDepartment, MasterSpecialization, MasterDesignation } from '../../../core/models/master-data.model';
import { AppointmentDetailPanelComponent } from '../appointment-detail-panel/appointment-detail-panel.component';

type ColumnType = 'PROVIDERS' | 'ROOMS';
type ProviderCol = { id: number; name: string; color?: string };
type RoomCol = { id: number; name: string; locationId?: number };

@Component({
  selector: 'app-schedule-grid',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, AppointmentDetailPanelComponent],
  templateUrl: './schedule-grid.component.html',
  styleUrls: ['./schedule-grid.component.scss']
})
export class ScheduleGridComponent implements OnInit, OnDestroy {
  @Output() schedulingEvent = new EventEmitter<SchedulingEvent>();

  private schedulingService = inject(SchedulingService);
  private masterDataService = inject(MasterDataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Grid settings
  startHour = 7;          // 7 AM
  endHour = 19;           // 7 PM
  slotMinutes = 15;       // 15-min grid
  pxPerMinute = 1.2;      // pixels per minute (18px per 15-min slot)
  
  // View mode - Week/Day/Month view (Epic-style: default to DAY)
  viewMode: 'WEEK' | 'DAY' | 'MONTH' = 'DAY';
  columnType: ColumnType = 'PROVIDERS';
  weekStart = this.startOfWeek(new Date()); // Monday of current week
  weekEnd = this.addDays(this.weekStart, 6); // Sunday
  dateLabel = '';
  days: { date: Date; key: string; label: string }[] = [];
  
  // Epic-style: Current day for DAY view
  currentDay = new Date();
  
  // Mini Calendar
  miniCalendarMonth = new Date().getMonth();
  miniCalendarYear = new Date().getFullYear();

  // Filters
  filterDepartmentId: number | null = null;
  filterSpecializationId: number | null = null;
  filterDesignationId: number | null = null;
  departments: MasterDepartment[] = [];
  specializations: MasterSpecialization[] = [];
  designations: MasterDesignation[] = [];

  // Search
  searchQuery = '';
  providerSearchQuery = '';
  waitlistSearchQuery = '';

  // UI State
  waitlistPanelExpanded = true;
  showShortcuts = false;
  isLoadingProviders = false;
  
  // Quick Book Drawer
  showQuickBookDrawer = false;
  quickBookProviderId: number | null = null;
  quickBookDate: string = '';
  quickBookStartTime: string = '';
  quickBookDuration: number = 15;
  quickBookVisitType: string | null = null;
  quickBookReason: string = '';
  quickBookPatientSearch: string = '';
  quickBookPatientResults: any[] = [];
  quickBookSelectedPatient: any = null;
  quickBookErrors: string[] = [];
  isSavingQuickBook = false;

  // Columns (Providers or Rooms)
  allProviders: Array<{ id: number; firstName?: string; lastName?: string; name?: string; clinicalDepartment?: { id?: number; departmentId?: number }; departmentId?: number; departments?: Array<{ id?: number; departmentId?: number }>; specializations?: Array<{ id?: number; specializationId?: number }>; specializationId?: number; designation?: { id?: number; designationId?: number } | number; designationId?: number; photoUrl?: string; profileImage?: string }> = [];
  providerColumns: ProviderCol[] = [];
  roomColumns: RoomCol[] = [];
  selectedColumnIds: number[] = [];

  // Data - Week view: apptsByColumnAndDay[columnId][dayKey] = AppointmentBlock[]
  appts: AppointmentBlock[] = [];
  apptsByColumnAndDay: Record<number, Record<string, AppointmentBlock[]>> = {};
  waitlist: WaitlistItem[] = [];

  // UI
  isLoading = false;
  isDragging = false;
  isResizing = false;
  resizingAppt: AppointmentBlock | null = null;
  resizeStartY = 0;
  resizeStartHeight = 0;
  currentTime = new Date();
  hoveredSlot: { columnId: number; dayKey: string; time: string } | null = null;
  conflictError: string | null = null;
  
  // Epic-style: Appointment detail panel
  showAppointmentDetailPanel = false;
  selectedAppointment: AppointmentBlock | null = null;
  
  // Epic-style: Summary strip data
  summaryData = {
    totalAppointments: 0,
    openSlots: 0,
    urgentCount: 0,
    scheduled: 0,
    confirmed: 0,
    arrived: 0,
    checkedIn: 0,
    checkedOut: 0,
    cancelled: 0,
    noShow: 0
  };
  
  // Epic-style: Keyboard focus state
  focusedSlot: { columnId: number; dayKey: string; time: string } | null = null;

  ngOnInit(): void {
    // Initialize loading state
    this.isLoading = false;
    this.isLoadingProviders = false;
    
    // Update current time every minute
    setInterval(() => {
      this.currentTime = new Date();
    }, 60000);
    
    // Load preferences from localStorage
    this.loadPreferencesFromStorage();
    
    // Load filters from query params (overrides localStorage)
    this.loadFiltersFromQueryParams();
    
    this.buildWeekDays();
    this.updateDateLabel();
    this.loadMasterData();
    this.loadColumns();
    this.loadWaitlist();
    // Don't call loadAppointments here - it will be called after providers load
    // via applyFilters() -> loadAppointments()
    
    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // ---------- Filter Management ----------
  loadFiltersFromQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['departmentId']) {
        this.filterDepartmentId = Number(params['departmentId']);
      }
      if (params['specializationId']) {
        this.filterSpecializationId = Number(params['specializationId']);
      }
      if (params['designationId']) {
        this.filterDesignationId = Number(params['designationId']);
      }
    });
  }

  updateQueryParams(): void {
    const queryParams: Record<string, number> = {};
    if (this.filterDepartmentId) {
      queryParams['departmentId'] = this.filterDepartmentId;
    }
    if (this.filterSpecializationId) {
      queryParams['specializationId'] = this.filterSpecializationId;
    }
    if (this.filterDesignationId) {
      queryParams['designationId'] = this.filterDesignationId;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });
  }

  loadMasterData(): void {
    // Load departments
    this.masterDataService.getDepartments().subscribe({
      next: (depts) => {
        this.departments = depts || [];
      },
      error: () => {
        this.departments = [];
      }
    });

    // Load specializations
    this.masterDataService.getSpecializations().subscribe({
      next: (specs) => {
        this.specializations = specs || [];
      },
      error: () => {
        this.specializations = [];
      }
    });

    // Load designations
    this.masterDataService.getDesignations().subscribe({
      next: (desigs) => {
        this.designations = desigs || [];
      },
      error: () => {
        this.designations = [];
      }
    });
  }

  onFilterChange(): void {
    this.updateQueryParams();
    this.applyFilters();
  }

  applyFilters(): void {
    if (this.columnType !== 'PROVIDERS') {
      return; // Only filter providers
    }

    let filtered = [...this.allProviders];

    // Filter by department
    if (this.filterDepartmentId) {
      filtered = filtered.filter(p => {
        const deptId = Number(this.filterDepartmentId);
        // Check clinicalDepartment or departmentId
        const provider = p as { clinicalDepartment?: { id?: number; departmentId?: number }; departmentId?: number; departments?: Array<{ id?: number; departmentId?: number }> };
        return provider.clinicalDepartment?.id === deptId ||
               provider.clinicalDepartment?.departmentId === deptId ||
               provider.departmentId === deptId ||
               provider.departments?.some((d) => 
                 Number(d.id) === deptId || Number(d.departmentId) === deptId
               );
      });
    }

    // Filter by specialization
    if (this.filterSpecializationId) {
      filtered = filtered.filter(p => {
        const specId = Number(this.filterSpecializationId);
        // Check specializations array
        const provider = p as { specializations?: Array<{ id?: number; specializationId?: number }>; specializationId?: number };
        return provider.specializations?.some((s) => 
          Number(s.id) === specId || Number(s.specializationId) === specId
        ) || provider.specializationId === specId;
      });
    }

    // Filter by designation
    if (this.filterDesignationId) {
      filtered = filtered.filter(p => {
        const desigId = Number(this.filterDesignationId);
        // Check designation field (could be object or ID)
        const provider = p as { designation?: { id?: number; designationId?: number } | number; designationId?: number };
        if (typeof provider.designation === 'object') {
          return provider.designation.id === desigId ||
                 provider.designation.designationId === desigId;
        }
        return provider.designationId === desigId ||
               Number(provider.designation) === desigId;
      });
    }

    // Update provider columns
    this.providerColumns = filtered.map(d => {
      const provider = d as { id: number; firstName?: string; lastName?: string; name?: string; fullName?: string; color?: string };
      return { 
        id: provider.id, 
        name: provider.fullName || `${provider.firstName || ''} ${provider.lastName || ''}`.trim() || provider.name || `Provider ${provider.id}`,
        color: provider.color
      };
    });

    // Update selected columns if they're no longer in filtered list
    this.selectedColumnIds = this.selectedColumnIds.filter(id => 
      this.providerColumns.some(p => p.id === id)
    );

    // Auto-select first provider if none selected
    if (!this.selectedColumnIds.length && this.providerColumns.length) {
      this.selectedColumnIds = [this.providerColumns[0].id];
    }

    // Only load appointments if we have selected columns
    if (this.selectedColumnIds.length > 0) {
    this.loadAppointments();
    this.checkSlotTemplates(); // Update slot template status
    } else {
      // No providers selected, ensure loading state is cleared
      this.isLoading = false;
      this.hasSlotTemplates = false;
    }
  }

  // ---------- Loaders ----------
  loadColumns() {
    if (this.columnType === 'PROVIDERS') {
    this.loadProviders();
        } else {
      this.loadRooms();
    }
  }

  loadProviders() {
    this.isLoadingProviders = true;
    this.schedulingService.getProviders().subscribe({
      next: (docs) => {
        // Cast to our expected type structure
        this.allProviders = (docs || []) as Array<{ id: number; firstName?: string; lastName?: string; name?: string; fullName?: string; color?: string; clinicalDepartment?: { id?: number; departmentId?: number }; departmentId?: number; departments?: Array<{ id?: number; departmentId?: number }>; specializations?: Array<{ id?: number; specializationId?: number }>; specializationId?: number; designation?: { id?: number; designationId?: number } | number; designationId?: number; photoUrl?: string; profileImage?: string }>;
        this.isLoadingProviders = false;
        this.applyFilters(); // Apply filters to update providerColumns
      },
      error: (err) => {
        console.error('Error loading providers:', err);
        this.allProviders = [];
        this.providerColumns = [];
        this.isLoadingProviders = false;
        this.isLoading = false;
      }
    });
  }

  loadRooms() {
    this.schedulingService.getRooms().subscribe({
      next: (rooms: Array<{ id: number; name: string; locationId?: number }>) => {
        this.roomColumns = (rooms || []).map(r => ({
          id: r.id,
          name: r.name || `Room ${r.id}`,
          locationId: r.locationId
        }));
        if (!this.selectedColumnIds.length && this.roomColumns.length) {
          this.selectedColumnIds = [this.roomColumns[0].id];
          this.loadAppointments();
        }
      }
    });
  }

  loadWaitlist() {
    this.schedulingService.getWaitlist().subscribe({
      next: (items) => this.waitlist = items || [],
      error: (err) => {
        console.error('Error loading waitlist:', err);
        this.waitlist = [];
      }
    });
  }

  loadAppointments() {
    if (!this.selectedColumnIds.length) {
      this.isLoading = false;
      this.appts = [];
      this.apptsByColumnAndDay = {};
      return;
    }

    this.isLoading = true;
    const startDateStr = this.formatDate(this.weekStart);
    const endDateStr = this.formatDate(this.weekEnd);
    const providerIds = this.columnType === 'PROVIDERS' ? this.selectedColumnIds : undefined;
    const roomIds = this.columnType === 'ROOMS' ? this.selectedColumnIds : undefined;

    this.schedulingService.getAppointmentsByRange(startDateStr, endDateStr, providerIds, roomIds).subscribe({
      next: (rows) => {
        try {
        this.appts = rows || [];
        this.groupAppointmentsByColumnAndDay();
        this.checkSlotTemplates(); // Update slot template status
        this.calculateSummaryStrip(); // Epic-style: Update summary strip
        } catch (error) {
          console.error('Error processing appointments:', error);
          this.appts = [];
          this.apptsByColumnAndDay = {};
        } finally {
        this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error loading appointments:', err);
        this.appts = [];
        this.apptsByColumnAndDay = {};
        this.isLoading = false;
      }
    });
  }

  // ---------- Grouping ----------
  private groupAppointmentsByColumnAndDay() {
    const map: Record<number, Record<string, AppointmentBlock[]>> = {};
    
    // Initialize map for selected columns and days
    this.selectedColumnIds.forEach(colId => {
      map[colId] = {};
      this.days.forEach(day => {
        map[colId][day.key] = [];
      });
    });

    // Group appointments by column and day
    for (const a of this.appts) {
      const columnId = this.columnType === 'PROVIDERS' ? a.providerId : (a as AppointmentBlock & { roomId?: number }).roomId || 0;
      if (!columnId || !map[columnId]) continue;

      const apptDate = new Date(a.startDateTime);
      const dayKey = this.formatDate(apptDate);
      
      if (map[columnId][dayKey]) {
        map[columnId][dayKey].push(a);
      }
    }

    // Sort by start time for each column/day
    Object.keys(map).forEach(colId => {
      Object.keys(map[Number(colId)]).forEach(dayKey => {
        map[Number(colId)][dayKey].sort((x, y) => 
          new Date(x.startDateTime).getTime() - new Date(y.startDateTime).getTime()
        );
      });
    });

    this.apptsByColumnAndDay = map;
  }

  getAppointmentsForColumnAndDay(columnId: number, dayKey: string): AppointmentBlock[] {
    return this.apptsByColumnAndDay[columnId]?.[dayKey] || [];
  }

  // ---------- Overlap Detection & Layout ----------
  /**
   * Calculate overlap groups for appointments in the same column/day
   * Returns map of appointment ID to overlap info (index, total, width, left)
   */
  calculateOverlaps(appointments: AppointmentBlock[]): Map<number, { index: number; total: number; width: number; left: number }> {
    const overlapMap = new Map<number, { index: number; total: number; width: number; left: number }>();
    
    if (appointments.length === 0) return overlapMap;

    // Sort by start time
    const sorted = [...appointments].sort((a, b) => {
      const startA = this.getStartTime(a);
      const startB = this.getStartTime(b);
      return startA - startB;
    });

    // Group overlapping appointments
    const groups: AppointmentBlock[][] = [];
    for (const appt of sorted) {
      const apptStart = this.getStartTime(appt);
      const apptEnd = apptStart + (appt.durationMinutes || 15);

      // Find a group this appointment overlaps with
      let added = false;
      for (const group of groups) {
        // Check if overlaps with any appointment in this group
        const overlaps = group.some(g => {
          const gStart = this.getStartTime(g);
          const gEnd = gStart + (g.durationMinutes || 15);
          return (apptStart < gEnd && apptEnd > gStart);
        });

        if (overlaps) {
          group.push(appt);
          added = true;
          break;
        }
      }

      if (!added) {
        groups.push([appt]);
      }
    }

    // Assign overlap info to each appointment
    for (const group of groups) {
      const total = group.length;
      if (total === 1) {
        // Single appointment - full width
        const apptId = group[0].id || group[0].appointmentId || 0;
        overlapMap.set(apptId, {
          index: 0,
          total: 1,
          width: 100,
          left: 0
        });
      } else {
        // Multiple overlapping appointments - split width with gaps
        const gapPercent = 1; // 1% gap between appointments
        const totalGaps = total - 1; // Number of gaps
        const availableWidth = 100 - (totalGaps * gapPercent);
        const width = availableWidth / total; // Width per appointment

        group.forEach((appt, index) => {
          const apptId = appt.id || appt.appointmentId || 0;
          // Calculate left position: index * (width + gap)
          const left = index * (width + gapPercent);
          overlapMap.set(apptId, {
            index,
            total,
            width,
            left
          });
        });
      }
    }

    return overlapMap;
  }

  /**
   * Get start time in minutes from day start
   */
  private getStartTime(appt: AppointmentBlock): number {
    const dt = new Date(appt.startDateTime);
    const hours = dt.getHours();
    const minutes = dt.getMinutes();
    return (hours - this.startHour) * 60 + minutes;
  }

  /**
   * Get overlap info for an appointment
   */
  getOverlapInfo(appt: AppointmentBlock, columnId: number, dayKey: string): { width: number; left: number } {
    const appointments = this.getAppointmentsForColumnAndDay(columnId, dayKey);
    const overlaps = this.calculateOverlaps(appointments);
    const apptId = appt.id || appt.appointmentId || 0;
    const info = overlaps.get(apptId);
    
    if (info) {
      return { width: info.width, left: info.left };
    }
    
    // No overlap - full width
    return { width: 100, left: 0 };
  }

  // ---------- Layout math ----------
  gridHeightPx(): number {
    const totalMinutes = (this.endHour - this.startHour) * 60;
    return totalMinutes * this.pxPerMinute;
  }

  topPx(appt: AppointmentBlock): number {
    const dt = new Date(appt.startDateTime);
    const hours = dt.getHours();
    const minutes = dt.getMinutes();
    const minsFromStart = (hours - this.startHour) * 60 + minutes;
    const top = minsFromStart * this.pxPerMinute;
    
    // Clamp to grid bounds
    const maxTop = this.gridHeightPx();
    return Math.max(0, Math.min(top, maxTop));
  }

  heightPx(appt: AppointmentBlock): number {
    const duration = appt.durationMinutes || 15;
    const height = duration * this.pxPerMinute - 2; // Small gap between appointments
    
    // Clamp to grid bounds
    const top = this.topPx(appt);
    const maxHeight = this.gridHeightPx() - top;
    
    return Math.max(20, Math.min(height, maxHeight)); // min 20px, max to grid bottom
  }

  // ---------- Styling helpers ----------
  statusClass(a: AppointmentBlock): string {
    const status = (a.status || 'Schedule').toLowerCase().replace(/\s/g, '');
    return `st-${status}`;
  }

  priorityClass(a: AppointmentBlock): string {
    return `pr-${(a.priority || 'NORMAL').toLowerCase()}`;
  }

  getStatusIcon(a: AppointmentBlock): string {
    const status = (a.status || 'Schedule').toLowerCase();
    if (status.includes('confirmed')) return 'fa-check-circle';
    if (status.includes('arrived')) return 'fa-user-check';
    if (status.includes('cancelled')) return 'fa-times-circle';
    if (status.includes('checked')) return 'fa-check-double';
    return 'fa-calendar-check';
  }

  isToday(day: { date: Date; key: string; label: string }): boolean {
    const today = new Date();
    return this.formatDate(day.date) === this.formatDate(today);
  }

  getCurrentTimePosition(): number | null {
    const today = new Date();
    const todayKey = this.formatDate(today);
    const isTodayInView = this.days.some(d => d.key === todayKey);
    
    if (!isTodayInView) return null;
    
    const hours = today.getHours();
    const minutes = today.getMinutes();
    const minsFromStart = (hours - this.startHour) * 60 + minutes;
    
    if (minsFromStart < 0 || minsFromStart > (this.endHour - this.startHour) * 60) {
      return null;
    }
    
    return minsFromStart * this.pxPerMinute;
  }

  slotLabel(a: AppointmentBlock): string {
    const s = this.hhmm(new Date(a.startDateTime));
    return `${s} • ${a.visitType}`;
  }

  // ---------- Toolbar ----------
  prevWeek() {
    this.weekStart = this.addDays(this.weekStart, -7);
    this.weekEnd = this.addDays(this.weekStart, 6);
    this.buildWeekDays();
    this.updateDateLabel();
    this.loadAppointments();
    this.savePreferencesToStorage();
  }

  nextWeek() {
    this.weekStart = this.addDays(this.weekStart, 7);
    this.weekEnd = this.addDays(this.weekStart, 6);
    this.buildWeekDays();
    this.updateDateLabel();
    this.loadAppointments();
    this.savePreferencesToStorage();
  }

  goToday() {
    if (this.viewMode === 'DAY') {
      this.today();
    } else {
      this.weekStart = this.startOfWeek(new Date());
      this.weekEnd = this.addDays(this.weekStart, 6);
      this.buildWeekDays();
      this.updateDateLabel();
      this.loadAppointments();
      this.savePreferencesToStorage();
    }
  }

  private buildWeekDays() {
    this.days = [];
    if (this.viewMode === 'DAY') {
      // DAY view: single day
      const date = new Date(this.weekStart);
      this.days.push({
        date,
        key: this.formatDate(date),
        label: date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
      });
    } else {
      // WEEK view: 7 days
      for (let i = 0; i < 7; i++) {
        const date = this.addDays(this.weekStart, i);
        this.days.push({
          date,
          key: this.formatDate(date),
          label: date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
        });
      }
    }
  }
      
  private startOfWeek(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // Monday = 1, Sunday = 0
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  onColumnTypeChange() {
    this.selectedColumnIds = [];
    this.loadColumns();
    this.savePreferencesToStorage();
  }

  onColumnSelectionChange() {
    this.loadAppointments();
  }

  // ---------- Drag & Drop ----------
  onDrop(event: CdkDragDrop<AppointmentBlock[]>) {
    const appt = event.previousContainer.data[event.previousIndex];
    
    // Parse container ID: "colId-dayKey" format
    const containerId = event.container.id;
    const parts = containerId.split('-');
    const newColumnId = Number(parts[0]);
    const dayKey = parts.slice(1).join('-'); // Handle dates with dashes (YYYY-MM-DD)
    
    if (!dayKey) {
      console.error('Invalid container ID format:', containerId);
      return;
    }
    
    // Get drop position from the dragged element's final position
    const draggedElement = event.item.element.nativeElement;
    const containerElement = event.container.element.nativeElement;
    const containerRect = containerElement.getBoundingClientRect();
    const draggedRect = draggedElement.getBoundingClientRect();
    const dropY = draggedRect.top - containerRect.top;
    const newTime = this.calculateTimeFromPosition(Math.max(0, dropY));
    
    if (event.previousContainer === event.container) {
      // Reorder within same cell - update time based on new position
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      
      this.schedulingService.moveAppointment(appt.id || appt.appointmentId || 0, {
        date: dayKey,
        startTime: newTime
      }).subscribe({
        next: (updated) => {
          const index = this.appts.findIndex(a => (a.id || a.appointmentId) === (appt.id || appt.appointmentId));
          if (index >= 0) {
            this.appts[index] = updated;
            this.groupAppointmentsByColumnAndDay();
          }
        },
        error: (err) => {
          console.error('Failed to move appointment:', err);
        if (err.status === 409) {
          const conflictReason = err.headers?.get('X-Conflict-Reason') || 'Doctor has a conflicting appointment at this time';
          this.showConflictError(conflictReason);
        } else {
          this.showConflictError('Failed to move appointment. Please try again.');
        }
          this.loadAppointments(); // Reload to revert
        }
      });
    } else {
      // Move to different cell (different column or day)
      const prevContainerId = event.previousContainer.id;
      const prevParts = prevContainerId.split('-');
      
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Update appointment provider/room and time

      // Update appointment via service
      this.schedulingService.moveAppointment(appt.id || appt.appointmentId || 0, {
        date: dayKey,
        startTime: newTime,
        providerId: this.columnType === 'PROVIDERS' ? newColumnId : undefined
      }).subscribe({
        next: (updated) => {
          // Update local data
          const index = this.appts.findIndex(a => (a.id || a.appointmentId) === (appt.id || appt.appointmentId));
          if (index >= 0) {
            this.appts[index] = updated;
            this.groupAppointmentsByColumnAndDay();
          }
        },
        error: (err) => {
          console.error('Failed to move appointment:', err);
          if (err.status === 409) {
            const conflictReason = err.headers?.get('X-Conflict-Reason') || 'Doctor has a conflicting appointment at this time';
            this.showConflictError(conflictReason);
          } else {
            this.showConflictError('Failed to move appointment. Please try again.');
          }
          // Revert the move
          transferArrayItem(
            event.container.data,
            event.previousContainer.data,
            event.currentIndex,
            event.previousIndex
          );
          this.loadAppointments(); // Reload to revert
        }
      });
    }
  }

  // ---------- Resize ----------
  onResizeStart(appt: AppointmentBlock, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault(); // Prevent click from firing
    this.isResizing = true;
    this.resizingAppt = appt;
    this.resizeStartY = event.clientY;
    this.resizeStartHeight = this.heightPx(appt);
    
    document.addEventListener('mousemove', this.onResizeMove);
    document.addEventListener('mouseup', this.onResizeEnd);
  }

  onResizeMove = (event: MouseEvent) => {
    if (!this.isResizing || !this.resizingAppt) return;

    const deltaY = event.clientY - this.resizeStartY;
    const newHeight = Math.max(20, this.resizeStartHeight + deltaY);
    const newDuration = Math.round(newHeight / this.pxPerMinute);
    
    // Snap to 15-minute increments
    const snappedDuration = Math.max(15, Math.round(newDuration / 15) * 15);
    
    // Visual update will happen via binding in template
    // No direct DOM manipulation - use data binding instead
  }

  onResizeEnd = (event: MouseEvent) => {
    if (!this.isResizing || !this.resizingAppt) return;

    const deltaY = event.clientY - this.resizeStartY;
    const newHeight = Math.max(20, this.resizeStartHeight + deltaY);
    const newDuration = Math.round(newHeight / this.pxPerMinute);
    const snappedDuration = Math.max(15, Math.round(newDuration / 15) * 15);

    // Update via service
    this.schedulingService.resizeAppointment(
      this.resizingAppt.id || this.resizingAppt.appointmentId || 0,
      { durationMinutes: snappedDuration }
    ).subscribe({
        next: (updated) => {
          const index = this.appts.findIndex(a => (a.id || a.appointmentId) === (this.resizingAppt!.id || this.resizingAppt!.appointmentId));
          if (index >= 0) {
            this.appts[index] = updated;
            this.groupAppointmentsByColumnAndDay();
          }
        },
      error: (err) => {
        console.error('Failed to resize appointment:', err);
        if (err.status === 409) {
          const conflictReason = err.headers?.get('X-Conflict-Reason') || 'Resizing would create a conflict with another appointment';
          this.showConflictError(conflictReason);
        } else {
          this.showConflictError('Failed to resize appointment. Please try again.');
        }
        // Reload to revert
        this.loadAppointments();
      }
    });

    this.isResizing = false;
    this.resizingAppt = null;
    document.removeEventListener('mousemove', this.onResizeMove);
    document.removeEventListener('mouseup', this.onResizeEnd);
  }

  // ---------- Click empty area to create new appointment ----------
  onGridClick(columnId: number, dayKey: string, ev: MouseEvent) {
    // Don't open drawer if clicking on an appointment
    if ((ev.target as HTMLElement).closest('.appt')) {
      return;
    }

    const target = ev.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const y = ev.clientY - rect.top;
    const time = this.calculateTimeFromPosition(y);
    const day = this.days.find(d => d.key === dayKey);
    
    if (!day) return;

    // Open Quick Book drawer with prefilled data
    this.openQuickBookDrawer(columnId, dayKey, time);
  }

  openQuickBookDrawer(columnId: number, dayKey: string, startTime: string): void {
    this.quickBookProviderId = columnId;
    this.quickBookDate = dayKey;
    this.quickBookStartTime = startTime;
    this.quickBookDuration = 15; // Default
    this.quickBookVisitType = null;
    this.quickBookReason = '';
    this.quickBookPatientSearch = '';
    this.quickBookPatientResults = [];
    this.quickBookSelectedPatient = null;
    this.quickBookErrors = [];
    this.showQuickBookDrawer = true;
  }

  closeQuickBookDrawer(ev?: Event): void {
    if (ev) {
      ev.stopPropagation();
    }
    this.showQuickBookDrawer = false;
    this.quickBookSelectedPatient = null;
    this.quickBookPatientResults = [];
    this.quickBookErrors = [];
  }

  onQuickBookPatientSearch(): void {
    if (!this.quickBookPatientSearch || this.quickBookPatientSearch.length < 2) {
      this.quickBookPatientResults = [];
      return;
    }

    this.schedulingService.searchPatients(this.quickBookPatientSearch).subscribe({
      next: (patients) => {
        this.quickBookPatientResults = patients.slice(0, 10); // Limit to 10 results
      },
      error: (err) => {
        console.error('Error searching patients:', err);
        this.quickBookPatientResults = [];
      }
    });
  }

  selectQuickBookPatient(patient: any): void {
    this.quickBookSelectedPatient = patient;
    this.quickBookPatientSearch = `${patient.firstName} ${patient.lastName}`;
    this.quickBookPatientResults = [];
  }

  clearQuickBookPatient(): void {
    this.quickBookSelectedPatient = null;
    this.quickBookPatientSearch = '';
    this.quickBookPatientResults = [];
  }

  saveQuickBook(): void {
    this.quickBookErrors = [];
    
    // Validation
    if (!this.quickBookSelectedPatient) {
      this.quickBookErrors.push('Please select a patient');
    }
    if (!this.quickBookProviderId) {
      this.quickBookErrors.push('Please select a provider');
    }
    if (!this.quickBookDate) {
      this.quickBookErrors.push('Please select a date');
    }
    if (!this.quickBookStartTime) {
      this.quickBookErrors.push('Please select a start time');
    }
    if (!this.quickBookDuration || this.quickBookDuration <= 0) {
      this.quickBookErrors.push('Please select a valid duration');
    }

    if (this.quickBookErrors.length > 0) {
      return;
    }

    this.isSavingQuickBook = true;

    // Build appointment data
    const appointmentData: any = {
      patientId: this.quickBookSelectedPatient.id || this.quickBookSelectedPatient.patientId,
      providerId: this.quickBookProviderId,
      appointmentDate: this.quickBookDate,
      appointmentTime: this.quickBookStartTime,
      durationMinutes: this.quickBookDuration,
      visitType: this.quickBookVisitType || 'IN_PERSON',
      visitReason: this.quickBookReason,
      status: 'SCHEDULED'
    };

    this.schedulingService.saveAppointment(appointmentData).subscribe({
      next: (result) => {
        this.isSavingQuickBook = false;
        this.closeQuickBookDrawer();
        this.loadAppointments(); // Refresh grid
        // Show success toast
        this.showConflictError('Appointment booked successfully!');
        setTimeout(() => {
          this.conflictError = null;
        }, 3000);
      },
      error: (err) => {
        this.isSavingQuickBook = false;
        if (err.status === 409) {
          const conflictReason = err.error?.message || err.error?.conflictReason || 'Time slot conflict';
          this.quickBookErrors.push(conflictReason);
          this.showConflictError(conflictReason);
        } else if (err.status === 400) {
          const errors = err.error?.errors || err.error?.message || ['Validation error'];
          this.quickBookErrors = Array.isArray(errors) ? errors : [errors];
        } else {
          this.quickBookErrors.push('Failed to book appointment. Please try again.');
        }
      }
    });
  }

  // ---------- Click appointment bar to edit ----------
  // Epic-style: Open appointment detail panel (enhanced version)
  onAppointmentClickEpic(appt: AppointmentBlock, ev: MouseEvent): void {
    ev.stopPropagation();
    ev.preventDefault();
    this.selectedAppointment = appt;
    this.showAppointmentDetailPanel = true;
  }

  // Epic-style: Close appointment detail panel
  closeAppointmentDetailPanel(): void {
    this.showAppointmentDetailPanel = false;
    this.selectedAppointment = null;
  }

  // Epic-style: Update appointment status (cancel, no-show, check-in)
  updateAppointmentStatus(appointmentId: number, status: string, reason?: string): void {
    this.schedulingService.updateAppointmentStatus(appointmentId, status, reason || '').subscribe({
      next: (updated) => {
        // Update local appointment if it's the selected one
        if (this.selectedAppointment && (this.selectedAppointment.id === appointmentId || this.selectedAppointment.appointmentId === appointmentId)) {
          // Map backend status to frontend status format - use updated.status if available, otherwise use status parameter
          const backendStatus = (updated as any)?.status || status;
          const frontendStatus = this.mapBackendStatusToFrontend(backendStatus);
          this.selectedAppointment = { ...this.selectedAppointment, status: frontendStatus as any };
        }
        // Reload appointments to get fresh data
        this.loadAppointments();
        // Keep panel open to show updated status
      },
      error: (err: any) => {
        console.error('Error updating appointment status:', err);
        if (err.status === 409) {
          this.showConflictError('Appointment was modified by another user. Please refresh.');
        } else {
          this.showConflictError('Failed to update appointment status: ' + (err.error?.error || err.message));
        }
      }
    });
  }

  // Epic-style: Handle status change from detail panel
  onStatusChange(event: { id: number; status: string; reason?: string }): void {
    this.updateAppointmentStatus(event.id, event.status, event.reason);
  }

  // Epic-style: Calculate summary strip data
  calculateSummaryStrip(): void {
    let total = 0;
    let urgent = 0;
    let openSlots = 0;
    const statusCounts: Record<string, number> = {
      SCHEDULED: 0,
      CONFIRMED: 0,
      ARRIVED: 0,
      CHECKED_IN: 0,
      CHECKED_OUT: 0,
      CANCELLED: 0,
      NO_SHOW: 0
    };

    // Count appointments for current view
    if (this.viewMode === 'DAY') {
      const day = this.days[0];
      if (day) {
        const dayAppts = Object.values(this.apptsByColumnAndDay)
          .flatMap(col => col[day.key] || []);
        total = dayAppts.length;
        urgent = dayAppts.filter(a => a.priority === 'URGENT' || a.status === 'Checked In' || a.status === 'Arrived').length;
        
        // Count by status
        dayAppts.forEach(a => {
          const status = (a.status || 'SCHEDULED').toUpperCase().replace(/[^A-Z_]/g, '_');
          if (statusCounts.hasOwnProperty(status)) {
            statusCounts[status]++;
          } else if (status.includes('SCHEDULED') || status.includes('SCHEDULE')) {
            statusCounts['SCHEDULED']++;
          } else if (status.includes('CONFIRMED')) {
            statusCounts['CONFIRMED']++;
          } else if (status.includes('ARRIVED')) {
            statusCounts['ARRIVED']++;
          } else if (status.includes('CHECKED_IN') || status.includes('CHECKED IN')) {
            statusCounts['CHECKED_IN']++;
          } else if (status.includes('CHECKED_OUT') || status.includes('CHECKED OUT')) {
            statusCounts['CHECKED_OUT']++;
          } else if (status.includes('CANCELLED') || status.includes('CANCELED')) {
            statusCounts['CANCELLED']++;
          } else if (status.includes('NO_SHOW') || status.includes('NOSHOW') || status.includes('NO SHOW')) {
            statusCounts['NO_SHOW']++;
          }
        });
      }

      // Calculate open slots (simplified: total slots - appointments)
      const totalSlots = ((this.endHour - this.startHour) * 60) / this.slotMinutes;
      const providerCount = this.selectedColumnIds.length;
      openSlots = Math.max(0, (totalSlots * providerCount) - total);
    } else {
      // Week view: sum across all days
      Object.values(this.apptsByColumnAndDay).forEach(col => {
        Object.values(col).forEach(dayAppts => {
          total += dayAppts.length;
          urgent += dayAppts.filter(a => a.priority === 'URGENT' || a.status === 'Checked In' || a.status === 'Arrived').length;
          
          // Count by status
          dayAppts.forEach(a => {
            const status = (a.status || 'SCHEDULED').toUpperCase().replace(/[^A-Z_]/g, '_');
            if (statusCounts.hasOwnProperty(status)) {
              statusCounts[status]++;
            } else if (status.includes('SCHEDULED') || status.includes('SCHEDULE')) {
              statusCounts['SCHEDULED']++;
            } else if (status.includes('CONFIRMED')) {
              statusCounts['CONFIRMED']++;
            } else if (status.includes('ARRIVED')) {
              statusCounts['ARRIVED']++;
            } else if (status.includes('CHECKED_IN') || status.includes('CHECKED IN')) {
              statusCounts['CHECKED_IN']++;
            } else if (status.includes('CHECKED_OUT') || status.includes('CHECKED OUT')) {
              statusCounts['CHECKED_OUT']++;
            } else if (status.includes('CANCELLED') || status.includes('CANCELED')) {
              statusCounts['CANCELLED']++;
            } else if (status.includes('NO_SHOW') || status.includes('NOSHOW') || status.includes('NO SHOW')) {
              statusCounts['NO_SHOW']++;
            }
          });
        });
      });
    }

    this.summaryData = {
      totalAppointments: total,
      openSlots: openSlots,
      urgentCount: urgent,
      scheduled: statusCounts['SCHEDULED'],
      confirmed: statusCounts['CONFIRMED'],
      arrived: statusCounts['ARRIVED'],
      checkedIn: statusCounts['CHECKED_IN'],
      checkedOut: statusCounts['CHECKED_OUT'],
      cancelled: statusCounts['CANCELLED'],
      noShow: statusCounts['NO_SHOW']
    };
  }

  // Epic-style: Day navigation methods
  prevDay(): void {
    if (this.viewMode === 'DAY') {
      this.currentDay = this.addDays(this.currentDay, -1);
      this.weekStart = new Date(this.currentDay);
      this.weekEnd = new Date(this.currentDay);
      this.buildWeekDays();
      this.updateDateLabel();
      this.loadAppointments();
    } else {
      this.prevPeriod();
    }
  }

  nextDay(): void {
    if (this.viewMode === 'DAY') {
      this.currentDay = this.addDays(this.currentDay, 1);
      this.weekStart = new Date(this.currentDay);
      this.weekEnd = new Date(this.currentDay);
      this.buildWeekDays();
      this.updateDateLabel();
      this.loadAppointments();
    } else {
      this.nextPeriod();
    }
  }

  today(): void {
    this.currentDay = new Date();
    if (this.viewMode === 'DAY') {
      this.weekStart = new Date(this.currentDay);
      this.weekEnd = new Date(this.currentDay);
      this.buildWeekDays();
    } else {
      this.goToday();
    }
    this.updateDateLabel();
    this.loadAppointments();
  }

  // Epic-style: Get formatted day label for top bar
  getDayLabel(): string {
    if (this.viewMode === 'DAY' && this.days.length > 0) {
      const day = this.days[0];
      return day.label || this.formatDateLabel(day.date);
    }
    return this.dateLabel;
  }

  // Map backend status (UPPER_SNAKE) to frontend status (Title Case)
  private mapBackendStatusToFrontend(backendStatus: string | null | undefined): string {
    if (!backendStatus) return 'Schedule'; // Default for null/undefined
    const upper = backendStatus.toUpperCase();
    if (upper === 'SCHEDULED' || upper.includes('SCHEDULE')) return 'Schedule';
    if (upper === 'CONFIRMED') return 'Confirmed';
    if (upper === 'ARRIVED') return 'Arrived';
    if (upper === 'CHECKED_IN' || upper.includes('CHECKED IN')) return 'Checked In';
    if (upper === 'CHECKED_OUT' || upper.includes('CHECKED OUT')) return 'Checked Out';
    if (upper === 'CANCELLED' || upper.includes('CANCELED')) return 'Cancelled';
    if (upper === 'NO_SHOW' || upper.includes('NOSHOW') || upper.includes('NO SHOW')) return 'Cancelled'; // Map NO_SHOW to Cancelled for display
    return 'Schedule'; // Default
  }

  // Main onAppointmentClick (Epic-style: opens detail panel)
  onAppointmentClick(appt: AppointmentBlock, ev: MouseEvent) {
    // Don't trigger if we're dragging or resizing
    if (this.isDragging || this.isResizing) {
      return;
    }
    
    ev.stopPropagation(); // Prevent triggering grid click
    ev.preventDefault(); // Prevent any default behavior

    // Epic-style: Open detail panel
    this.onAppointmentClickEpic(appt, ev);

    // Extract date and time from appointment (use startDateTime)
    const startTimeStr = appt.startDateTime;
    if (!startTimeStr) {
      console.warn('Appointment missing start time:', appt);
      return;
    }
    const apptDate = new Date(startTimeStr);
    const date = this.formatDate(apptDate);
    const hours = apptDate.getHours();
    const minutes = apptDate.getMinutes();
    const startTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    // Emit EDIT event - SchedulerComponent will handle the form
    const event: SchedulingEvent = {
      type: 'EDIT',
      appointmentId: appt.id || appt.appointmentId,
      providerId: appt.providerId,
      date: date,
      startTime: startTime,
      durationMinutes: appt.durationMinutes,
      patientId: appt.patientId
    };

    this.schedulingEvent.emit(event);
    
    // Navigate to scheduler edit route
    if (event.appointmentId) {
      this.router.navigate(['/admin/appointments', event.appointmentId, 'edit'], {
        queryParams: {
          providerId: event.providerId,
          date: event.date,
          startTime: event.startTime
        }
      }).then(() => {
        // Scroll to top after navigation
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  private calculateTimeFromPosition(y: number): string {
    const minutes = Math.floor(y / this.pxPerMinute);
    const totalMinutes = minutes;
    const hour = this.startHour + Math.floor(totalMinutes / 60);
    const min = totalMinutes % 60;
    return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  }

  private updateDateLabel() {
    this.dateLabel = `${this.weekStart.toLocaleDateString()} – ${this.weekEnd.toLocaleDateString()}`;
  }

  // ---------- Date utils ----------
  private addDays(d: Date, n: number): Date {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  }

  private formatDate(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  timeLabels(): string[] {
    const out: string[] = [];
    for (let h = this.startHour; h < this.endHour; h++) {
      out.push(this.formatAmPm(h, 0));
    }
    return out;
  }

  getColumns(): (ProviderCol | RoomCol)[] {
    return this.columnType === 'PROVIDERS' ? this.providerColumns : this.roomColumns;
  }

  getColumnName(column: ProviderCol | RoomCol): string {
    return column.name;
  }

  getColumnNameById(colId: number): string {
    const column = this.getColumns().find(c => c.id === colId);
    return column ? column.name : `Column ${colId}`;
  }

  getProviderAvatar(colId: number): string {
    if (this.columnType !== 'PROVIDERS') {
      return ''; // Rooms don't have avatars
    }
    const provider = this.allProviders.find(p => p.id === colId);
    if (!provider) return '';
    
    const providerWithImage = provider as { photoUrl?: string; profileImage?: string; imageUrl?: string; avatar?: string; doctorCode?: string };
    const image = providerWithImage?.photoUrl || 
                  providerWithImage?.profileImage || 
                  providerWithImage?.imageUrl || 
                  providerWithImage?.avatar;
    
    // Check if photoUrl exists and is a valid image
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
    
    // Use the image endpoint if provider ID is available
    const providerId = provider.id || providerWithImage?.doctorCode;
    if (providerId) {
      return `/api/doctors/${providerId}/image`;
    }
    
    // Fallback: Generate initials-based avatar with dark teal theme
    const initials = this.getProviderInitials(colId);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0d9488&color=fff&size=200&bold=true`;
  }

  hasProviderImage(colId: number): boolean {
    const provider = this.allProviders.find(p => p.id === colId);
    if (!provider) return false;
    
    const providerWithImage = provider as { photoUrl?: string; profileImage?: string; imageUrl?: string; avatar?: string };
    const image = providerWithImage?.photoUrl || 
                  providerWithImage?.profileImage || 
                  providerWithImage?.imageUrl || 
                  providerWithImage?.avatar;
    
    // Consider it has an image if it's a data URL, HTTP URL, or long base64 string
    return !!(image && (image.startsWith('data:image') || image.startsWith('http://') || image.startsWith('https://') || image.length > 100));
  }

  onProviderImageError(event: Event, colId: number): void {
    // Hide the image and show initials instead
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
      const initialsDiv = img.nextElementSibling as HTMLElement;
      if (initialsDiv && initialsDiv.classList.contains('provider-initials-fallback')) {
        initialsDiv.style.display = 'flex';
      }
    }
  }

  onPatientImageError(event: Event, appt: AppointmentBlock): void {
    // Hide the image and show initials instead
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
      const initialsDiv = img.nextElementSibling as HTMLElement;
      if (initialsDiv && initialsDiv.classList.contains('appt-avatar-initials-fallback')) {
        initialsDiv.style.display = 'flex';
      }
    }
  }

  getPatientAvatar(appt: AppointmentBlock): string {
    const apptWithImage = appt as AppointmentBlock & { 
      profileImage?: string; 
      patientAvatarUrl?: string; 
      patientPhotoUrl?: string; 
      patientImage?: string;
      photoUrl?: string;
      patientId?: number;
    };
    
    const image = apptWithImage?.profileImage || 
                  apptWithImage?.patientAvatarUrl || 
                  apptWithImage?.patientPhotoUrl || 
                  apptWithImage?.patientImage ||
                  apptWithImage?.photoUrl;
    
    // Check if image exists and is a valid image
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
    
    // Use the image endpoint if patient ID is available
    const patientId = appt.patientId || apptWithImage?.patientId;
    if (patientId) {
      return `/api/patients/${patientId}/image`;
    }
    
    // Fallback: Generate initials-based avatar with dark teal theme
    const initials = this.getPatientInitials(appt);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0d9488&color=fff&size=200&bold=true`;
  }

  /**
   * Get patient avatar for waitlist item
   */
  getWaitlistPatientAvatar(item: WaitlistItem): string {
    // Use the image endpoint if patient ID is available
    if (item.patientId) {
      return `/api/patients/${item.patientId}/image`;
    }
    
    // Fallback: Generate initials-based avatar with dark teal theme
    const initials = this.getWaitlistPatientInitials(item);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0d9488&color=fff&size=200&bold=true`;
  }

  /**
   * Get patient initials for waitlist item
   */
  getWaitlistPatientInitials(item: WaitlistItem): string {
    if (!item.patientName) return '??';
    const parts = item.patientName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] || '').toUpperCase() + (parts[parts.length - 1][0] || '').toUpperCase();
    }
    return (parts[0]?.[0] || '?').toUpperCase() + (parts[0]?.[1] || '').toUpperCase();
  }

  /**
   * Handle waitlist patient image error
   */
  onWaitlistPatientImageError(event: Event, item: WaitlistItem): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
      // Show initials fallback
      const initialsDiv = img.nextElementSibling as HTMLElement;
      if (initialsDiv && initialsDiv.classList.contains('wl-avatar-initials-fallback')) {
        initialsDiv.style.display = 'flex';
      }
    }
  }

  getPatientInitials(appt: AppointmentBlock): string {
    if (!appt.patientName) return '??';
    const parts = appt.patientName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }

  hasPatientImage(appt: AppointmentBlock): boolean {
    const apptWithImage = appt as AppointmentBlock & { 
      profileImage?: string; 
      patientAvatarUrl?: string; 
      patientPhotoUrl?: string; 
      patientImage?: string;
      photoUrl?: string;
    };
    
    const image = apptWithImage?.profileImage || 
                  apptWithImage?.patientAvatarUrl || 
                  apptWithImage?.patientPhotoUrl || 
                  apptWithImage?.patientImage ||
                  apptWithImage?.photoUrl;
    
    // Consider it has an image if it's a data URL, HTTP URL, or long base64 string
    return !!(image && (image.startsWith('data:image') || image.startsWith('http://') || image.startsWith('https://') || image.length > 100));
  }

  getProviderInitials(colId: number): string {
    const provider = this.allProviders.find(p => p.id === colId);
    if (!provider) return '??';
    const providerWithName = provider as { name?: string; firstName?: string; lastName?: string };
    const name = providerWithName?.name || `${providerWithName?.firstName || ''} ${providerWithName?.lastName || ''}`.trim();
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }

  getConnectedLists(): string[] {
    // Generate all possible column-day combinations for drag-drop
    const lists: string[] = [];
    this.selectedColumnIds.forEach(colId => {
      this.days.forEach(day => {
        lists.push(`${colId}-${day.key}`);
      });
    });
    return lists;
  }

  getTotalAppointmentsForColumn(columnId: number): number {
    let total = 0;
    const columnData = this.apptsByColumnAndDay[columnId];
    if (columnData) {
      Object.keys(columnData).forEach(dayKey => {
        total += columnData[dayKey].length;
      });
    }
    return total;
  }

  private hhmm(d: Date): string {
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  private formatAmPm(h: number, m: number) {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr}:${String(m).padStart(2,'0')} ${ampm}`;
  }

  // ---------- Epic-style Enhanced Features ----------

  // View Mode Management
  setViewMode(mode: 'WEEK' | 'DAY' | 'MONTH'): void {
    this.viewMode = mode;
    if (mode === 'DAY') {
      this.currentDay = new Date();
      this.weekStart = new Date(this.currentDay);
      this.weekEnd = new Date(this.currentDay);
      this.days = [{ date: this.weekStart, key: this.formatDate(this.weekStart), label: this.formatDateLabel(this.weekStart) }];
    } else if (mode === 'WEEK') {
      this.weekStart = this.startOfWeek(new Date());
      this.weekEnd = this.addDays(this.weekStart, 6);
      this.buildWeekDays();
    }
    this.updateDateLabel();
    this.loadAppointments();
    this.checkSlotTemplates(); // Update slot template status
  }

  // Enhanced Navigation
  prevPeriod(): void {
    if (this.viewMode === 'DAY') {
      this.weekStart = this.addDays(this.weekStart, -1);
      this.weekEnd = this.weekStart;
    } else {
      this.prevWeek();
    }
  }

  nextPeriod(): void {
    if (this.viewMode === 'DAY') {
      this.weekStart = this.addDays(this.weekStart, 1);
      this.weekEnd = this.weekStart;
    } else {
      this.nextWeek();
    }
  }

  openDatePicker(): void {
    const dateStr = prompt('Enter date (YYYY-MM-DD):', this.formatDate(new Date()));
    if (dateStr) {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        if (this.viewMode === 'DAY') {
          this.weekStart = date;
          this.weekEnd = date;
        } else {
          this.weekStart = this.startOfWeek(date);
          this.weekEnd = this.addDays(this.weekStart, 6);
        }
        this.buildWeekDays();
        this.updateDateLabel();
        this.loadAppointments();
      }
    }
  }

  // Search Functionality
  onSearchChange(): void {
    this.applyFilters();
  }

  onProviderSearchChange(): void {
    // Filter is applied in getFilteredColumns()
  }

  getFilteredColumns(): Array<ProviderCol | RoomCol> {
    const columns = this.getColumns();
    if (this.columnType === 'PROVIDERS' && this.providerSearchQuery) {
      const query = this.providerSearchQuery.toLowerCase();
      return columns.filter(col => {
        const name = this.getColumnName(col).toLowerCase();
        return name.includes(query);
      });
    }
    return columns;
  }

  // Filter Management
  clearFilter(type: 'department' | 'specialization' | 'designation'): void {
    if (type === 'department') {
      this.filterDepartmentId = null;
    } else if (type === 'specialization') {
      this.filterSpecializationId = null;
    } else if (type === 'designation') {
      this.filterDesignationId = null;
    }
    this.onFilterChange();
    this.savePreferencesToStorage();
  }

  getDepartmentName(id: number | null): string {
    if (!id) return '';
    const dept = this.departments.find(d => d.id === String(id));
    return dept?.name || '';
  }

  getSpecializationName(id: number | null): string {
    if (!id) return '';
    const spec = this.specializations.find(s => s.id === String(id));
    return spec?.name || '';
  }

  getDesignationName(id: number | null): string {
    if (!id) return '';
    const desig = this.designations.find(d => d.id === String(id));
    return desig?.name || '';
  }

  // Statistics
  getTotalAppointments(): number {
    return this.appts.length;
  }

  // Summary Strip KPIs
  getSummaryLabel(): string {
    if (this.viewMode === 'WEEK') {
      return 'This Week';
    } else if (this.viewMode === 'DAY') {
      return 'Today';
    }
    return 'Total';
  }

  getTotalAppointmentsForRange(): number {
    return this.appts.length;
  }

  getUrgentCount(): number {
    // Count appointments with URGENT or HIGH priority
    return this.appts.filter(a => a.priority === 'URGENT' || a.priority === 'HIGH').length;
  }

  hasSlotTemplates: boolean | null = null; // null = not checked yet, true/false = checked

  getOpenSlotsCount(): string {
    if (this.hasSlotTemplates === null) {
      // Check if templates exist (async, but we'll show N/A until checked)
      return 'N/A';
    }
    if (this.hasSlotTemplates === false) {
      return 'N/A';
    }
    
    // Calculate open slots: total possible slots minus booked appointments
    // For each day in range, calculate slots based on startHour to endHour with slotMinutes interval
    let totalSlots = 0;
    const slotDuration = this.slotMinutes; // 15 minutes default
    
    this.days.forEach(day => {
      const dayStart = new Date(day.date);
      dayStart.setHours(this.startHour, 0, 0, 0);
      const dayEnd = new Date(day.date);
      dayEnd.setHours(this.endHour, 0, 0, 0);
      
      const totalMinutes = (dayEnd.getTime() - dayStart.getTime()) / (1000 * 60);
      const slotsPerDay = Math.floor(totalMinutes / slotDuration);
      totalSlots += slotsPerDay * this.selectedColumnIds.length;
    });
    
    // Subtract booked appointments
    const bookedSlots = this.appts.length;
    const openSlots = Math.max(0, totalSlots - bookedSlots);
    
    return openSlots.toString();
  }

  checkSlotTemplates(): void {
    // Simple check: if we have providers, assume templates might exist
    // In a real implementation, you'd call a service to check
    // For now, we'll assume templates exist if we have selected providers
    this.hasSlotTemplates = this.selectedColumnIds.length > 0;
  }

  // Waitlist Management
  getFilteredWaitlist(): WaitlistItem[] {
    if (!this.waitlistSearchQuery) {
      return this.waitlist;
    }
    const query = this.waitlistSearchQuery.toLowerCase();
    return this.waitlist.filter(w => 
      w.patientName?.toLowerCase().includes(query) ||
      w.reason?.toLowerCase().includes(query)
    );
  }

  toggleWaitlistPanel(): void {
    this.waitlistPanelExpanded = !this.waitlistPanelExpanded;
  }

  scheduleFromWaitlist(item: WaitlistItem): void {
    // Navigate to scheduler with waitlist item data
    if (this.selectedColumnIds.length > 0) {
      this.schedulingEvent.emit({
        type: 'CREATE',
        providerId: this.selectedColumnIds[0],
        date: item.preferredDate || this.formatDate(new Date()),
        startTime: item.preferredTime || this.hhmm(new Date()),
        patientId: item.patientId
      });
    } else {
      // If no provider selected, navigate to new appointment page
      this.router.navigate(['/admin/appointments/new'], {
        queryParams: { waitlistItem: JSON.stringify(item) }
      });
    }
  }

  // Quick Actions
  refreshData(): void {
    this.loadAppointments();
    this.loadWaitlist();
  }

  exportSchedule(): void {
    const csv = this.generateCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedule-${this.formatDate(this.weekStart)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  printSchedule(): void {
    window.print();
  }

  generateCSV(): string {
    const headers = ['Date', 'Time', 'Provider', 'Patient', 'Visit Type', 'Status', 'Priority'];
    const rows = this.appts.map(a => {
      const dt = new Date(a.startDateTime);
      return [
        this.formatDate(dt),
        this.hhmm(dt),
        this.getColumnNameById(a.providerId || 0),
        a.patientName || '',
        a.visitType || '',
        a.status || '',
        a.priority || ''
      ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  }

  // Keyboard Shortcuts
  setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-input') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }

      if (e.key === 'F5') {
        e.preventDefault();
        this.refreshData();
      }

      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        this.printSchedule();
      }

      if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        this.prevPeriod();
      }
      if (e.key === 'ArrowRight' && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        this.nextPeriod();
      }

      if ((e.key === 't' || e.key === 'T') && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        this.goToday();
      }

      if ((e.key === 'w' || e.key === 'W') && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        this.setViewMode('WEEK');
      }
      if ((e.key === 'd' || e.key === 'D') && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        this.setViewMode('DAY');
      }
      if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        this.setViewMode('MONTH');
      }

      if (e.key === '?') {
        e.preventDefault();
        this.showShortcuts = !this.showShortcuts;
      }

      // Epic-style shortcuts
      if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        // Navigate to new appointment page
        this.router.navigate(['/admin/appointments/new']);
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        this.closeAllPanels();
      }

      if (e.key === 'Enter' && this.focusedSlot && !this.showQuickBookDrawer) {
        e.preventDefault();
        this.openQuickBookForSlot(this.focusedSlot.columnId, this.focusedSlot.dayKey, this.focusedSlot.time);
      }

      // Arrow keys for slot navigation (when not in input)
      if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !this.showQuickBookDrawer && !this.showAppointmentDetailPanel) {
        e.preventDefault();
        this.navigateSlot(e.key === 'ArrowUp' ? -1 : 1);
      }
    });
  }

  // Epic-style: Open quick book modal
  openQuickBook(): void {
    if (this.focusedSlot) {
      this.openQuickBookForSlot(this.focusedSlot.columnId, this.focusedSlot.dayKey, this.focusedSlot.time);
    } else {
      // Open with first provider and today
      const today = this.formatDate(new Date());
      const firstProvider = this.selectedColumnIds[0] || null;
      const todayKey = this.days[0]?.key || today;
      this.openQuickBookDrawer(firstProvider || 0, todayKey, '09:00');
    }
  }

  // Epic-style: Open quick book for specific slot
  openQuickBookForSlot(columnId: number, dayKey: string, time: string): void {
    const day = this.days.find(d => d.key === dayKey);
    if (!day) return;
    
    this.quickBookProviderId = columnId;
    this.quickBookDate = this.formatDate(day.date);
    this.quickBookStartTime = time;
    this.showQuickBookDrawer = true;
  }

  // Epic-style: Close all panels
  closeAllPanels(): void {
    this.showQuickBookDrawer = false;
    this.showAppointmentDetailPanel = false;
    this.selectedAppointment = null;
  }

  // Epic-style: Navigate slots with arrow keys
  navigateSlot(direction: number): void {
    if (!this.focusedSlot) {
      // Initialize focus to first slot
      if (this.selectedColumnIds.length > 0 && this.days.length > 0) {
        this.focusedSlot = {
          columnId: this.selectedColumnIds[0],
          dayKey: this.days[0].key,
          time: `${this.startHour.toString().padStart(2, '0')}:00`
        };
      }
      return;
    }

    // Calculate next slot (simplified: move by 15 minutes)
    const [hours, minutes] = this.focusedSlot.time.split(':').map(Number);
    let newMinutes = minutes + (direction * 15);
    let newHours = hours;
    
    if (newMinutes < 0) {
      newMinutes = 45;
      newHours--;
    } else if (newMinutes >= 60) {
      newMinutes = 0;
      newHours++;
    }

    if (newHours < this.startHour) {
      newHours = this.endHour - 1;
      newMinutes = 45;
    } else if (newHours >= this.endHour) {
      newHours = this.startHour;
      newMinutes = 0;
    }

    this.focusedSlot = {
      ...this.focusedSlot,
      time: `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
    };
  }

  formatDateLabel(date: Date): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  }

  // Conflict error handling
  showConflictError(message: string): void {
    this.conflictError = message;
    setTimeout(() => {
      this.conflictError = null;
    }, 5000);
  }

  // Empty slot hover handling
  onSlotHover(columnId: number, dayKey: string, event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const time = this.calculateTimeFromPosition(y);
    this.hoveredSlot = { columnId, dayKey, time };
  }

  onSlotLeave(): void {
    this.hoveredSlot = null;
  }

  getHoverTooltip(): string {
    if (!this.hoveredSlot) return '';
    const day = this.days.find(d => d.key === this.hoveredSlot!.dayKey);
    const providerName = this.getColumnNameById(this.hoveredSlot.columnId);
    return `Create appointment at ${this.hoveredSlot.time} with ${providerName}${day ? ` on ${day.label}` : ''}`;
  }

  getHoverTooltipPosition(): number {
    if (!this.hoveredSlot) return 0;
    // Calculate position based on hovered time
    const [hours, minutes] = this.hoveredSlot.time.split(':').map(Number);
    const minsFromStart = (hours - this.startHour) * 60 + minutes;
    return Math.max(0, minsFromStart * this.pxPerMinute - 24);
  }

  getAppointmentTooltip(appt: AppointmentBlock): string {
    const dt = new Date(appt.startDateTime);
    const time = this.hhmm(dt);
    const endTime = appt.endDateTime ? this.hhmm(new Date(appt.endDateTime)) : '';
    return `${appt.patientName}\n${time}${endTime ? ` - ${endTime}` : ''}\n${appt.visitType || 'Visit'}\nStatus: ${appt.status || 'Scheduled'}`;
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return 'Scheduled';
    const statusMap: Record<string, string> = {
      'SCHEDULED': 'Scheduled',
      'CONFIRMED': 'Confirmed',
      'ARRIVED': 'Arrived',
      'CHECKED_IN': 'Checked In',
      'CHECKED_OUT': 'Checked Out',
      'CANCELLED': 'Cancelled',
      'Schedule': 'Scheduled',
      'Confirmed': 'Confirmed',
      'Arrived': 'Arrived',
      'Checked In': 'Checked In',
      'Checked Out': 'Checked Out',
      'Cancelled': 'Cancelled'
    };
    return statusMap[status.toUpperCase()] || status;
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return 'schedule';
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  // ---------- LocalStorage Persistence ----------
  private readonly STORAGE_KEY = 'scheduleGrid_preferences';

  loadPreferencesFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const prefs = JSON.parse(stored);
        if (prefs.viewMode) this.viewMode = prefs.viewMode;
        if (prefs.columnType) this.columnType = prefs.columnType;
        if (prefs.selectedColumnIds && Array.isArray(prefs.selectedColumnIds)) {
          this.selectedColumnIds = prefs.selectedColumnIds;
        }
        if (prefs.weekStart) {
          this.weekStart = new Date(prefs.weekStart);
          this.weekEnd = this.addDays(this.weekStart, 6);
        }
        if (prefs.filterDepartmentId) this.filterDepartmentId = prefs.filterDepartmentId;
        if (prefs.filterSpecializationId) this.filterSpecializationId = prefs.filterSpecializationId;
        if (prefs.filterDesignationId) this.filterDesignationId = prefs.filterDesignationId;
        if (prefs.searchQuery) this.searchQuery = prefs.searchQuery;
        if (prefs.providerSearchQuery) this.providerSearchQuery = prefs.providerSearchQuery;
      }
    } catch (e) {
      console.warn('Failed to load preferences from localStorage:', e);
    }
  }

  savePreferencesToStorage(): void {
    try {
      const prefs = {
        viewMode: this.viewMode,
        columnType: this.columnType,
        selectedColumnIds: this.selectedColumnIds,
        weekStart: this.weekStart.toISOString(),
        filterDepartmentId: this.filterDepartmentId,
        filterSpecializationId: this.filterSpecializationId,
        filterDesignationId: this.filterDesignationId,
        searchQuery: this.searchQuery,
        providerSearchQuery: this.providerSearchQuery
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.warn('Failed to save preferences to localStorage:', e);
    }
  }

  // Mini Calendar Methods
  getCurrentMonthLabel(): string {
    const date = new Date(this.miniCalendarYear, this.miniCalendarMonth, 1);
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }

  getWeekdayLabels(): string[] {
    return ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  }

  getMiniCalendarDays(): Array<{ day: number; date: Date; otherMonth: boolean; isToday: boolean; isSelected: boolean }> {
    const days: Array<{ day: number; date: Date; otherMonth: boolean; isToday: boolean; isSelected: boolean }> = [];
    const firstDay = new Date(this.miniCalendarYear, this.miniCalendarMonth, 1);
    const lastDay = new Date(this.miniCalendarYear, this.miniCalendarMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if current week range includes any of the displayed days
    const isDateInCurrentRange = (date: Date): boolean => {
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);
      return dateOnly >= this.weekStart && dateOnly <= this.weekEnd;
    };
    
    for (let i = 0; i < 42; i++) { // 6 weeks × 7 days
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateOnly = new Date(currentDate);
      dateOnly.setHours(0, 0, 0, 0);
      
      days.push({
        day: currentDate.getDate(),
        date: new Date(currentDate),
        otherMonth: currentDate.getMonth() !== this.miniCalendarMonth,
        isToday: dateOnly.getTime() === today.getTime(),
        isSelected: isDateInCurrentRange(currentDate)
      });
    }
    
    return days;
  }

  prevMonth(): void {
    if (this.miniCalendarMonth === 0) {
      this.miniCalendarMonth = 11;
      this.miniCalendarYear--;
    } else {
      this.miniCalendarMonth--;
    }
  }

  nextMonth(): void {
    if (this.miniCalendarMonth === 11) {
      this.miniCalendarMonth = 0;
      this.miniCalendarYear++;
    } else {
      this.miniCalendarMonth++;
    }
  }

  selectDateFromMiniCalendar(date: Date): void {
    // Navigate to the selected date
    if (this.viewMode === 'DAY') {
      this.weekStart = new Date(date);
      this.weekEnd = new Date(date);
    } else {
      this.weekStart = this.startOfWeek(date);
      this.weekEnd = this.addDays(this.weekStart, 6);
    }
    this.buildWeekDays();
    this.updateDateLabel();
    this.loadAppointments();
    this.savePreferencesToStorage();
  }

  formatDateForTitle(date: Date): string {
    return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  jumpWeeks(weeks: number): void {
    this.weekStart = this.addDays(this.weekStart, 7 * weeks);
    this.weekEnd = this.addDays(this.weekStart, 6);
    this.buildWeekDays();
    this.updateDateLabel();
    this.loadAppointments();
    this.savePreferencesToStorage();
  }
}
