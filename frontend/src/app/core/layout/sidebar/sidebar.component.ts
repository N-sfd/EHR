import { Component, Input, OnInit, inject } from '@angular/core';
import { FeatureFlagsService } from '../../services/feature-flags.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface MenuChild {
  label: string;
  route: string;
}

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  children?: MenuChild[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Input() isOpen: boolean = true;
  expandedItems: Set<string> = new Set();
  activeRoute: string = '';

  private readonly featureFlags = inject(FeatureFlagsService);

  constructor(private router: Router) {}

  get menuSections(): MenuSection[] {
    return this.baseMenuSections;
  }

  ngOnInit() {
    // Track current route to ensure only one item is active
    this.activeRoute = this.router.url;
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.activeRoute = event.url;
      // Close all expanded submenus when route changes, then auto-expand if needed
      this.expandedItems.clear();
      this.autoExpandActiveSubmenu();
    });
    
    // Auto-expand submenu if current route matches a child route
    this.autoExpandActiveSubmenu();
  }
  
  autoExpandActiveSubmenu() {
    // Find which menu item contains the current route as a child
    for (const section of this.menuSections) {
      for (const item of section.items) {
        if (item.children) {
          const hasActiveChild = item.children.some(child => 
            this.activeRoute === child.route || this.activeRoute.startsWith(child.route + '/')
          );
          if (hasActiveChild) {
            this.expandedItems.clear();
            this.expandedItems.add(item.label);
            return;
          }
        }
      }
    }
  }

  private readonly baseMenuSections: MenuSection[] = [
    {
      title: 'Main Menu',
      items: [
        { 
          icon: 'fa-grip', 
          label: 'Dashboard', 
          route: '/admin/dashboard'
        },
        {
          icon: 'fa-wand-magic-sparkles',
          label: 'AI Assistant',
          route: '/admin/ai-assistant'
        }
      ]
    },
    {
      title: 'Staff',
      items: [
        { 
          icon: 'fa-people-group', 
          label: 'Staff List',
          route: '/admin/staff-management'
        },
        { 
          icon: 'fa-user-plus', 
          label: 'Add Staff',
          route: '/admin/staffs/add'
        }
      ]
    },
    {
      title: 'Providers',
      items: [
        { 
          icon: 'fa-user-doctor', 
          label: 'All Providers',
          route: '/admin/providers'
        },
        { 
          icon: 'fa-user-plus', 
          label: 'Add Provider',
          route: '/admin/doctors/add'
        },
        { 
          icon: 'fa-calendar', 
          label: 'Provider Schedule',
          route: '/admin/doctors/schedule'
        }
      ]
    },
    {
      title: 'Patients',
      items: [
        {
          icon: 'fa-users',
          label: 'Patient List',
          route: '/admin/patients'
        },
        {
          icon: 'fa-user-plus',
          label: 'Add Patient',
          route: '/admin/patients/add'
        }
      ]
    },
    {
      title: 'Appointments',
      items: [
        {
          icon: 'fa-calendar-grid',
          label: 'Schedule Grid',
          route: '/admin/appointments/grid'
        },
        {
          icon: 'fa-calendar-plus',
          label: 'New Appointment',
          route: '/admin/appointments/new'
        }
      ]
    },
    {
      title: 'Admin Configuration',
      items: [
        { 
          icon: 'fa-calendar-alt', 
          label: 'Provider Schedules',
          route: '/admin/schedules'
        },
        { 
          icon: 'fa-clipboard-list', 
          label: 'Registration Rules',
          route: '/admin/registration-rules'
        },
        { 
          icon: 'fa-exclamation-triangle', 
          label: 'Alerts & Warnings',
          route: '/admin/alerts-warnings'
        }
      ]
    },
    {
      title: 'HR Settings',
      items: [
        { 
          icon: 'fa-shield-alt', 
          label: 'Roles',
          route: '/admin/roles-permissions',
          children: [
            { label: 'Roles', route: '/admin/roles-permissions' }
          ]
        },
        { icon: 'fa-briefcase', label: 'Designation', route: '/admin/designations' },
        { icon: 'fa-building', label: 'Departments', route: '/admin/departments' },
        { icon: 'fa-stethoscope', label: 'Specializations', route: '/admin/specializations' }
      ]
    },
    {
      title: 'Reports',
      items: [
        { 
          icon: 'fa-chart-bar', 
          label: 'Reports',
          children: [
            { label: 'Scheduling Analytics', route: '/reports/scheduling-analytics' },
            { label: 'Provider Utilization', route: '/reports/provider-utilization' },
            { label: 'Scheduling Workqueue', route: '/reports/scheduling-workqueue' }
          ]
        }
      ]
    }
  ];

  toggleSubmenu(itemLabel: string, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Always clear all submenus first to ensure only one is open
    const wasExpanded = this.expandedItems.has(itemLabel);
    this.expandedItems.clear();
    
    // If it wasn't expanded, expand it now (toggle behavior)
    if (!wasExpanded) {
      this.expandedItems.add(itemLabel);
    }
    // If it was expanded, we've already cleared it, so it stays closed
  }

  isExpanded(itemLabel: string): boolean {
    return this.expandedItems.has(itemLabel);
  }

  hasChildren(item: MenuItem): boolean {
    return !!(item.children && item.children.length > 0);
  }

  isActiveRoute(route: string): boolean {
    if (!route) return false;
    
    // Exact match
    if (this.activeRoute === route) {
      return true;
    }
    
    // Check if current route starts with this route (child route)
    if (!this.activeRoute.startsWith(route + '/')) {
      return false;
    }
    
    // If it's a child route, check if there's a more specific route that also matches
    // Only highlight if this is the most specific matching route
    const allRoutes = this.getAllRoutes();
    const moreSpecificRoutes = allRoutes.filter(r => 
      r !== route && 
      r.startsWith(route + '/') && 
      (this.activeRoute === r || this.activeRoute.startsWith(r + '/'))
    );
    
    // If there are more specific routes that match, don't highlight this one
    if (moreSpecificRoutes.length > 0) {
      return false;
    }
    
    // This is the most specific matching route
    return true;
  }

  private getAllRoutes(): string[] {
    const routes: string[] = [];
    for (const section of this.menuSections) {
      for (const item of section.items) {
        if (item.route) {
          routes.push(item.route);
        }
        if (item.children) {
          for (const child of item.children) {
            routes.push(child.route);
          }
        }
      }
    }
    return routes;
  }

  navigateToDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }
}


