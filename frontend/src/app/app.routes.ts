import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import { PatientLayoutComponent } from './core/layout/patient-layout/patient-layout.component';
import { AdminDashboardComponent } from './features/dashboard/admin-dashboard/admin-dashboard.component';
import { unsavedChangesGuard } from './core/guards/unsaved-changes.guard';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { patientSmartGuard } from './core/guards/patient-smart.guard';
import { aiFeatureGuard } from './core/guards/ai-feature.guard';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },
  
  // Patient shell routes
  {
    path: 'patient',
    component: PatientLayoutComponent,
    children: [
      {
        path: 'launch',
        loadComponent: () =>
          import('./features/patient/launch/launch.component')
            .then(m => m.LaunchComponent)
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/patient/home/home.component')
            .then(m => m.HomeComponent),
        canActivate: [patientSmartGuard]
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/patient/appointments/appointments.component')
            .then(m => m.AppointmentsComponent),
        canActivate: [patientSmartGuard]
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },

  // Admin shell routes
  {
    path: 'admin',
    component: LayoutComponent,
    canActivateChild: [authGuard],
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      
      // ---------- HR SETTINGS ----------
      // HR Settings component not yet implemented
      // {
      //   path: 'admin/hr-settings',
      //   loadComponent: () =>
      //     import('./features/hr-settings/hr-settings.component')
      //       .then(m => m.HrSettingsComponent)
      // },
      {
        path: 'designations',
        loadComponent: () =>
          import('./features/designations/designations.component')
            .then(m => m.DesignationsComponent)
      },
      {
        path: 'departments',
        loadComponent: () =>
          import('./features/departments/departments.component')
            .then(m => m.DepartmentsComponent)
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./features/rbac/roles-permissions.component')
            .then(m => m.RolesPermissionsComponent),
        canActivate: [roleGuard(['ADMIN'])]
      },
      {
        path: 'roles-permissions',
        loadComponent: () =>
          import('./features/rbac/roles-permissions.component')
            .then(m => m.RolesPermissionsComponent),
        canActivate: [roleGuard(['ADMIN'])]
      },
      
      // ---------- STAFF MANAGEMENT ----------
      {
        path: 'staff-management',
        loadComponent: () =>
          import('./features/staff-management/staff-management.component')
            .then(m => m.StaffManagementComponent)
      },
      // ---------- STAFF (Legacy routes - redirect to staff-management) ----------
      {
        path: 'staffs',
        loadComponent: () =>
          import('./features/staffs/staffs.component')
            .then(m => m.StaffsComponent)
      },
      {
        path: 'staffs/add',
        loadComponent: () =>
          import('./features/staffs/add-staff/add-staff.component')
            .then(m => m.AddStaffComponent)
      },
      {
        path: 'staffs/edit/:id',
        loadComponent: () =>
          import('./features/staffs/add-staff/add-staff.component')
            .then(m => m.AddStaffComponent)
      },
      
      // ---------- DOCTORS ----------
      {
        path: 'doctors',
        loadComponent: () =>
          import('./features/doctors/doctors.component')
            .then(m => m.DoctorsComponent)
      },
      // ---------- PROVIDERS (alias for doctors) ----------
      {
        path: 'providers',
        redirectTo: 'doctors',
        pathMatch: 'full'
      },
      {
        path: 'doctors/add',
        loadComponent: () =>
          import('./features/doctors/add-doctor/add-doctor.component')
            .then(m => m.AddDoctorComponent)
      },
      {
        path: 'doctors/edit/:id',
        loadComponent: () =>
          import('./features/doctors/add-doctor/add-doctor.component')
            .then(m => m.AddDoctorComponent)
      },
      {
        path: 'doctors/profile/:id',
        loadComponent: () =>
          import('./features/doctors/doctor-details/doctor-details.component')
            .then(m => m.DoctorDetailsComponent)
      },
      {
        path: 'doctors/schedule',
        loadComponent: () =>
          import('./features/doctors/doctor-schedule/doctor-schedule.component')
            .then(m => m.DoctorScheduleComponent)
      },
      
      // ---------- PATIENTS ----------
      {
        path: 'patient-management',
        loadComponent: () =>
          import('./features/dashboard/patient-dashboard/patient-dashboard.component')
            .then(m => m.PatientDashboardComponent)
      },
      {
        path: 'patients',
        loadComponent: () =>
          import('./features/patients/patients.component')
            .then(m => m.PatientsComponent)
      },
      {
        path: 'patients/add',
        loadComponent: () =>
          import('./features/patients/add-edit-patient/add-edit-patient.component')
            .then(m => m.AddEditPatientComponent)
      },
      {
        path: 'patients/edit/:id',
        loadComponent: () =>
          import('./features/patients/add-edit-patient/add-edit-patient.component')
            .then(m => m.AddEditPatientComponent)
      },
      {
        path: 'patients/profile/:id',
        loadComponent: () =>
          import('./features/patients/patient-details/patient-details.component')
            .then(m => m.PatientDetailsComponent)
      },
      {
        path: 'patients/:id/snapshot',
        loadComponent: () =>
          import('./features/patients/patient-snapshot/patient-snapshot.component')
            .then(m => m.PatientSnapshotComponent)
      },
      {
        path: 'ai-assistant',
        loadComponent: () =>
          import('./features/ai-assistant/assistant-panel/assistant-panel.component')
            .then(m => m.AssistantPanelComponent),
        canActivate: [aiFeatureGuard]
      },
      {
        path: 'ai-assistant/:patientId',
        loadComponent: () =>
          import('./features/ai-assistant/assistant-panel/assistant-panel.component')
            .then(m => m.AssistantPanelComponent),
        canActivate: [aiFeatureGuard]
      },
      {
        path: 'patients/:id/mychart',
        loadComponent: () =>
          import('./features/patients/patient-details/patient-details.component')
            .then(m => m.PatientDetailsComponent)
      },
      
      // ---------- APPOINTMENTS ----------
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/appointment/appointments-shell/appointments-shell.component')
            .then(m => m.AppointmentsShellComponent),
        children: [
          {
            path: '',
            redirectTo: 'grid',
            pathMatch: 'full'
          },
          {
            path: 'grid',
            loadComponent: () =>
              import('./features/appointment/schedule-grid/schedule-grid.component')
                .then(m => m.ScheduleGridComponent),
            data: { title: 'Schedule Grid' }
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/appointment/scheduler/scheduler.component')
                .then(m => m.SchedulerComponent),
            data: { title: 'New Appointment' }
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/appointment/scheduler/scheduler.component')
                .then(m => m.SchedulerComponent),
            data: { title: 'Edit Appointment' }
          },
          // Legacy routes - redirect to grid
          {
            path: 'all',
            redirectTo: 'grid',
            pathMatch: 'full'
          },
          {
            path: 'scheduler',
            redirectTo: 'grid',
            pathMatch: 'full'
          },
          {
            path: 'calendar',
            redirectTo: 'grid',
            pathMatch: 'full'
          },
          {
            path: 'appointment-book',
            redirectTo: 'grid',
            pathMatch: 'full'
          },
          {
            path: 'book',
            redirectTo: 'grid',
            pathMatch: 'full'
          }
        ]
      },
      // Legacy route redirects for appointments
      {
        path: 'scheduling/appointments',
        redirectTo: 'appointments/all',
        pathMatch: 'full'
      },
      {
        path: 'provider-templates',
        redirectTo: 'schedules',
        pathMatch: 'full'
      },
      {
        path: 'schedules',
        loadComponent: () =>
          import('./features/admin/schedules/schedules.component')
            .then(m => m.SchedulesComponent)
      },
      {
        path: 'registration-rules',
        loadComponent: () =>
          import('./features/admin/registration-rules/registration-rules.component')
            .then(m => m.RegistrationRulesComponent)
      },
      {
        path: 'alerts-warnings',
        loadComponent: () =>
          import('./features/admin/alerts-warnings/alerts-warnings.component')
            .then(m => m.AlertsWarningsComponent)
      },
      // Demo route removed - not part of canonical domains
      
      // ---------- SERVICES ----------
      // Services component removed - functionality moved to other modules
      
      // ---------- SPECIALIZATIONS ----------
      {
        path: 'specializations',
        loadComponent: () =>
          import('./features/specializations/specializations.component')
            .then(m => m.SpecializationsComponent)
      },
      
      // ---------- LOCATIONS ----------
      {
        path: 'locations',
        loadComponent: () =>
          import('./features/locations/locations.component')
            .then(m => m.LocationsComponent)
      },
      
      // ---------- ANALYSIS ----------
      {
        path: 'analysis',
        loadComponent: () =>
          import('./features/analysis/analysis.component')
            .then(m => m.AnalysisComponent)
      },
      
      // ---------- REPORTS ----------
      {
        path: 'reports/scheduling-analytics',
        loadComponent: () =>
          import('./features/reports/scheduling-analytics/scheduling-analytics.component')
            .then(m => m.SchedulingAnalyticsComponent),
        data: { title: 'Scheduling Analytics' }
      },
      {
        path: 'reports/provider-utilization',
        loadComponent: () =>
          import('./features/reports/provider-utilization/provider-utilization.component')
            .then(m => m.ProviderUtilizationComponent),
        data: { title: 'Provider Utilization' }
      },
      {
        path: 'reports/scheduling-workqueue',
        loadComponent: () =>
          import('./features/reports/scheduling-workqueue/scheduling-workqueue.component')
            .then(m => m.SchedulingWorkqueueComponent),
        data: { title: 'Scheduling Workqueue' }
      },
      
      // (Removed deprecated Patient Search + Clinical Encounters routes)
    ]
  },
  
  // Legacy redirects for backward compatibility
  { path: 'dashboard', redirectTo: 'admin/dashboard', pathMatch: 'full' },
  { path: 'reports', redirectTo: 'admin/reports/scheduling-analytics', pathMatch: 'full' },
  { path: 'reports/scheduling-analytics', redirectTo: 'admin/reports/scheduling-analytics', pathMatch: 'full' },
  { path: 'reports/provider-utilization', redirectTo: 'admin/reports/provider-utilization', pathMatch: 'full' },
  { path: 'reports/scheduling-workqueue', redirectTo: 'admin/reports/scheduling-workqueue', pathMatch: 'full' },
  { path: 'doctors', redirectTo: 'admin/doctors', pathMatch: 'full' },
  { path: 'patients', redirectTo: 'admin/patient-management', pathMatch: 'full' },
  { path: 'ambulatory', redirectTo: 'admin/appointments/grid', pathMatch: 'full' },
  
  // Root redirect
  { path: '', redirectTo: 'admin/dashboard', pathMatch: 'full' },
  
  // Catch-all redirect
  { path: '**', redirectTo: 'admin/dashboard' }
];


