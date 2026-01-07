import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import { AdminDashboardComponent } from './features/dashboard/admin-dashboard/admin-dashboard.component';
import { unsavedChangesGuard } from './core/guards/unsaved-changes.guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'admin/dashboard', pathMatch: 'full' },
      { path: 'admin/dashboard', component: AdminDashboardComponent },
      
      // ---------- HR SETTINGS ----------
      // HR Settings component not yet implemented
      // {
      //   path: 'admin/hr-settings',
      //   loadComponent: () =>
      //     import('./features/hr-settings/hr-settings.component')
      //       .then(m => m.HrSettingsComponent)
      // },
      {
        path: 'admin/designations',
        loadComponent: () =>
          import('./features/designations/designations.component')
            .then(m => m.DesignationsComponent)
      },
      {
        path: 'admin/departments',
        loadComponent: () =>
          import('./features/departments/departments.component')
            .then(m => m.DepartmentsComponent)
      },
      {
        path: 'admin/roles',
        loadComponent: () =>
          import('./features/rbac/roles-permissions.component')
            .then(m => m.RolesPermissionsComponent)
      },
      {
        path: 'admin/roles-permissions',
        loadComponent: () =>
          import('./features/rbac/roles-permissions.component')
            .then(m => m.RolesPermissionsComponent)
      },
      
      // ---------- STAFF MANAGEMENT ----------
      {
        path: 'admin/staff-management',
        loadComponent: () =>
          import('./features/staff-management/staff-management.component')
            .then(m => m.StaffManagementComponent)
      },
      // ---------- STAFF (Legacy routes - redirect to staff-management) ----------
      {
        path: 'admin/staffs',
        loadComponent: () =>
          import('./features/staffs/staffs.component')
            .then(m => m.StaffsComponent)
      },
      {
        path: 'admin/staffs/add',
        loadComponent: () =>
          import('./features/staffs/add-staff/add-staff.component')
            .then(m => m.AddStaffComponent)
      },
      {
        path: 'admin/staffs/edit/:id',
        loadComponent: () =>
          import('./features/staffs/add-staff/add-staff.component')
            .then(m => m.AddStaffComponent)
      },
      
      // ---------- DOCTORS ----------
      {
        path: 'admin/doctors',
        loadComponent: () =>
          import('./features/doctors/doctors.component')
            .then(m => m.DoctorsComponent)
      },
      {
        path: 'admin/doctors/add',
        loadComponent: () =>
          import('./features/doctors/add-doctor/add-doctor.component')
            .then(m => m.AddDoctorComponent)
      },
      {
        path: 'admin/doctors/edit/:id',
        loadComponent: () =>
          import('./features/doctors/add-doctor/add-doctor.component')
            .then(m => m.AddDoctorComponent)
      },
      {
        path: 'admin/doctors/profile/:id',
        loadComponent: () =>
          import('./features/doctors/doctor-details/doctor-details.component')
            .then(m => m.DoctorDetailsComponent)
      },
      {
        path: 'admin/doctors/schedule',
        loadComponent: () =>
          import('./features/doctors/doctor-schedule/doctor-schedule.component')
            .then(m => m.DoctorScheduleComponent)
      },
      
      // ---------- PATIENTS ----------
      {
        path: 'admin/patient-management',
        loadComponent: () =>
          import('./features/dashboard/patient-dashboard/patient-dashboard.component')
            .then(m => m.PatientDashboardComponent)
      },
      {
        path: 'admin/patients',
        loadComponent: () =>
          import('./features/patients/patients.component')
            .then(m => m.PatientsComponent)
      },
      {
        path: 'admin/patients/add',
        loadComponent: () =>
          import('./features/patients/add-edit-patient/add-edit-patient.component')
            .then(m => m.AddEditPatientComponent)
      },
      {
        path: 'admin/patients/edit/:id',
        loadComponent: () =>
          import('./features/patients/add-edit-patient/add-edit-patient.component')
            .then(m => m.AddEditPatientComponent)
      },
      
      // ---------- APPOINTMENTS ----------
      {
        path: 'admin/appointments',
        loadComponent: () =>
          import('./features/appointment/appointments.component')
            .then(m => m.AppointmentsComponent)
      },
      {
        path: 'admin/appointments/new',
        loadComponent: () =>
          import('./features/appointment/new-appointment.component')
            .then(m => m.NewAppointmentComponent)
      },
      {
        path: 'admin/appointments/calendar',
        loadComponent: () =>
          import('./features/appointment/appointment-calendar.component')
            .then(m => m.AppointmentCalendarComponent)
      },
      {
        path: 'admin/appointments/cadence',
        loadComponent: () =>
          import('./features/appointment/cadence-schedule-grid/cadence-schedule-grid.component')
            .then(m => m.CadenceScheduleGridComponent)
      },
      {
        path: 'admin/appointments/scheduler',
        loadComponent: () =>
          import('./features/appointment/epic-scheduler/epic-scheduler.component')
            .then(m => m.EpicSchedulerComponent)
      },
      {
        path: 'scheduling/appointments',
        loadComponent: () =>
          import('./features/scheduling/appointment-scheduler/appointment-scheduler.component')
            .then(m => m.AppointmentSchedulerComponent)
      },
      {
        path: 'admin/provider-templates',
        loadComponent: () =>
          import('./features/admin/provider-templates/provider-templates.component')
            .then(m => m.ProviderTemplatesComponent)
      },
      {
        path: 'admin/schedules',
        loadComponent: () =>
          import('./features/admin/schedules/schedules.component')
            .then(m => m.SchedulesComponent)
      },
      {
        path: 'admin/registration-rules',
        loadComponent: () =>
          import('./features/admin/registration-rules/registration-rules.component')
            .then(m => m.RegistrationRulesComponent)
      },
      {
        path: 'admin/alerts-warnings',
        loadComponent: () =>
          import('./features/admin/alerts-warnings/alerts-warnings.component')
            .then(m => m.AlertsWarningsComponent)
      },
      {
        path: 'demo',
        loadComponent: () =>
          import('./features/demo/workflow-demo/workflow-demo.component')
            .then(m => m.WorkflowDemoComponent)
      },
      
      // ---------- SERVICES ----------
      // Services component removed - functionality moved to other modules
      
      // ---------- SPECIALIZATIONS ----------
      {
        path: 'admin/specializations',
        loadComponent: () =>
          import('./features/specializations/specializations.component')
            .then(m => m.SpecializationsComponent)
      },
      
      // ---------- LOCATIONS ----------
      {
        path: 'admin/locations',
        loadComponent: () =>
          import('./features/locations/locations.component')
            .then(m => m.LocationsComponent)
      },
      
      // ---------- ANALYSIS ----------
      {
        path: 'admin/analysis',
        loadComponent: () =>
          import('./features/analysis/analysis.component')
            .then(m => m.AnalysisComponent)
      },
      
      // ---------- PRELUDE ----------
      {
        path: 'prelude/search',
        loadComponent: () =>
          import('./features/prelude/patient-search/patient-search.component')
            .then(m => m.PatientSearchComponent)
      },
      {
        path: 'prelude/patient/:mrn',
        loadComponent: () =>
          import('./features/prelude/prelude-patient-shell/prelude-patient-shell.component')
            .then(m => m.PreludePatientShellComponent),
        children: [
          {
            path: '',
            redirectTo: 'demographics',
            pathMatch: 'full'
          },
          {
            path: 'demographics',
            loadComponent: () =>
              import('./features/prelude/pages/demographics/demographics.component')
                .then(m => m.DemographicsComponent),
            canDeactivate: [unsavedChangesGuard]
          },
          {
            path: 'insurance',
            loadComponent: () =>
              import('./features/prelude/pages/insurance/insurance.component')
                .then(m => m.InsuranceComponent)
          },
          {
            path: 'guarantor',
            loadComponent: () =>
              import('./features/prelude/pages/guarantor/guarantor.component')
                .then(m => m.GuarantorComponent)
          },
          {
            path: 'appointments',
            loadComponent: () =>
              import('./features/prelude/pages/appointments/appointments.component')
                .then(m => m.AppointmentsComponent)
          },
          {
            path: 'documents',
            loadComponent: () =>
              import('./features/prelude/pages/documents/documents.component')
                .then(m => m.DocumentsComponent)
          },
          {
            path: 'alerts',
            loadComponent: () =>
              import('./features/prelude/pages/alerts/alerts.component')
                .then(m => m.AlertsComponent)
          }
        ]
      },
      // Legacy routes for backward compatibility
      {
        path: 'admin/prelude/search',
        redirectTo: 'prelude/search',
        pathMatch: 'full'
      },
      
      // ---------- AMBULATORY ----------
      {
        path: 'ambulatory',
        loadComponent: () =>
          import('./features/ambulatory/ambulatory-shell/ambulatory-shell.component')
            .then(m => m.AmbulatoryShellComponent),
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'clinical-encounters'
          },
          {
            path: 'clinical-encounters',
            loadComponent: () =>
              import('./features/ambulatory/clinical-encounters/clinical-encounters.component')
                .then(m => m.ClinicalEncountersComponent)
          },
          {
            path: 'clinical-encounters/:encounterId',
            loadComponent: () =>
              import('./features/ambulatory/clinical-encounter-detail/clinical-encounter-detail.component')
                .then(m => m.ClinicalEncounterDetailComponent)
          }
        ]
      },
      // Legacy route for backward compatibility
      {
        path: 'admin/ambulatory/encounter/:encounterId',
        loadComponent: () =>
          import('./features/ambulatory/ambulatory-encounter/ambulatory-encounter.component')
            .then(m => m.AmbulatoryEncounterComponent)
      },
    ]
  },
  { path: '**', redirectTo: 'admin/dashboard' }
];


