import { Routes } from '@angular/router';
import { RoleComponent } from './role/role.component';
import { DesignationComponent } from './designation/designation.component';
import { DoctorComponent } from './doctor/doctor.component';
import { StaffComponent } from './staff/staff.component';

export const routes: Routes = [
  { path: '', redirectTo: '/roles', pathMatch: 'full' },
  { path: 'roles', component: RoleComponent },
  { path: 'designations', component: DesignationComponent },
  { path: 'doctors', component: DoctorComponent },
  { path: 'staff', component: StaffComponent }
];

