import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { StaffDirectoryComponent } from './staff-directory/staff-directory.component';
import { RolesManagementComponent } from './roles-management/roles-management.component';
import { RoleAssignmentsComponent } from './role-assignments/role-assignments.component';

@Component({
  selector: 'app-staff-management',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    StaffDirectoryComponent,
    RolesManagementComponent,
    RoleAssignmentsComponent
  ],
  templateUrl: './staff-management.component.html',
  styleUrls: ['./staff-management.component.css']
})
export class StaffManagementComponent implements OnInit {
  activeTab: 'directory' | 'roles' | 'assignments' = 'directory';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if there's a tab in the route
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'] as 'directory' | 'roles' | 'assignments';
      }
    });
  }

  setActiveTab(tab: 'directory' | 'roles' | 'assignments') {
    this.activeTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
}

