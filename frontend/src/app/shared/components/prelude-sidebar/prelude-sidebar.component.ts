import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface SidebarItem {
  label: string;
  icon: string;
  route: string;
  key?: string; // For keyboard navigation
}

@Component({
  selector: 'app-prelude-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prelude-sidebar.component.html',
  styleUrls: ['./prelude-sidebar.component.scss']
})
export class PreludeSidebarComponent implements OnInit {
  @Input() mrn: string = '';
  @Input() active?: string;
  @Output() navigate = new EventEmitter<string>();

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  
  selectedIndex: number = 0;
  focusedIndex: number = 0;

  items: SidebarItem[] = [
    { label: 'Demographics', icon: 'fas fa-user', route: 'demographics', key: '1' },
    { label: 'Insurance', icon: 'fas fa-shield-alt', route: 'insurance', key: '2' },
    { label: 'Guarantor', icon: 'fas fa-user-friends', route: 'guarantor', key: '3' },
    { label: 'Appointments', icon: 'fas fa-calendar', route: 'appointments', key: '4' },
    { label: 'Documents', icon: 'fas fa-file', route: 'documents', key: '5' },
    { label: 'Alerts', icon: 'fas fa-exclamation-triangle', route: 'alerts', key: '6' }
  ];

  ngOnInit() {
    // Listen to route changes to update active item
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateActiveFromRoute(event.url);
      });

    // Set initial active item
    this.updateActiveFromRoute(this.router.url);
  }

  updateActiveFromRoute(url: string) {
    // Extract the last segment from the URL (e.g., 'demographics', 'insurance', etc.)
    const segments = url.split('/').filter(s => s.length > 0);
    const route = segments[segments.length - 1] || 'demographics';
    const index = this.items.findIndex(item => item.route === route);
    if (index >= 0) {
      this.selectedIndex = index;
      this.focusedIndex = index;
    } else {
      // Default to first item if route not found
      this.selectedIndex = 0;
      this.focusedIndex = 0;
    }
  }

  onItemClick(item: SidebarItem, index: number) {
    this.selectedIndex = index;
    this.focusedIndex = index;
    // Use relative navigation - navigate to the child route relative to current route
    this.router.navigate([item.route], { relativeTo: this.activatedRoute });
    this.navigate.emit(item.route);
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusedIndex = Math.min(this.focusedIndex + 1, this.items.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusedIndex = Math.max(this.focusedIndex - 1, 0);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.onItemClick(this.items[this.focusedIndex], this.focusedIndex);
        break;
      case 'Home':
        event.preventDefault();
        this.focusedIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        this.focusedIndex = this.items.length - 1;
        break;
    }
  }
}

