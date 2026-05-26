import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationPrefsService } from '../../../core/services/notification-prefs.service';
import { AppNotification, NotificationSeverity } from '../../../core/models/notification.model';
import { NotificationPrefs } from '../../../core/models/notification-prefs.model';
import { Subscription } from 'rxjs';

type FilterType = 'All' | 'Unread' | 'Alerts';
type TabType = 'inbox' | 'settings';

@Component({
  selector: 'app-notifications-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './notifications-drawer.component.html',
  styleUrls: ['./notifications-drawer.component.scss']
})
export class NotificationsDrawerComponent implements OnInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  private notificationService = inject(NotificationService);
  private notificationPrefsService = inject(NotificationPrefsService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  activeTab: TabType = 'inbox';
  filter: FilterType = 'All';
  notifications: AppNotification[] = [];
  filteredNotifications: AppNotification[] = [];
  preferences!: NotificationPrefs;
  prefsForm!: FormGroup;
  
  private subscriptions: Subscription[] = [];

  categories: string[] = ['Scheduling', 'Registration', 'Orders', 'Billing', 'System'];
  severities: NotificationSeverity[] = ['INFO', 'WARN', 'CRITICAL'];
  filterTypes: FilterType[] = ['All', 'Unread', 'Alerts'];

  hasUnreadNotifications(): boolean {
    return this.filteredNotifications.some(n => !n.read);
  }

  toggleReadStatus(notification: AppNotification): void {
    if (notification.read) {
      this.markUnread(notification);
    } else {
      this.markRead(notification);
    }
  }

  ngOnInit() {
    this.subscriptions.push(
      this.notificationService.notifications$.subscribe(notifications => {
        this.notifications = notifications;
        this.applyFilter();
      })
    );

    this.subscriptions.push(
      this.notificationPrefsService.prefs$.subscribe(prefs => {
        this.preferences = prefs;
        this.initPrefsForm();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initPrefsForm() {
    this.prefsForm = this.fb.group({
      enableInApp: [this.preferences.enableInApp],
      enableEmail: [this.preferences.enableEmail],
      enableSMS: [this.preferences.enableSMS],
      doNotDisturb: [this.preferences.doNotDisturb],
      dndStart: [this.preferences.dndStart || '22:00'],
      dndEnd: [this.preferences.dndEnd || '07:00'],
      mutedCategories: [this.preferences.mutedCategories || []],
      severityThreshold: [this.preferences.severityThreshold || 'INFO']
    });
  }

  setTab(tab: TabType) {
    this.activeTab = tab;
  }

  setFilter(filter: FilterType | string) {
    this.filter = filter as FilterType;
    this.applyFilter();
  }

  applyFilter() {
    let filtered = [...this.notifications];

    // Apply filter
    if (this.filter === 'Unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (this.filter === 'Alerts') {
      filtered = filtered.filter(n => n.severity === 'WARN' || n.severity === 'CRITICAL');
    }

    // Apply preferences filters
    const prefs = this.preferences;
    
    // Filter by severity threshold
    const severityOrder: NotificationSeverity[] = ['INFO', 'WARN', 'CRITICAL'];
    const thresholdIndex = severityOrder.indexOf(prefs.severityThreshold);
    filtered = filtered.filter(n => {
      const severityIndex = severityOrder.indexOf(n.severity);
      return severityIndex >= thresholdIndex;
    });

    // Filter by muted categories
    if (prefs.mutedCategories.length > 0) {
      filtered = filtered.filter(n => !n.category || !prefs.mutedCategories.includes(n.category));
    }

    // Sort by createdAt (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    this.filteredNotifications = filtered;
  }

  markRead(notification: AppNotification) {
    if (!notification.read) {
      this.notificationService.markRead(notification.id);
    }
  }

  markUnread(notification: AppNotification) {
    if (notification.read) {
      this.notificationService.markUnread(notification.id);
    }
  }

  markAllRead() {
    this.notificationService.markAllRead();
  }

  clear(notification: AppNotification) {
    this.notificationService.clear(notification.id);
  }

  clearAll() {
    if (confirm('Are you sure you want to clear all notifications?')) {
      this.notificationService.clearAll();
    }
  }

  navigateToAction(notification: AppNotification) {
    if (notification.route) {
      this.router.navigate([notification.route]);
      this.close.emit();
    }
  }

  toggleCategory(category: string) {
    const current = this.prefsForm.get('mutedCategories')?.value || [];
    const index = current.indexOf(category);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(category);
    }
    this.prefsForm.patchValue({ mutedCategories: current });
  }

  isCategoryMuted(category: string): boolean {
    const muted = this.prefsForm.get('mutedCategories')?.value || [];
    return muted.includes(category);
  }

  savePreferences() {
    if (this.prefsForm.valid) {
      const formValue = this.prefsForm.value;
      this.notificationPrefsService.updatePreferences({
        enableInApp: formValue.enableInApp,
        enableEmail: formValue.enableEmail,
        enableSMS: formValue.enableSMS,
        doNotDisturb: formValue.doNotDisturb,
        dndStart: formValue.dndStart,
        dndEnd: formValue.dndEnd,
        mutedCategories: formValue.mutedCategories,
        severityThreshold: formValue.severityThreshold
      });
    }
  }

  getSeverityClass(severity: NotificationSeverity): string {
    switch (severity) {
      case 'CRITICAL':
        return 'severity-critical';
      case 'WARN':
        return 'severity-warn';
      default:
        return 'severity-info';
    }
  }

  getTimeAgo(createdAt: string): string {
    const now = new Date();
    const time = new Date(createdAt);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  }

  closeDrawer() {
    this.close.emit();
  }

  onBackdropClick() {
    this.closeDrawer();
  }

  onDrawerClick(event: Event) {
    event.stopPropagation();
  }
}

