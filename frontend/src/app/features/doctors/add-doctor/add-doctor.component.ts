import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { StaffService } from '../../../core/services/staff.service';
import { Staff } from '../../../core/models/staff.model';
import { LocationService } from '../../../core/services/location.service';
import { LocationDto } from '../../../core/models/location.model';
import { MasterDataService } from '../../../core/services/master-data.service';
import { Department } from '../../../core/models/department.model';
import { Designation } from '../../../core/models/designation.model';
import { SpecializationDto } from '../../../core/models/specialization.model';
import { MasterDepartment, MasterDesignation, MasterSpecialization } from '../../../core/models/master-data.model';
import { AddDepartmentModalComponent } from '../../../shared/components/add-department-modal/add-department-modal.component';
import { DoctorService } from '../../../core/services/doctor.service';

interface Education {
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

interface Certification {
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate: string;
}

@Component({
  selector: 'app-add-doctor',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule, 
    FormsModule, 
    AddDepartmentModalComponent,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './add-doctor.component.html',
  styleUrls: ['./add-doctor.component.css']
})
export class AddDoctorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private staffService = inject(StaffService);
  private doctorService = inject(DoctorService);
  private locationService = inject(LocationService);
  private masterDataService = inject(MasterDataService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  specializations: SpecializationDto[] = [];
  departments: Department[] = [];
  designations: Designation[] = [];
  filteredDesignations: Designation[] = [];
  locations: LocationDto[] = [];

  isEditMode = false;
  doctorIdFromRoute: string | null = null;
  staffIdForUpdate: number | null = null; // Store numeric staffId for updates
  isSaving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  retryCount = 0;
  maxRetries = 5; // Increased retries for code generation race conditions
  showRetryButton = false;

  currentStep = 1;
  totalSteps = 5;

  // Profile image
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('addDepartmentModal') addDepartmentModal!: AddDepartmentModalComponent;
  profileImagePreview: string | null = null;

  // Education and Certifications
  educations: Education[] = [{ institution: '', degree: '', startDate: '', endDate: '' }];
  certifications: Certification[] = [{ name: '', issuingOrganization: '', issueDate: '', expiryDate: '' }];

  // Working days
  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  selectedWorkingDays: string[] = [];

  form = this.fb.group({
    // Step 1: Personal Info
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    photoUrl: [''],

    // Step 1: Personal Info (moved from Step 2)
    emailAddress: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    gender: [''],
    dateOfBirth: [''],
    pronoun: [''],
    ethnicity: [''],
    departmentId: [null as number | null, Validators.required],
    designationId: [null as number | null], // Maps to jobId
    specializationIds: [[] as number[]],
    yearsOfExperience: [null as number | null],
    consultationType: [''],
    about: [''],

    // Step 4: Availability
    primaryLocationId: [null as number | null],
    startTime: ['09:00'],
    endTime: ['17:00'],
    slotDuration: [30],

    // Step 5: Licensing
    licenseNumber: [''],
    licenseCouncil: [''],
    licenseIssueDate: [''],
    licenseExpiry: [''],
    complianceNotes: ['']
  });

  ngOnInit(): void {
    // Only get id from route if we're on edit route (not /add)
    const currentRoute = this.router.url;
    if (currentRoute.includes('/edit/')) {
      this.doctorIdFromRoute = this.route.snapshot.paramMap.get('id');
      this.isEditMode = !!this.doctorIdFromRoute;
    } else {
      // On /add route, ensure we're in create mode
      this.doctorIdFromRoute = null;
      this.isEditMode = false;
    }

    // Load lookups first, then load staff data if in edit mode
    this.loadLookups().then(() => {
      // Set up department change subscription after data is loaded
      // Use takeUntil pattern to avoid memory leaks, but for now just subscribe
      const deptControl = this.form.get('departmentId');
      if (deptControl) {
        deptControl.valueChanges.subscribe(deptId => {
          console.log('Department value changed:', deptId);
          const deptIdNum = deptId ? Number(deptId) : null;
          this.onDepartmentChange(deptIdNum);
        });
        
        // Also trigger initial filter if department is already selected
        const currentDeptId = deptControl.value;
        if (currentDeptId) {
          console.log('Initial department value found:', currentDeptId);
          this.onDepartmentChange(Number(currentDeptId));
        }
      }
      
      if (this.isEditMode && this.doctorIdFromRoute) {
        console.log('Loading staff data for edit, ID:', this.doctorIdFromRoute);
        this.loadDoctorData(this.doctorIdFromRoute);
      }
    });
  }

  loadLookups(): Promise<void> {
    return new Promise((resolve) => {
      let loadedCount = 0;
      const totalLoads = 3;
      
      const checkComplete = () => {
        loadedCount++;
        if (loadedCount === totalLoads) {
          console.log('All lookups loaded');
          resolve();
        }
      };
      
      this.masterDataService.getSpecializations().subscribe({
        next: (masterSpecs: MasterSpecialization[]) => {
          this.specializations = masterSpecs.map(spec => ({
            id: Number(spec.id) || undefined,
            specializationId: Number(spec.id) || undefined,
            name: spec.name,
            code: spec.code,
            departmentId: spec.departmentId ? Number(spec.departmentId) : undefined,
            description: spec.description,
            status: spec.active ? 'ACTIVE' : 'INACTIVE'
          }));
          checkComplete();
        },
        error: (err) => {
          console.error('Error loading specializations', err);
          this.specializations = [];
          checkComplete();
        }
      });
      
      this.masterDataService.getDepartments().subscribe({
        next: (masterDepts: MasterDepartment[]) => {
          this.departments = masterDepts.map(dept => ({
            id: dept.id,
            departmentId: Number(dept.id) || undefined,
            name: dept.name,
            code: dept.code,
            description: dept.description,
            active: dept.active,
            status: dept.active ? 'ACTIVE' : 'INACTIVE',
            specialtyGroup: dept.specialtyGroup
          }));
          console.log('Departments loaded:', this.departments.length);
          checkComplete();
        },
        error: (err) => {
          console.error('Error loading departments', err);
          this.departments = [];
          checkComplete();
        }
      });
      
      this.masterDataService.getDesignations().subscribe({
        next: (masterDes: MasterDesignation[]) => {
          // Map designationId to id for consistency and remove duplicates
          const mapped = masterDes.map(des => ({
            id: Number(des.id) || undefined,
            designationId: Number(des.id) || undefined,
            title: des.name,
            code: des.code,
            description: des.description,
            status: des.active ? 'ACTIVE' : 'INACTIVE',
            active: des.active
          }));
          // Remove duplicates by id
          this.designations = Array.from(
            new Map(mapped.map(des => [des.id, des])).values()
          );
          console.log('Designations loaded:', this.designations.length);
          console.log('Designations with departments:', this.designations.map(d => ({ 
            id: d.id, 
            title: d.title, 
            deptId: d.departmentId,
            status: d.status
          })));
          // Initialize filtered designations (empty until department is selected)
          this.filteredDesignations = [];
          
          // If a department is already selected, filter designations now
          const currentDeptId = this.form.get('departmentId')?.value;
          if (currentDeptId) {
            console.log('Department already selected, filtering designations...');
            this.onDepartmentChange(Number(currentDeptId));
          }
          
          checkComplete();
        },
        error: (err) => {
          console.error('Error loading designations', err);
          checkComplete();
        }
      });
    });
    this.locationService.getAll().subscribe({
      next: (locs) => (this.locations = locs),
      error: (err) => {
        // Silently handle location service errors if service is not available
        this.locations = [];
      }
    });
  }

  loadDoctorData(idOrCode: string) {
    // Check if it's a numeric ID or a doctorCode (starts with "D-")
    const isNumericId = /^\d+$/.test(idOrCode);
    
    if (isNumericId) {
      // It's a numeric ID, use staff service directly
      console.log('Loading by numeric ID:', idOrCode);
      this.staffService.getById(idOrCode).subscribe({
        next: (staff) => {
          console.log('Staff data received:', staff);
          this.errorMessage = null; // Clear any previous errors
          this.patchFromStaff(staff);
        },
        error: (err) => {
          console.error('Error loading doctor by ID', err);
          // Try to find by searching all staff if direct getById fails
          if (err.status === 404 || err.status === 400) {
            console.log('Doctor not found by ID, trying to search all staff...');
            this.staffService.getAll().subscribe({
              next: (allStaff) => {
                const foundStaff = allStaff.find(s => 
                  s.id?.toString() === idOrCode ||
                  s.staffCode === idOrCode ||
                  s.doctorCode === idOrCode ||
                  String(s.id) === idOrCode
                );
                if (foundStaff) {
                  console.log('Found doctor in staff list:', foundStaff);
                  this.patchFromStaff(foundStaff);
                } else {
                  this.errorMessage = `Doctor with ID/Code "${idOrCode}" not found. Please check the ID and try again.`;
                }
              },
              error: (searchErr) => {
                console.error('Error searching for doctor:', searchErr);
                this.errorMessage = `Unable to load doctor details. Error: ${err.error?.message || err.message || 'Unknown error'}`;
              }
            });
          } else {
            this.errorMessage = `Unable to load doctor details. Error: ${err.error?.message || err.message || 'Unknown error'}`;
          }
        }
      });
    } else {
      // It's likely a doctorCode (e.g., "D-001"), try doctor service first
      console.log('Loading by doctorCode:', idOrCode);
      this.doctorService.getById(idOrCode).subscribe({
        next: (doctor) => {
          console.log('Doctor data received:', doctor);
          this.errorMessage = null; // Clear any previous errors
          // Handle specializations - convert from SpecializationDto[] to number[] if needed
          let specializationIds: number[] = [];
          if (doctor.specializations) {
            if (Array.isArray(doctor.specializations)) {
              specializationIds = doctor.specializations.map((spec: any) => 
                typeof spec === 'number' ? spec : (spec.specializationId || spec.id || spec)
              ).filter((id: any) => id != null);
            }
          }
          
          // Convert doctor to staff format for patching
          const staff: any = {
            id: doctor.id,
            staffCode: doctor.staffCode,
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            emailAddress: doctor.emailAddress || doctor.email,
            phoneNumber: doctor.phoneNumber || doctor.phone,
            email: doctor.email || doctor.emailAddress,
            phone: doctor.phone || doctor.phoneNumber,
            gender: doctor.gender,
            dateOfBirth: doctor.dateOfBirth,
            addressLine1: doctor.addressLine1,
            addressLine2: doctor.addressLine2,
            city: doctor.city,
            state: doctor.state,
            country: doctor.country,
            zipCode: doctor.zipCode,
            photoUrl: doctor.photoUrl,
            roles: doctor.roles || [],
            designation: doctor.designation,
            department: doctor.department,
            status: doctor.status || 'ACTIVE',
            hireDate: doctor.hireDate,
            employmentType: doctor.employmentType || 'FULL_TIME',
            departmentId: doctor.departmentId,
            designationId: doctor.designationId || doctor.jobId,
            isDoctor: true,
            doctorCode: doctor.doctorCode,
            specializations: specializationIds,
            licenseNumber: doctor.licenseNumber,
            licenseCouncil: doctor.licenseCouncil,
            licenseExpiry: doctor.licenseExpiry,
            // Doctor-specific fields
            yearsOfExperience: doctor.yearsOfExperience,
            consultationType: (doctor as any).consultationType,
            about: doctor.bio || (doctor as any).about,
            educations: (doctor as any).educations,
            certifications: (doctor as any).certifications
          };
          this.patchFromStaff(staff as Staff);
        },
        error: (err) => {
          console.error('Error loading doctor by doctorCode, trying to find by searching all staff', err);
          // Fallback: search all staff to find by doctorCode
          this.staffService.getAll().subscribe({
            next: (allStaff) => {
              const doctorStaff = allStaff.find(s => 
                s.doctorCode === idOrCode || 
                s.id?.toString() === idOrCode ||
                s.staffCode === idOrCode
              );
              if (doctorStaff) {
                console.log('Found doctor in staff list:', doctorStaff);
                this.errorMessage = null; // Clear any previous errors
                this.patchFromStaff(doctorStaff);
              } else {
                console.error('Doctor not found with ID/Code:', idOrCode);
                this.errorMessage = `Doctor with ID/Code "${idOrCode}" not found. Please check the ID and try again.`;
              }
            },
            error: (searchErr) => {
              console.error('Error searching for doctor', searchErr);
              this.errorMessage = `Unable to load doctor details. Error: ${searchErr.error?.message || searchErr.message || 'Unknown error'}`;
            }
          });
        }
      });
    }
  }

  onDepartmentAdded(department: Department) {
    // Reload departments and auto-select the new one
    this.masterDataService.getDepartments().subscribe({
      next: (masterDepts: MasterDepartment[]) => {
        this.departments = masterDepts.map(dept => ({
          id: dept.id,
          departmentId: Number(dept.id) || undefined,
          name: dept.name,
          code: dept.code,
          description: dept.description,
          active: dept.active,
          status: dept.active ? 'ACTIVE' : 'INACTIVE',
          specialtyGroup: dept.specialtyGroup
        }));
        // Add the newly created department if not already in list
        const deptId = department.departmentId || department.id;
        if (deptId && !this.departments.find(d => (d.departmentId || d.id) === deptId)) {
          this.departments.push(department);
        }
        if (deptId) {
          const numId = typeof deptId === 'string' ? Number(deptId) : deptId;
          if (!isNaN(numId)) {
            this.form.patchValue({ departmentId: numId });
          }
        }
      },
      error: (err) => {
        console.error('Error reloading departments', err);
        // Add the new department anyway
        if (department && !this.departments.find(d => (d.departmentId || d.id) === (department.departmentId || department.id))) {
          this.departments.push(department);
        }
      }
    });
  }

  onDesignationAdded(designation: Designation) {
    // Reload designations and auto-select the new one
    this.masterDataService.getDesignations().subscribe({
      next: (masterDes: MasterDesignation[]) => {
        const mapped = masterDes.map(des => ({
          id: Number(des.id) || undefined,
          designationId: Number(des.id) || undefined,
          title: des.name,
          code: des.code,
          description: des.description,
          status: des.active ? 'ACTIVE' : 'INACTIVE',
          active: des.active
        }));
        // Remove duplicates by id
        this.designations = Array.from(
          new Map(mapped.map(des => [des.id, des])).values()
        );
        // Update filtered designations based on current department
        this.updateFilteredDesignations();
        const designationId = designation.designationId || designation.id;
        if (designationId) {
          this.form.patchValue({ designationId: designationId });
        }
      },
      error: (err) => console.error('Error reloading designations', err)
    });
  }

  onDepartmentChange(deptId: number | null) {
    console.log('Department changed to:', deptId);
    if (!deptId) {
      this.filteredDesignations = [];
      this.form.patchValue({ designationId: null });
      return;
    }

    // Convert deptId to number for comparison
    const deptIdNum = Number(deptId);

    // Filter designations by selected department and active status
    // Include designations that match the department OR have no department (undefined)
    this.filteredDesignations = this.designations.filter(d => {
      const desDeptId = d.departmentId ? Number(d.departmentId) : undefined;
      const matchesDepartment = desDeptId === deptIdNum || desDeptId === undefined || desDeptId === null;
      const isActive = d.status === 'ACTIVE' || !d.status || d.status === 'Active' || d.status === undefined;
      return matchesDepartment && isActive;
    });

    console.log('Filtered designations:', this.filteredDesignations.length);
    console.log('All designations:', this.designations.length);
    console.log('Selected department ID:', deptIdNum);
    console.log('Filtered designation titles:', this.filteredDesignations.map(d => d.title));
    
    // Clear designation selection when department changes
    this.form.patchValue({ designationId: null });
  }

  updateFilteredDesignations() {
    const deptId = this.form.get('departmentId')?.value;
    if (deptId) {
      this.onDepartmentChange(deptId);
    } else {
      this.filteredDesignations = [];
    }
  }

  patchFromStaff(staff: Staff) {
    try {
      console.log('Loading staff data for edit:', staff);
      
      // Store the numeric staffId for updates (not the route parameter which might be doctorCode)
      this.staffIdForUpdate = staff.id || null;
      console.log('Stored staffId for update:', this.staffIdForUpdate);
      
      // Handle both emailAddress/email and phoneNumber/phone property names
      const email = staff.emailAddress || staff.email || '';
      const phone = staff.phoneNumber || staff.phone || '';
      
      // Get department ID - check both departmentId and department object
      const deptIdRaw = staff.departmentId || staff.department?.departmentId || staff.department?.id || null;
      const departmentId = deptIdRaw !== null ? (typeof deptIdRaw === 'string' ? Number(deptIdRaw) : deptIdRaw) : null;
      
      // Get designation ID - check designationId, jobId, and designation object
      const designationId = staff.designationId || staff.jobId || staff.designation?.designationId || staff.designation?.id || null;
      
      // Get specialization IDs - handle both array of IDs and array of objects
      let specializationIds: number[] = [];
      if (staff.specializations) {
        if (Array.isArray(staff.specializations)) {
          specializationIds = staff.specializations.map((spec: any) => 
            typeof spec === 'number' ? spec : (spec.specializationId || spec.id || spec)
          ).filter((id: any) => id != null);
        }
      }
      
      // Load education and certifications from staff data
      if ((staff as any).educations && Array.isArray((staff as any).educations)) {
        this.educations = (staff as any).educations.map((edu: any) => ({
          institution: edu.institution || '',
          degree: edu.degree || '',
          startDate: edu.startDate || '',
          endDate: edu.endDate || ''
        }));
        // Ensure at least one empty education entry
        if (this.educations.length === 0) {
          this.educations = [{ institution: '', degree: '', startDate: '', endDate: '' }];
        }
      }
      
      if ((staff as any).certifications && Array.isArray((staff as any).certifications)) {
        this.certifications = (staff as any).certifications.map((cert: any) => ({
          name: cert.name || '',
          issuingOrganization: cert.issuingOrganization || '',
          issueDate: cert.issueDate || '',
          expiryDate: cert.expiryDate || ''
        }));
        // Ensure at least one empty certification entry
        if (this.certifications.length === 0) {
          this.certifications = [{ name: '', issuingOrganization: '', issueDate: '', expiryDate: '' }];
        }
      }
      
      console.log('Mapped values:', { departmentId, designationId, specializationIds, educations: this.educations.length, certifications: this.certifications.length });
      
      this.form.patchValue({
        firstName: staff.firstName || '',
        lastName: staff.lastName || '',
        emailAddress: email,
        phoneNumber: phone,
        gender: staff.gender || '',
        dateOfBirth: staff.dateOfBirth || '',
        departmentId: departmentId,
        designationId: designationId,
        licenseNumber: staff.licenseNumber ?? '',
        licenseCouncil: staff.licenseCouncil ?? '',
        licenseExpiry: staff.licenseExpiry ?? '',
        specializationIds: specializationIds,
        photoUrl: staff.photoUrl ?? '',
        yearsOfExperience: (staff as any).yearsOfExperience ?? null,
        consultationType: (staff as any).consultationType ?? '',
        about: (staff as any).about ?? ''
      });
      
      // Update filtered designations based on loaded department
      if (departmentId) {
        this.updateFilteredDesignations();
        // Re-apply designation after filtering
        if (designationId) {
          setTimeout(() => {
            this.form.patchValue({ designationId: designationId });
          }, 100);
        }
      }
      
      // Update form validity after patching
      this.form.updateValueAndValidity();
      
      // Mark form controls as touched after patching to show validation state
      setTimeout(() => {
        this.form.get('firstName')?.markAsTouched();
        this.form.get('lastName')?.markAsTouched();
        this.form.get('emailAddress')?.markAsTouched();
        this.form.get('phoneNumber')?.markAsTouched();
        this.form.get('departmentId')?.markAsTouched();
      }, 0);
      
      // Handle photo URL - could be base64 string or URL
      if (staff.photoUrl) {
        // Check if it's already a data URL (base64) or a regular URL
        if (staff.photoUrl.startsWith('data:image') || staff.photoUrl.startsWith('http://') || staff.photoUrl.startsWith('https://')) {
          this.profileImagePreview = staff.photoUrl;
        } else {
          // Assume it's base64 without prefix, add data URL prefix
          this.profileImagePreview = `data:image/jpeg;base64,${staff.photoUrl}`;
        }
        console.log('Profile image preview set:', this.profileImagePreview ? 'Image loaded' : 'No image');
      } else {
        this.profileImagePreview = null;
        console.log('No photo URL in staff data');
      }
      
      // Clear any error messages after patching form with data
      this.errorMessage = null;
      this.successMessage = null;
      
      console.log('Form patched successfully. Form value:', this.form.value);
    } catch (error) {
      console.error('Error patching form from staff:', error);
      this.errorMessage = 'Error loading doctor details. Please refresh the page.';
    }
  }


  // Step navigation
  nextStep() {
    if (this.currentStep < this.totalSteps) {
      // Validate current step before proceeding
      if (this.currentStep === 1) {
        // Update form validity first
        this.form.updateValueAndValidity();
        
        // Get form control values - try multiple ways to get the value
        const firstNameCtrl = this.form.get('firstName');
        const lastNameCtrl = this.form.get('lastName');
        const emailCtrl = this.form.get('emailAddress');
        const phoneCtrl = this.form.get('phoneNumber');
        
        // Get values from form controls or form value object
        const formValue = this.form.value;
        const firstName = (firstNameCtrl?.value ?? formValue?.firstName ?? '').toString().trim();
        const lastName = (lastNameCtrl?.value ?? formValue?.lastName ?? '').toString().trim();
        const email = (emailCtrl?.value ?? formValue?.emailAddress ?? '').toString().trim();
        const phone = (phoneCtrl?.value ?? formValue?.phoneNumber ?? '').toString().trim();
        
        // Debug logging
        console.log('Form validation - Step 1:', {
          firstName,
          lastName,
          email,
          phone,
          firstNameCtrlValue: firstNameCtrl?.value,
          lastNameCtrlValue: lastNameCtrl?.value,
          emailCtrlValue: emailCtrl?.value,
          phoneCtrlValue: phoneCtrl?.value,
          formValue: formValue
        });
        
        // Mark all fields as touched to show validation errors
        firstNameCtrl?.markAsTouched();
        lastNameCtrl?.markAsTouched();
        emailCtrl?.markAsTouched();
        phoneCtrl?.markAsTouched();
        
        // Check if fields are actually filled - be more lenient with whitespace
        const missingFields: string[] = [];
        if (!firstName || firstName.length === 0) {
          missingFields.push('First Name');
        }
        if (!lastName || lastName.length === 0) {
          missingFields.push('Last Name');
        }
        if (!email || email.length === 0) {
          missingFields.push('Email');
        }
        if (!phone || phone.length === 0) {
          missingFields.push('Phone');
        }
        
        if (missingFields.length > 0) {
          console.log('Missing fields:', missingFields);
          this.errorMessage = `Please fill in all required fields: ${missingFields.join(', ')}`;
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        
        // Check email format specifically
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
          this.errorMessage = 'Please enter a valid email address';
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        
        // Also check if form control has email error
        if (emailCtrl?.hasError('email')) {
          this.errorMessage = 'Please enter a valid email address';
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        
        // All validations passed
        console.log('Step 1 validation passed');
        this.errorMessage = null;
        this.successMessage = null;
      }
      
      // Step 2 validation - check department and specialization
      if (this.currentStep === 2) {
        const departmentId = this.form.get('departmentId')?.value;
        const specializationIds = this.form.get('specializationIds')?.value || [];
        
        if (!departmentId) {
          this.errorMessage = 'Please select a department.';
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        
        if (!specializationIds || specializationIds.length === 0) {
          this.errorMessage = 'Please select at least one specialization.';
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        
        this.errorMessage = null;
        this.successMessage = null;
      }
      
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Profile image
  triggerFileInput() {
    this.fileInputRef?.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.errorMessage = 'Image size must be less than 2MB. Please compress the image and try again.';
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64String = e.target.result;
        this.profileImagePreview = base64String;
        // Store base64 for preview and submission (backend now supports TEXT column)
        this.form.patchValue({ photoUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  }

  // Specializations
  getSpecializationId(spec: any): number {
    return spec.id || spec.specializationId || 0;
  }

  toggleSpecialization(specializationId: number, event: Event) {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;
    const currentIds = this.form.value.specializationIds || [];
    
    if (checked) {
      if (!currentIds.includes(specializationId)) {
        this.form.controls.specializationIds.setValue([...currentIds, specializationId]);
      }
    } else {
      this.form.controls.specializationIds.setValue(currentIds.filter(id => id !== specializationId));
    }
  }

  // Education
  addEducation() {
    this.educations.push({ institution: '', degree: '', startDate: '', endDate: '' });
  }

  removeEducation(index: number) {
    this.educations.splice(index, 1);
  }

  // Certifications
  addCertification() {
    this.certifications.push({ name: '', issuingOrganization: '', issueDate: '', expiryDate: '' });
  }

  removeCertification(index: number) {
    this.certifications.splice(index, 1);
  }

  // Working days
  toggleWorkingDay(day: string, event: Event) {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;
    if (checked) {
      if (!this.selectedWorkingDays.includes(day)) {
        this.selectedWorkingDays.push(day);
      }
    } else {
      this.selectedWorkingDays = this.selectedWorkingDays.filter(d => d !== day);
    }
  }

  // Save
  save() {
    // Get form controls
    const firstNameCtrl = this.form.get('firstName');
    const lastNameCtrl = this.form.get('lastName');
    const emailCtrl = this.form.get('emailAddress');
    const phoneCtrl = this.form.get('phoneNumber');
    
    // Get actual values - handle null, undefined, and empty strings
    const firstName = firstNameCtrl?.value ? String(firstNameCtrl.value).trim() : '';
    const lastName = lastNameCtrl?.value ? String(lastNameCtrl.value).trim() : '';
    const emailAddress = emailCtrl?.value ? String(emailCtrl.value).trim() : '';
    const phoneNumber = phoneCtrl?.value ? String(phoneCtrl.value).trim() : '';
    
    // Debug logging
    console.log('Form save validation:', {
      firstName,
      lastName,
      emailAddress,
      phoneNumber,
      firstNameCtrlValue: firstNameCtrl?.value,
      lastNameCtrlValue: lastNameCtrl?.value,
      emailCtrlValue: emailCtrl?.value,
      phoneCtrlValue: phoneCtrl?.value,
      formValue: this.form.value
    });
    
    // Mark all required fields as touched to show validation errors
    firstNameCtrl?.markAsTouched();
    lastNameCtrl?.markAsTouched();
    emailCtrl?.markAsTouched();
    phoneCtrl?.markAsTouched();
    
    // Check if fields are actually filled
    const missingFields: string[] = [];
    if (!firstName || firstName.length === 0) {
      missingFields.push('First Name');
    }
    if (!lastName || lastName.length === 0) {
      missingFields.push('Last Name');
    }
    if (!emailAddress || emailAddress.length === 0) {
      missingFields.push('Email');
    }
    if (!phoneNumber || phoneNumber.length === 0) {
      missingFields.push('Phone');
    }
    
    if (missingFields.length > 0) {
      console.log('Missing fields on save:', missingFields);
      this.errorMessage = `Please fill in all required fields: ${missingFields.join(', ')}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Check email format specifically
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailAddress && !emailRegex.test(emailAddress)) {
      this.errorMessage = 'Please enter a valid email address';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Also check if form control has email error
    if (emailCtrl?.hasError('email')) {
      this.errorMessage = 'Please enter a valid email address';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Only reset retry count if this is a fresh save attempt (not a retry)
    // We check if we're already saving to determine if this is a retry
    if (!this.isSaving) {
      this.retryCount = 0; // Reset for new save attempt
      this.showRetryButton = false; // Hide retry button on new attempt
    }
    
    this.isSaving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const v = this.form.value;

    // Build payload matching backend StaffDto structure
    // Backend expects: firstName, lastName, email, phoneNumber, jobId (for designation)
    // NOTE: Do NOT include doctorCode - it's auto-generated by the backend
    const payload: any = {
      firstName: firstName,
      lastName: lastName,
      email: emailAddress, // Backend uses 'email' not 'emailAddress'
      phoneNumber: phoneNumber,
      gender: v.gender || undefined,
      dateOfBirth: v.dateOfBirth || undefined,
      departmentId: v.departmentId || undefined,
      jobId: v.designationId || undefined, // Backend uses jobId for designation
      employmentType: 'FULL_TIME', // Default employment type
      status: 'ACTIVE',
      photoUrl: v.photoUrl || undefined,
      isDoctor: true, // This form is for doctors, nurses, pharmacists - all are staff with isDoctor flag
      specializations: v.specializationIds || [],
      licenseNumber: v.licenseNumber || undefined,
      licenseCouncil: v.licenseCouncil || undefined,
      licenseExpiry: v.licenseExpiry || undefined,
      yearsOfExperience: v.yearsOfExperience || undefined,
      consultationType: v.consultationType || undefined,
      about: v.about || undefined,
      educations: this.educations.filter(edu => edu.institution || edu.degree), // Only include non-empty entries
      certifications: this.certifications.filter(cert => cert.name || cert.issuingOrganization) // Only include non-empty entries
    };
    
    // Explicitly ensure doctorCode is NOT sent (backend will generate it)
    delete payload.doctorCode;

    // For new doctors, always use create. For editing, use update
    console.log('Saving doctor - isEditMode:', this.isEditMode, 'doctorIdFromRoute:', this.doctorIdFromRoute);
    console.log('Payload:', payload);
    
    if (this.isEditMode && this.staffIdForUpdate) {
      console.log('Using UPDATE (PUT) for staff ID:', this.staffIdForUpdate);
      // Update existing doctor using numeric staffId
      this.staffService.update(String(this.staffIdForUpdate), payload).subscribe({
        next: (saved) => {
          this.isSaving = false;
          this.successMessage = 'Doctor updated successfully';
          setTimeout(() => {
            this.router.navigate(['/admin/doctors']);
          }, 1000);
        },
        error: (err) => {
          console.error('Error updating doctor', err);
          this.isSaving = false;
          if (err.error?.message) {
            this.errorMessage = `Failed to update doctor: ${err.error.message}`;
          } else if (err.error?.error) {
            this.errorMessage = `Failed to update doctor: ${err.error.error}`;
          } else {
            this.errorMessage = 'Unable to update doctor. Please try again.';
          }
        }
      });
    } else {
      // Create new doctor
      console.log('Using CREATE (POST) for new doctor');
      console.log('Payload being sent:', JSON.stringify(payload, null, 2));
      this.staffService.create(payload).subscribe({
        next: (saved) => {
          console.log('Doctor created successfully:', saved);
          this.isSaving = false;
          this.retryCount = 0; // Reset retry count on success
          this.showRetryButton = false;
          this.errorMessage = null; // Clear any error messages
          this.successMessage = 'Doctor created successfully';
          setTimeout(() => {
            this.router.navigate(['/admin/doctors']);
          }, 1000);
        },
        error: (err) => {
          console.error('Error creating doctor', err);
          console.error('Error details:', {
            status: err.status,
            statusText: err.statusText,
            error: err.error,
            message: err.message,
            url: err.url
          });
          
          // Check for duplicate code error specifically
          // 409 Conflict status usually indicates duplicate/resource conflict
          const errorMessage = err.error?.message || err.error?.error || err.message || '';
          const errorString = JSON.stringify(err.error || {}).toLowerCase();
          const isConflictStatus = err.status === 409;
          
          // Check if it's a code-related conflict
          const isDuplicateCodeError = isConflictStatus && (
                                      errorMessage.toLowerCase().includes('code already exists') || 
                                      errorMessage.toLowerCase().includes('duplicate key') ||
                                      errorMessage.toLowerCase().includes('unique constraint') ||
                                      errorMessage.toLowerCase().includes('code conflict') ||
                                      errorMessage.toLowerCase().includes('already exists') ||
                                      errorString.includes('code') ||
                                      errorString.includes('duplicate')
          );
          
          // If 409 but not code-related, still retry (could be other conflicts)
          const shouldRetry = isConflictStatus && this.retryCount < this.maxRetries;
          
          if (shouldRetry) {
            // This is a backend code generation issue - auto-retry with exponential backoff
            this.retryCount++;
            this.errorMessage = `Code conflict detected. Retrying automatically... (${this.retryCount}/${this.maxRetries})`;
            this.isSaving = true; // Keep saving state during retry
            
            // Exponential backoff with jitter: 2s, 3s, 5s, 8s, 12s
            const baseDelay = [2000, 3000, 5000, 8000, 12000][Math.min(this.retryCount - 1, 4)];
            const jitter = Math.random() * 1000; // Add 0-1s random jitter
            const delay = baseDelay + jitter;
            
            console.log(`Retrying doctor creation after duplicate code error (attempt ${this.retryCount}/${this.maxRetries}) in ${Math.round(delay)}ms...`);
            
            setTimeout(() => {
              if (!this.isSaving) {
                // If saving state was cleared, don't retry
                console.log('Retry cancelled - isSaving is false');
                return;
              }
              console.log(`Executing retry attempt ${this.retryCount}...`);
              // Reset isSaving to false before calling save() so save() can set it to true
              // This ensures the retry logic works correctly
              this.isSaving = false;
              this.save(); // Retry the save operation
            }, delay);
            return; // Exit early to prevent showing final error message
          } else if (isDuplicateCodeError) {
            // Max retries reached
            this.isSaving = false;
            this.errorMessage = 'Code conflict: Multiple retry attempts failed. Please click Retry to try again - the system will generate a new unique code.';
            this.retryCount = 0; // Reset for next attempt
            this.showRetryButton = true; // Show manual retry option
          } else {
            this.isSaving = false;
            this.showRetryButton = false;
            
            // For 409 conflicts that aren't code-related, show retry button
            if (err.status === 409 && !isDuplicateCodeError) {
              this.errorMessage = 'A conflict occurred while creating the doctor. Please try again.';
              this.showRetryButton = true;
              this.retryCount = 0; // Reset for manual retry
            } else if (err.error?.message) {
              this.errorMessage = `Failed to create doctor: ${err.error.message}`;
            } else if (err.error?.error) {
              this.errorMessage = `Failed to create doctor: ${err.error.error}`;
            } else if (err.status === 409) {
              this.errorMessage = 'A doctor with this information already exists. Please check for duplicates.';
            } else if (err.status === 400) {
              this.errorMessage = 'Invalid data provided. Please check all fields and try again.';
            } else if (err.status === 500) {
              this.errorMessage = 'Server error occurred. Please try again later.';
            } else {
              this.errorMessage = `Unable to create doctor (Status: ${err.status || 'Unknown'}). Please check all required fields and try again.`;
            }
          }
          
          // Scroll to top to show error
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/admin/doctors']);
  }
}
