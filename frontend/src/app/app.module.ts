import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { RoleComponent } from './role/role.component';
import { DesignationComponent } from './designation/designation.component';
import { DoctorComponent } from './doctor/doctor.component';
import { StaffComponent } from './staff/staff.component';
import { routes } from './app.routing';

@NgModule({
  declarations: [
    AppComponent,
    RoleComponent,
    DesignationComponent,
    DoctorComponent,
    StaffComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

