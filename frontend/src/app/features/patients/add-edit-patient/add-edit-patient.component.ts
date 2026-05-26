import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PatientService } from '../../../core/services/patient.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Patient } from '../../../core/models/patient.model';
import { Doctor } from '../../../core/models/doctor.model';
import { Appointment } from '../../../core/models/appointment.model';
import { US_STATES, US_CITIES_BY_STATE, getCitiesForState, getZipCodesForCity } from '../../../core/constants/us-locations.constants';

@Component({
  selector: 'app-add-edit-patient',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-edit-patient.component.html',
  styleUrls: ['./add-edit-patient.component.css']
})
export class AddEditPatientComponent implements OnInit {
  private patientService = inject(PatientService);
  private doctorService = inject(DoctorService);
  private appointmentService = inject(AppointmentService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  patient: Partial<Patient> = {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    emailAddress: '',
    gender: 'Male',
    status: 'ACTIVE'
  };
  
  doctors: Doctor[] = [];
  appointments: Appointment[] = [];
  activeTab: string = 'demographics';
  
  // Location dropdowns
  states = US_STATES;
  cities: string[] = [];
  zipCodes: string[] = [];
  mailingCities: string[] = [];
  mailingZipCodes: string[] = [];
  billingCities: string[] = [];
  billingZipCodes: string[] = [];
  activeDemographicsSubTab: string = 'profile';
  activeMedicationSubTab: string = 'active';
  activeAllergySubTab: string = 'active';
  activeProblemSubTab: string = 'active';
  isEditMode = false;
  isLoading = false;
  isLoadingAppointments = false;
  errorMessage: string | null = null;

  // Additional form data for tabs
  allergies: Array<{type: string, severity: string, reaction: string, dateDiscovered: string, dateOnset?: string, comments?: string, isActive?: boolean, isError?: boolean}> = [];
  medications: Array<{name: string, dosage: string, frequency: string, startDate: string, prescriber: string, notes: string, pharmacy?: string, status?: string, isActive?: boolean, isDiscontinued?: boolean, isNotAdministered?: boolean, isError?: boolean}> = [];
  problems: Array<{description: string, icd10Code: string, icd9Code: string, type: string, startDate: string, comments: string, lastEdited: string, isActive?: boolean, isError?: boolean}> = [];
  medicationReconciliation: {performed: boolean, performedBy?: string, performedDate?: string, excepted: boolean} = {performed: false, excepted: false};
  problemReconciliation: {performed: boolean, performedBy?: string, performedDate?: string} = {performed: false};
  allergyReconciliation: {performed: boolean, performedBy?: string, performedDate?: string} = {performed: false};
  noKnownMedications: boolean = false;
  noKnownProblems: boolean = false;
  noKnownAllergies: boolean = false;
  noKnownMedicationAllergies: boolean = false;
  billingInfo: any = {
    useContactAddress: false,
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    paymentMethod: '',
    billingNotes: ''
  };
  insuranceInfo: any = {
    groupNumber: '',
    effectiveDate: '',
    expiryDate: '',
    copay: '',
    deductible: '',
    insuranceNotes: ''
  };
  demographicsInfo: any = {
    middleName: '',
    preferredName: '',
    namePrefix: '',
    nameSuffix: '',
    title: '',
    pronoun: '',
    genderIdentity: '',
    sexualOrientation: '',
    language: '',
    ethnicity: '',
    race: '',
    maritalStatus: '',
    ssn: '',
    mrn: '',
    tebraPatientId: '',
    previousFirstName: '',
    previousLastName: '',
    driversLicenseState: '',
    driversLicenseNumber: '',
    primaryPhoneType: '',
    preferredCommunication: '',
    emergencyContactRelationship: '',
    emergencyContactEmail: '',
    methodOfPayment: '',
    responsiblePartyType: '',
    homePhone: '',
    officePhone: '',
    otherPhone: '',
    workEmail: '',
    otherEmail: '',
    mailingAddress: '',
    mailingCity: '',
    mailingState: '',
    mailingZipCode: '',
    previousAddress: '',
    emailReminders: false,
    phoneReminders: false,
    textReminders: false,
    disclosureNotes: ''
  };
  obgynHistory: any = {
    hormoneReplacementTherapy: '',
    abnormalPapSmear: '',
    cervicalBiopsy: '',
    fertilityDrugs: '',
    irregularMenstruation: '',
    ageOfMenstruation: '',
    totalPregnancies: 0,
    miscarriages: 0,
    preTerm: 0,
    fullTerm: 0,
    living: 0
  };
  vitals: any = {
    recordedDate: new Date().toISOString().split('T')[0],
    recordedTime: new Date().toTimeString().slice(0, 5),
    heightFeet: null,
    heightInches: null,
    heightNotPerformed: false,
    weight: null,
    weightOunces: null,
    weightCondition: '',
    weightNotPerformed: false,
    weightOutOfRange: false,
    bpSystolic: null,
    bpDiastolic: null,
    bpPosition: '',
    bpArm: '',
    bpNotPerformed: false,
    heartRate: null,
    pulse: null,
    pulseLocation: '',
    respiratoryRate: null,
    o2Saturation: null,
    inhaledO2: null,
    temperature: null,
    temperatureRoute: '',
    headCirc: null,
    weightForLengthPercentile: null,
    headCircPercentile: null,
    comment: '',
    lastHeight: null,
    lastHeightDate: null,
    lastWeight: null,
    lastWeightDate: null,
    lastBMI: null,
    lastBMIDate: null,
    lastBP: null,
    lastBPDate: null,
    lastPulse: null,
    lastPulseDate: null,
    lastRR: null,
    lastRRDate: null,
    lastO2Sat: null,
    lastO2SatDate: null,
    lastTemperature: null,
    lastTemperatureDate: null
  };

  ngOnInit(): void {
    this.loadDoctors();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadPatient(Number(id));
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
      if (tab === 'appointments' && this.patient.id) {
      this.loadAppointments();
    }
  }

  setActiveDemographicsSubTab(subTab: string): void {
    this.activeDemographicsSubTab = subTab;
  }

  setActiveMedicationSubTab(subTab: string): void {
    this.activeMedicationSubTab = subTab;
  }

  setActiveAllergySubTab(subTab: string): void {
    this.activeAllergySubTab = subTab;
  }

  setActiveProblemSubTab(subTab: string): void {
    this.activeProblemSubTab = subTab;
  }

  loadDoctors(): void {
    this.doctorService.getAll().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
      },
      error: (err) => {
        console.error('Error loading doctors:', err);
      }
    });
  }

  loadAppointments(): void {
    if (!this.patient.id) return;
    
    this.isLoadingAppointments = true;
    this.appointmentService.getByPatient(this.patient.id).subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.isLoadingAppointments = false;
      },
      error: (err) => {
        console.error('Error loading appointments:', err);
        this.isLoadingAppointments = false;
        this.appointments = [];
      }
    });
  }

  formatDateTime(date: string | undefined, time: string | undefined): string {
    if (!date && !time) return 'Not scheduled';
    if (!date) return time || 'Not scheduled';
    if (!time) {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    }
    try {
      const d = new Date(date);
      const dateStr = d.toLocaleDateString('en-US', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
      return `${dateStr} - ${time}`;
    } catch (e) {
      return `${date} - ${time}`;
    }
  }

  viewAppointment(appointment: Appointment): void {
    const appointmentId = appointment.id || (appointment as any).appointmentId;
    if (appointmentId) {
      this.router.navigate(['/admin/appointments/new'], {
        queryParams: { 
          id: appointmentId,
          view: true
        }
      });
    }
  }

  createNewAppointment(): void {
    if (this.patient.id) {
      this.router.navigate(['/admin/appointments/new'], {
        queryParams: { 
          patientId: this.patient.id
        }
      });
    } else {
      this.router.navigate(['/admin/appointments/new']);
    }
  }

  getStatusClass(status?: string): string {
    if (!status) return 'status-default';
    const statusMap: { [key: string]: string } = {
      'Checked Out': 'status-checked-out',
      'Checked In': 'status-checked-in',
      'Cancelled': 'status-cancelled',
      'Schedule': 'status-schedule',
      'Confirmed': 'status-confirmed'
    };
    return statusMap[status] || 'status-default';
  }

  loadPatient(id: number): void {
    this.isLoading = true;
    this.patientService.getById(id).subscribe({
      next: (patient) => {
        this.patient = {
          ...patient,
          id: (patient as any).patientId || patient.id,
          emailAddress: patient.email || patient.emailAddress,
          address: patient.address || patient.addressLine1,
          zipCode: patient.zipCode || patient.pincode
        };
        // Initialize cities and zip codes based on patient state and city
        if (this.patient.state) {
          this.cities = getCitiesForState(this.patient.state);
          if (this.patient.city) {
            this.zipCodes = getZipCodesForCity(this.patient.state, this.patient.city);
          }
        }
        if (this.demographicsInfo.mailingState) {
          this.mailingCities = getCitiesForState(this.demographicsInfo.mailingState);
          if (this.demographicsInfo.mailingCity) {
            this.mailingZipCodes = getZipCodesForCity(this.demographicsInfo.mailingState, this.demographicsInfo.mailingCity);
          }
        }
        this.isLoading = false;
        // Load appointments if appointments tab is active
        if (this.activeTab === 'appointments') {
          this.loadAppointments();
        }
      },
      error: (err) => {
        console.error('Error loading patient:', err);
        this.errorMessage = 'Failed to load patient';
        this.isLoading = false;
      }
    });
  }

  addAllergy(): void {
    this.allergies.push({type: '', severity: '', reaction: '', dateDiscovered: ''});
  }

  removeAllergy(index: number): void {
    this.allergies.splice(index, 1);
  }

  addMedication(): void {
    this.medications.push({name: '', dosage: '', frequency: '', startDate: '', prescriber: '', notes: ''});
  }

  removeMedication(index: number): void {
    this.medications.splice(index, 1);
  }

  addProblem(): void {
    this.problems.push({
      description: '',
      icd10Code: '',
      icd9Code: '',
      type: '',
      startDate: '',
      comments: '',
      lastEdited: new Date().toISOString(),
      isActive: true
    });
  }

  removeProblem(index: number): void {
    this.problems.splice(index, 1);
  }

  deactivateProblem(index: number): void {
    if (this.problems[index]) {
      this.problems[index].isActive = false;
    }
  }

  markProblemAsError(index: number): void {
    if (this.problems[index]) {
      this.problems[index].isError = true;
    }
  }

  renewMedication(index: number): void {
    // Renew medication logic
    console.log('Renewing medication:', this.medications[index]);
  }

  discontinueMedication(index: number): void {
    if (this.medications[index]) {
      this.medications[index].isDiscontinued = true;
      this.medications[index].isActive = false;
    }
  }

  cancelRx(index: number): void {
    // Cancel prescription logic
    console.log('Canceling Rx:', this.medications[index]);
  }

  deactivateAllergy(index: number): void {
    if (this.allergies[index]) {
      this.allergies[index].isActive = false;
    }
  }

  markAllergyAsError(index: number): void {
    if (this.allergies[index]) {
      this.allergies[index].isError = true;
    }
  }

  getActiveMedications(): any[] {
    return this.medications.filter(m => m.isActive && !m.isDiscontinued && !m.isNotAdministered && !m.isError);
  }

  getDiscontinuedMedications(): any[] {
    return this.medications.filter(m => m.isDiscontinued);
  }

  getNotAdministeredMedications(): any[] {
    return this.medications.filter(m => m.isNotAdministered);
  }

  getErrorMedications(): any[] {
    return this.medications.filter(m => m.isError);
  }

  getActiveAllergies(): any[] {
    return this.allergies.filter(a => a.isActive && !a.isError);
  }

  getInactiveAllergies(): any[] {
    return this.allergies.filter(a => !a.isActive && !a.isError);
  }

  getActiveProblems(): any[] {
    return this.problems.filter(p => p.isActive && !p.isError);
  }

  getInactiveProblems(): any[] {
    return this.problems.filter(p => !p.isActive && !p.isError);
  }

  onStateChange(): void {
    this.cities = getCitiesForState(this.patient.state || '');
    this.zipCodes = []; // Clear zip codes when state changes
    // Reset city and zip if state changes
    if (this.patient.city && !this.cities.includes(this.patient.city)) {
      this.patient.city = '';
      this.patient.zipCode = '';
    } else if (this.patient.city) {
      // Update zip codes for current city
      this.zipCodes = getZipCodesForCity(this.patient.state || '', this.patient.city);
    }
  }

  onCityChange(): void {
    if (this.patient.state && this.patient.city) {
      this.zipCodes = getZipCodesForCity(this.patient.state, this.patient.city);
    } else {
      this.zipCodes = [];
    }
    // Reset zip code if it's not in the new list
    if (this.patient.zipCode && !this.zipCodes.includes(this.patient.zipCode)) {
      this.patient.zipCode = '';
    }
  }

  onMailingStateChange(): void {
    this.mailingCities = getCitiesForState(this.demographicsInfo.mailingState || '');
    this.mailingZipCodes = []; // Clear zip codes when state changes
    // Reset city and zip if state changes
    if (this.demographicsInfo.mailingCity && !this.mailingCities.includes(this.demographicsInfo.mailingCity)) {
      this.demographicsInfo.mailingCity = '';
      this.demographicsInfo.mailingZipCode = '';
    } else if (this.demographicsInfo.mailingCity) {
      // Update zip codes for current city
      this.mailingZipCodes = getZipCodesForCity(this.demographicsInfo.mailingState || '', this.demographicsInfo.mailingCity);
    }
  }

  onMailingCityChange(): void {
    if (this.demographicsInfo.mailingState && this.demographicsInfo.mailingCity) {
      this.mailingZipCodes = getZipCodesForCity(this.demographicsInfo.mailingState, this.demographicsInfo.mailingCity);
    } else {
      this.mailingZipCodes = [];
    }
    // Reset zip code if it's not in the new list
    if (this.demographicsInfo.mailingZipCode && !this.mailingZipCodes.includes(this.demographicsInfo.mailingZipCode)) {
      this.demographicsInfo.mailingZipCode = '';
    }
  }

  onBillingStateChange(): void {
    this.billingCities = getCitiesForState(this.billingInfo.billingState || '');
    this.billingZipCodes = []; // Clear zip codes when state changes
    // Reset city and zip if state changes
    if (this.billingInfo.billingCity && !this.billingCities.includes(this.billingInfo.billingCity)) {
      this.billingInfo.billingCity = '';
      this.billingInfo.billingZipCode = '';
    } else if (this.billingInfo.billingCity) {
      // Update zip codes for current city
      this.billingZipCodes = getZipCodesForCity(this.billingInfo.billingState || '', this.billingInfo.billingCity);
    }
  }

  onBillingCityChange(): void {
    if (this.billingInfo.billingState && this.billingInfo.billingCity) {
      this.billingZipCodes = getZipCodesForCity(this.billingInfo.billingState, this.billingInfo.billingCity);
    } else {
      this.billingZipCodes = [];
    }
    // Reset zip code if it's not in the new list
    if (this.billingInfo.billingZipCode && !this.billingZipCodes.includes(this.billingInfo.billingZipCode)) {
      this.billingInfo.billingZipCode = '';
    }
  }

  copyAddressToBilling(): void {
    if (this.billingInfo.useContactAddress) {
      this.billingInfo.billingAddress = this.patient.address || '';
      this.billingInfo.billingCity = this.patient.city || '';
      this.billingInfo.billingState = this.patient.state || '';
      this.billingInfo.billingZipCode = this.patient.zipCode || '';
      // Update billing dropdowns
      if (this.billingInfo.billingState) {
        this.billingCities = getCitiesForState(this.billingInfo.billingState);
        if (this.billingInfo.billingCity) {
          this.billingZipCodes = getZipCodesForCity(this.billingInfo.billingState, this.billingInfo.billingCity);
        }
      }
    } else {
      // Clear billing address if unchecked
      this.billingInfo.billingAddress = '';
      this.billingInfo.billingCity = '';
      this.billingInfo.billingState = '';
      this.billingInfo.billingZipCode = '';
      this.billingCities = [];
      this.billingZipCodes = [];
    }
  }

  calculateBMI(): string {
    if (!this.vitals.weight || !this.vitals.heightFeet || !this.vitals.heightInches) {
      return 'N/A';
    }
    const totalInches = (this.vitals.heightFeet * 12) + this.vitals.heightInches;
    const bmi = (this.vitals.weight / (totalInches * totalInches)) * 703;
    return bmi.toFixed(1);
  }

  saveVitals(): void {
    // Save vitals logic - can be implemented to save to backend
    const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    
    if (this.vitals.heightFeet || this.vitals.heightInches) {
      this.vitals.lastHeight = `${this.vitals.heightFeet || 0} ft ${this.vitals.heightInches || 0} in`;
      this.vitals.lastHeightDate = today;
    }
    if (this.vitals.weight) {
      this.vitals.lastWeight = this.vitals.weight;
      this.vitals.lastWeightDate = today;
    }
    if (this.vitals.weight && this.vitals.heightFeet) {
      this.vitals.lastBMI = this.calculateBMI();
      this.vitals.lastBMIDate = today;
    }
    if (this.vitals.bpSystolic && this.vitals.bpDiastolic) {
      this.vitals.lastBP = `${this.vitals.bpSystolic}/${this.vitals.bpDiastolic}`;
      this.vitals.lastBPDate = today;
    }
    if (this.vitals.pulse) {
      this.vitals.lastPulse = this.vitals.pulse;
      this.vitals.lastPulseDate = today;
    }
    if (this.vitals.respiratoryRate) {
      this.vitals.lastRR = this.vitals.respiratoryRate;
      this.vitals.lastRRDate = today;
    }
    if (this.vitals.o2Saturation) {
      this.vitals.lastO2Sat = this.vitals.o2Saturation;
      this.vitals.lastO2SatDate = today;
    }
    if (this.vitals.temperature) {
      this.vitals.lastTemperature = this.vitals.temperature;
      this.vitals.lastTemperatureDate = today;
    }
    
    // TODO: Save to backend API
    console.log('Vitals saved:', this.vitals);
  }

  clearVitals(): void {
    this.vitals = {
      heightFeet: null,
      heightInches: null,
      heightNotPerformed: false,
      weight: null,
      weightCondition: '',
      weightNotPerformed: false,
      weightOutOfRange: false,
      bpSystolic: null,
      bpDiastolic: null,
      bpPosition: '',
      bpArm: '',
      bpNotPerformed: false,
      pulse: null,
      pulseLocation: '',
      respiratoryRate: null,
      o2Saturation: null,
      temperature: null,
      temperatureRoute: '',
      lastHeight: this.vitals.lastHeight,
      lastHeightDate: this.vitals.lastHeightDate,
      lastWeight: this.vitals.lastWeight,
      lastWeightDate: this.vitals.lastWeightDate,
      lastBMI: this.vitals.lastBMI,
      lastBMIDate: this.vitals.lastBMIDate,
      lastBP: this.vitals.lastBP,
      lastBPDate: this.vitals.lastBPDate,
      lastPulse: this.vitals.lastPulse,
      lastPulseDate: this.vitals.lastPulseDate,
      lastRR: this.vitals.lastRR,
      lastRRDate: this.vitals.lastRRDate,
      lastO2Sat: this.vitals.lastO2Sat,
      lastO2SatDate: this.vitals.lastO2SatDate,
      lastTemperature: this.vitals.lastTemperature,
      lastTemperatureDate: this.vitals.lastTemperatureDate
    };
  }

  save(): void {
    // Validate all required fields
    const missingFields: string[] = [];
    
    if (!this.patient.firstName || this.patient.firstName.trim() === '') {
      missingFields.push('First Name');
    }
    
    if (!this.patient.lastName || this.patient.lastName.trim() === '') {
      missingFields.push('Last Name');
    }
    
    if (!this.patient.dateOfBirth) {
      missingFields.push('Date of Birth');
    }
    
    if (!this.patient.gender || this.patient.gender.trim() === '') {
      missingFields.push('Sex/Gender');
    }
    
    if (!this.patient.phoneNumber || this.patient.phoneNumber.trim() === '') {
      missingFields.push('Phone Number');
    }
    
    if (missingFields.length > 0) {
      this.errorMessage = `Please fill in all required fields: ${missingFields.join(', ')}`;
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    // Helper function to convert empty strings to null
    const toNullIfEmpty = (value: any): any => {
      if (value === '' || value === undefined) return null;
      return value;
    };

    const patientData: any = {
      firstName: this.patient.firstName?.trim(),
      lastName: this.patient.lastName?.trim(),
      phoneNumber: this.patient.phoneNumber?.trim(),
      email: toNullIfEmpty(this.patient.emailAddress || this.patient.email),
      dateOfBirth: this.patient.dateOfBirth,
      gender: this.patient.gender?.trim(),
      bloodGroup: toNullIfEmpty(this.patient.bloodGroup),
      status: this.patient.status || 'ACTIVE',
      address: toNullIfEmpty(this.patient.address || this.patient.addressLine1),
      city: toNullIfEmpty(this.patient.city),
      state: toNullIfEmpty(this.patient.state),
      zipCode: toNullIfEmpty(this.patient.zipCode || this.patient.pincode),
      country: toNullIfEmpty(this.patient.country),
      emergencyContactName: toNullIfEmpty(this.patient.emergencyContactName),
      emergencyContactPhone: toNullIfEmpty(this.patient.emergencyContactPhone),
      allergies: toNullIfEmpty(this.patient.allergies),
      medicalHistory: toNullIfEmpty(this.patient.medicalHistory),
      insuranceProvider: toNullIfEmpty(this.patient.insuranceProvider),
      insurancePolicyNumber: toNullIfEmpty(this.patient.insurancePolicyNumber),
      primaryDoctorId: this.patient.primaryDoctorId || null,
      photoUrl: this.patient.photoUrl || undefined
    };

    if (this.isEditMode && this.patient.id) {
      this.patientService.update(this.patient.id, patientData).subscribe({
        next: () => {
          this.router.navigate(['/admin/patients']);
        },
        error: (err) => {
          console.error('Error updating patient:', err);
          // Show more specific error message
          if (err.error?.message) {
            this.errorMessage = err.error.message;
          } else if (err.error?.error) {
            this.errorMessage = err.error.error;
          } else if (err.message) {
            this.errorMessage = err.message;
          } else {
            this.errorMessage = 'Failed to update patient. Please check all required fields and try again.';
          }
          this.isLoading = false;
          // Scroll to top to show error message
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    } else {
      this.patientService.create(patientData).subscribe({
        next: () => {
          this.router.navigate(['/admin/patients']);
        },
        error: (err) => {
          console.error('Error creating patient:', err);
          // Show more specific error message
          if (err.error?.message) {
            this.errorMessage = err.error.message;
          } else if (err.error?.error) {
            this.errorMessage = err.error.error;
          } else if (err.message) {
            this.errorMessage = err.message;
          } else {
            this.errorMessage = 'Failed to create patient. Please check all required fields and try again.';
          }
          this.isLoading = false;
          // Scroll to top to show error message
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/patients']);
  }

  onProfileImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        this.errorMessage = 'Please select a valid image file';
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size should be less than 5MB';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.patient.photoUrl = e.target.result;
        this.errorMessage = null;
      };
      reader.readAsDataURL(file);
    }
  }

  calculateAge(dateOfBirth: string): number {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}

