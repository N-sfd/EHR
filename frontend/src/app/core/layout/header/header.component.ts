import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, CurrentUser } from '../../services/auth.service';
import { AdminProfileService } from '../../services/admin-profile.service';
import { NotificationService } from '../../services/notification.service';
import { AdminProfileDrawerComponent } from '../../../shared/components/admin-profile-drawer/admin-profile-drawer.component';
import { NotificationsDrawerComponent } from '../../../shared/components/notifications-drawer/notifications-drawer.component';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, AsyncPipe, RouterLink, RouterLinkActive, AdminProfileDrawerComponent, NotificationsDrawerComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  private authService = inject(AuthService);
  private router = inject(Router);
  private adminProfileService = inject(AdminProfileService);
  private notificationService = inject(NotificationService);
  
  profile$ = this.adminProfileService.profile$;
  unreadCount$ = this.notificationService.unreadCount$;
  currentUser$: Observable<CurrentUser | null> = this.authService.getCurrentUser();
  showProfileDrawer = false;
  showNotificationsDrawer = false;
  showOrgSwitcher = false;

  readonly organizations = [{ name: 'CareOS Demo Health System', id: 1 }];
  activeOrg = this.organizations[0];

  toggleOrgSwitcher(): void {
    this.showNotificationsDrawer = false;
    this.showProfileDrawer = false;
    this.showOrgSwitcher = !this.showOrgSwitcher;
  }

  ngOnInit(): void {
    // Load current user on init
    this.currentUser$ = this.authService.getCurrentUser();
  }

  // Helper to check if user is authenticated (for logout button visibility)
  // Check both service method and localStorage as fallback
  get isAuthenticated(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    // Fallback: check localStorage directly
    try {
      const storedUser = localStorage.getItem('auth_user_v1');
      return storedUser !== null && storedUser !== '';
    } catch {
      return false;
    }
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  openProfileDrawer() {
    this.showNotificationsDrawer = false; // Close notifications drawer if open
    this.showProfileDrawer = true;
  }

  closeProfileDrawer() {
    this.showProfileDrawer = false;
  }

  openNotificationsDrawer() {
    this.showProfileDrawer = false; // Close profile drawer if open
    this.showNotificationsDrawer = true;
  }

  closeNotificationsDrawer() {
    this.showNotificationsDrawer = false;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Even if logout fails, navigate to login
        this.router.navigate(['/login']);
      }
    });
  }
}


