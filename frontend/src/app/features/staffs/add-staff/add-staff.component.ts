import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { switchMap, map } from 'rxjs';
import { StaffService } from '../../../core/services/staff.service';
import { Staff } from '../../../core/models/staff.model';

@Component({
  selector: 'app-add-staff',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-staff.component.html',
  styleUrls: ['./add-staff.component.css']
})
export class AddStaffComponent {
  private fb = inject(FormBuilder);
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  profileImagePreview: string | null = null;
  selectedFile: File | null = null;
  isEditMode = false;

  departments = ['Admin Officer', 'Front Office', 'Medical Recorder', 'Billing Executive', 'Nurse Specialist'];
  roles = ['Admin', 'Reception', 'Nurse', 'Nurse Practitioner'];
  designations = ['Admin Officer', 'Front Office Executive', 'Medical Records Executive', 'Billing Executive', 'Staff Nurse'];
  statuses = ['Active', 'On Leave', 'Onboarding', 'Inactive'];
  countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'Australia'];
  statesByCountry: { [key: string]: string[] } = {
    'United States': ['California', 'Texas', 'New York', 'Florida', 'Illinois'],
    'Canada': ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba'],
    'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
    'Germany': ['Bavaria', 'Berlin', 'Hamburg', 'North Rhine-Westphalia'],
    'Australia': ['New South Wales', 'Victoria', 'Queensland', 'Western Australia']
  };
  citiesByState: { [key: string]: string[] } = {
    'California': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento'],
    'Texas': ['Houston', 'Dallas', 'Austin', 'San Antonio'],
    'New York': ['New York City', 'Buffalo', 'Rochester', 'Albany'],
    'Florida': ['Miami', 'Tampa', 'Orlando', 'Jacksonville'],
    'Illinois': ['Chicago', 'Aurora', 'Naperville', 'Rockford'],
    'Ontario': ['Toronto', 'Ottawa', 'Hamilton', 'London'],
    'Quebec': ['Montreal', 'Quebec City', 'Laval', 'Gatineau'],
    'British Columbia': ['Vancouver', 'Victoria', 'Surrey', 'Burnaby'],
    'Alberta': ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge'],
    'Manitoba': ['Winnipeg', 'Brandon', 'Steinbach', 'Thompson'],
    'England': ['London', 'Manchester', 'Birmingham', 'Liverpool'],
    'Scotland': ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee'],
    'Wales': ['Cardiff', 'Swansea', 'Newport', 'Wrexham'],
    'Northern Ireland': ['Belfast', 'Derry', 'Lisburn', 'Newry'],
    'Bavaria': ['Munich', 'Nuremberg', 'Augsburg', 'Regensburg'],
    'Berlin': ['Berlin'],
    'Hamburg': ['Hamburg'],
    'North Rhine-Westphalia': ['Cologne', 'Düsseldorf', 'Dortmund', 'Essen'],
    'New South Wales': ['Sydney', 'Newcastle', 'Wollongong', 'Albury'],
    'Victoria': ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo'],
    'Queensland': ['Brisbane', 'Gold Coast', 'Cairns', 'Townsville'],
    'Western Australia': ['Perth', 'Fremantle', 'Bunbury', 'Geraldton']
  };
  availableStates: string[] = [];
  availableCities: string[] = [];
  bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  staffForm = this.fb.group({
    person: this.fb.group({
      prefix: [''],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      pronoun: [''],
      phoneNumber: ['', Validators.required],
      emailAddress: ['', [Validators.required, Validators.email]],
      alternateEmail: [''],
      alternatePhoneNumber: [''],
      faxNumber: [''],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      bloodGroup: ['', Validators.required],
      nationalId: [''],
      nationality: [''],
      civilStatus: [''],
      ethnicity: [''],
      languagesSpoken: [[]],
      preferredLanguage: [''],
      addressLine1: [''],
      addressLine2: [''],
      country: ['United States'],
      state: ['California'],
      city: [''],
      zipCode: [''],
      photoUrl: ['']
    }),
    staff: this.fb.group({
      hireDate: ['', Validators.required],
      terminationDate: [''],
      employmentStatus: ['Active', Validators.required],
      department: ['Admin Officer', Validators.required],
      role: ['Admin', Validators.required],
      designation: ['Admin Officer', Validators.required],
      supervisorId: ['']
    })
  });

  isSaving = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private staffService: StaffService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Initialize states and cities based on default country
    this.updateStates();
    
    // Watch for country changes
    this.staffForm.get('person.country')?.valueChanges.subscribe(country => {
      this.updateStates();
      this.staffForm.get('person.state')?.setValue('');
      this.staffForm.get('person.city')?.setValue('');
    });

    // Watch for state changes
    this.staffForm.get('person.state')?.valueChanges.subscribe(state => {
      this.updateCities();
      this.staffForm.get('person.city')?.setValue('');
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.loadStaffData(params['id']);
      }
    });
  }

  updateStates() {
    const country = this.staffForm.get('person.country')?.value || 'United States';
    this.availableStates = this.statesByCountry[country] || [];
  }

  updateCities() {
    const state = this.staffForm.get('person.state')?.value || '';
    this.availableCities = this.citiesByState[state] || [];
  }

  triggerFileInput() {
    this.fileInputRef.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.errorMessage = 'Image size exceeds 5MB limit. Please choose a smaller image.';
        input.value = '';
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select a valid image file.';
        input.value = '';
        return;
      }
      
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImagePreview = e.target.result;
        const photoUrlControl = this.staffForm.get('person.photoUrl');
        if (photoUrlControl) {
          photoUrlControl.setValue(e.target.result);
          photoUrlControl.markAsDirty();
        }
        this.successMessage = 'Image selected successfully. It will be saved when you submit the form.';
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      };
      reader.onerror = () => {
        this.errorMessage = 'Error reading image file. Please try again.';
        input.value = '';
        this.selectedFile = null;
        this.profileImagePreview = null;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  removeImage() {
    this.profileImagePreview = null;
    this.selectedFile = null;
    const photoUrlControl = this.staffForm.get('person.photoUrl');
    if (photoUrlControl) {
      photoUrlControl.setValue('');
      photoUrlControl.markAsDirty();
    }
    // Clear file input
    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  loadStaffData(id: string) {
    this.staffService.getById(id).subscribe({
      next: (staff) => {
        // Staff now contains all person fields directly
        // Patch person form group with all available data
        const personForm = this.staffForm.get('person') as FormGroup;
        if (personForm) {
          personForm.patchValue({
            firstName: staff.firstName || '',
            lastName: staff.lastName || '',
            phoneNumber: staff.phoneNumber || staff.phone || '',
            emailAddress: staff.emailAddress || staff.email || '',
            dateOfBirth: staff.dateOfBirth || '',
            gender: staff.gender || '',
            pronoun: staff.pronoun || '',
            ethnicity: staff.ethnicity || '',
            addressLine1: staff.addressLine1 || '',
            addressLine2: staff.addressLine2 || '',
            country: staff.country || 'United States',
            state: staff.state || '',
            city: staff.city || '',
            zipCode: staff.zipCode || '',
            photoUrl: staff.photoUrl || ''
          }, { emitEvent: false });
        }
        
        // Set image preview if photoUrl exists
        if (staff.photoUrl) {
          this.profileImagePreview = staff.photoUrl;
        }
        
        // Patch staff form group
        const staffFormGroup = this.staffForm.get('staff') as FormGroup;
        if (staffFormGroup) {
          const departmentName = staff.department?.name || '';
          const designationTitle = staff.designation?.title || '';
          
          staffFormGroup.patchValue({
            hireDate: staff.hireDate || '',
            employmentStatus: staff.employmentStatus || 'Active',
            department: departmentName,
            designation: designationTitle,
            role: staff.roles && staff.roles.length > 0 ? staff.roles[0].name || '' : ''
          }, { emitEvent: false });
        }
        
        // Update states and cities after patching
        this.updateStates();
        // Set state value if it exists
        if (staff.state) {
          const stateControl = personForm?.get('state');
          if (stateControl) {
            stateControl.setValue(staff.state, { emitEvent: false });
          }
        }
        this.updateCities();
        // Set city value if it exists
        if (staff.city) {
          const cityControl = personForm?.get('city');
          if (cityControl) {
            cityControl.setValue(staff.city, { emitEvent: false });
          }
        }
      },
      error: (err) => {
        console.error('Error loading staff:', err);
        this.errorMessage = 'Failed to load staff data. Please try again.';
      }
    });
  }

  submitForm() {
    this.successMessage = null;
    this.errorMessage = null;

    // Mark all fields as touched to show validation errors
    if (this.staffForm.invalid) {
      this.staffForm.markAllAsTouched();
      
      // Check which form group has errors
      const personForm = this.staffForm.get('person');
      const staffForm = this.staffForm.get('staff');
      
      if (personForm?.invalid && personForm instanceof FormGroup) {
        Object.keys(personForm.controls).forEach(key => {
          personForm.get(key)?.markAsTouched();
        });
      }
      
      if (staffForm?.invalid && staffForm instanceof FormGroup) {
        Object.keys(staffForm.controls).forEach(key => {
          staffForm.get(key)?.markAsTouched();
        });
      }
      
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    if (this.isSaving) {
      return;
    }

    const personFormValue = this.staffForm.value.person;
    const staffGroup = this.staffForm.value.staff!;

    // Validate required fields
    if (!personFormValue?.firstName || !personFormValue?.lastName || !personFormValue?.phoneNumber || 
        !personFormValue?.emailAddress || !personFormValue?.dateOfBirth || !personFormValue?.gender || 
        !personFormValue?.bloodGroup) {
      this.errorMessage = 'Please fill in all required personal information fields.';
      this.staffForm.markAllAsTouched();
      return;
    }

    if (!staffGroup.hireDate || !staffGroup.role || !staffGroup.designation) {
      this.errorMessage = 'Please fill in all required employment fields.';
      this.staffForm.markAllAsTouched();
      return;
    }

    // Ensure photoUrl is included - prioritize profileImagePreview if form value is empty
    const photoUrlToSave = personFormValue?.photoUrl || this.profileImagePreview || '';

    // Build complete staff payload with all fields including image
    // Only include fields that exist in StaffDto model
    const staffPayload: Staff = {
      // Personal Information
      firstName: personFormValue?.firstName || '',
      lastName: personFormValue?.lastName || '',
      gender: personFormValue?.gender || '',
      pronoun: personFormValue?.pronoun || '',
      dateOfBirth: personFormValue?.dateOfBirth || '',
      ethnicity: personFormValue?.ethnicity || '',
      
      // Contact Information
      emailAddress: personFormValue?.emailAddress || '',
      email: personFormValue?.emailAddress || '',
      phoneNumber: personFormValue?.phoneNumber || '',
      phone: personFormValue?.phoneNumber || '',
      
      // Address Information
      addressLine1: personFormValue?.addressLine1 || '',
      addressLine2: personFormValue?.addressLine2 || '',
      city: personFormValue?.city || '',
      state: personFormValue?.state || '',
      country: personFormValue?.country || 'United States',
      zipCode: personFormValue?.zipCode || '',
      
      // Image Storage
      photoUrl: photoUrlToSave,
      
      // Employment Information
      hireDate: staffGroup.hireDate || '',
      employmentStatus: staffGroup.employmentStatus || 'Active',
      // Note: department and designation are stored as IDs in the backend
      // The form uses names, but we need to convert them to IDs when saving
      // For now, we'll use the departmentId and designationId if available
      departmentId: undefined, // Will be set based on department name lookup
      designationId: undefined // Will be set based on designation name lookup
    };

    // Log photoUrl status for debugging
    if (photoUrlToSave) {
      console.log('Photo URL will be saved to database');
      console.log('Photo URL length:', photoUrlToSave.length, 'characters');
      console.log('Photo URL preview (first 100 chars):', photoUrlToSave.substring(0, 100));
    } else {
      console.log('No photo URL to save');
    }

    console.log('Submitting staff payload:', staffPayload);

    this.isSaving = true;

    if (this.isEditMode) {
      // Handle update logic
      const staffId = this.route.snapshot.paramMap.get('id')!;
      this.staffService.update(staffId, staffPayload).subscribe({
        next: () => {
          this.isSaving = false;
          this.successMessage = 'Staff profile updated successfully.';
          setTimeout(() => {
            this.router.navigate(['/staff']);
          }, 2000);
        },
        error: (err) => {
          console.error('Failed to update staff', err);
          this.isSaving = false;
          this.errorMessage = err?.error?.message || 'Unable to update staff. Please try again.';
        }
      });
    } else {
      // Handle create logic
      this.staffService.create(staffPayload).subscribe({
        next: (staff) => {
          this.isSaving = false;
          this.successMessage = 'Staff profile added successfully.';
          
          // Reset form after a short delay
          setTimeout(() => {
            this.staffForm.reset({
              person: {
                country: 'United States',
                state: 'California'
              },
              staff: {
                employmentStatus: 'Active',
                department: 'Admin Officer',
                role: 'Admin',
                designation: 'Admin Officer'
              }
            });
            this.profileImagePreview = null;
            this.selectedFile = null;
            
            // Navigate to staff list after 2 seconds
            setTimeout(() => {
              this.router.navigate(['/staff']);
            }, 2000);
          }, 1000);
        },
        error: (err) => {
          console.error('Failed to save staff', err);
          this.isSaving = false;
          this.errorMessage = err?.error?.message || 'Unable to save staff. Please try again.';
        }
      });
    }
  }
}

