import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LocationService } from '../../core/services/location.service';
import { Location } from '../../core/models/location.model';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.css']
})
export class LocationsComponent implements OnInit {
  locations: Location[] = [];
  filteredLocations: Location[] = [];
  searchTerm: string = '';
  isLoading = false;
  errorMessage: string | null = null;
  
  // Modal states
  showAddModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedLocation: Location | null = null;
  locationToDelete: Location | null = null;
  
  // Form data
  formData: Location = {
    id: 0,
    code: '',
    name: '',
    type: '',
    email: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    imageUrl: ''
  };
  
  // Location types
  locationTypes = ['In Person', 'Video Consultation', 'Both'];
  
  // Countries and states (simplified - you can expand this)
  countries = ['United States', 'Canada', 'UK', 'Germany', 'France'];
  states: { [key: string]: string[] } = {
    'United States': ['California', 'Texas', 'Florida', 'New York', 'Illinois', 'Ohio', 'Washington'],
    'Canada': ['Ontario', 'Quebec', 'British Columbia'],
    'UK': ['England', 'Scotland', 'Wales'],
    'Germany': ['Bavaria', 'Berlin', 'Hamburg'],
    'France': ['Île-de-France', 'Provence', 'Normandy']
  };
  
  cities: { [key: string]: string[] } = {
    'California': ['Los Angeles', 'San Francisco', 'San Diego'],
    'Texas': ['Houston', 'Dallas', 'Austin'],
    'Florida': ['Miami', 'Tampa', 'Orlando'],
    'New York': ['New York City', 'Buffalo', 'Rochester'],
    'Illinois': ['Chicago', 'Springfield', 'Peoria'],
    'Ohio': ['Columbus', 'Cleveland', 'Cincinnati'],
    'Washington': ['Seattle', 'Spokane', 'Tacoma']
  };
  
  selectedCountryStates: string[] = [];
  selectedStateCities: string[] = [];
  imagePreview: string | null = null;
  imageFile: File | null = null;

  constructor(private locationService: LocationService) {}

  ngOnInit() {
    this.loadLocations();
  }

  loadLocations() {
    this.isLoading = true;
    this.errorMessage = null;
    this.locationService.getAll().subscribe({
      next: (locations) => {
        this.locations = locations;
        this.filteredLocations = locations;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading locations:', err);
        this.errorMessage = 'Unable to load locations. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onSearchChange() {
    const term = this.searchTerm.toLowerCase();
    this.filteredLocations = this.locations.filter(loc =>
      (loc.name || loc.locationName || '').toLowerCase().includes(term) ||
      (loc.city || '').toLowerCase().includes(term) ||
      (loc.state || '').toLowerCase().includes(term) ||
      (loc.country || '').toLowerCase().includes(term)
    );
  }

  openAddModal() {
    this.resetForm();
    this.showAddModal = true;
  }

  openEditModal(location: Location) {
    this.selectedLocation = location;
    this.formData = { ...location };
    this.imagePreview = (location as any).imageUrl || location.imageUrl || null;
    
    // Set states and cities based on selected country/state
    if (location.country) {
      this.onCountryChange();
      if (location.state) {
        this.onStateChange();
      }
    }
    
    this.showEditModal = true;
  }

  openDeleteModal(location: Location) {
    this.locationToDelete = location;
    this.showDeleteModal = true;
  }

  closeModals() {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedLocation = null;
    this.locationToDelete = null;
    this.resetForm();
  }

  resetForm() {
    this.formData = {
      id: 0,
      code: '',
      name: '',
      type: '',
      email: '',
      phoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      imageUrl: ''
    };
    this.imagePreview = null;
    this.imageFile = null;
    this.selectedCountryStates = [];
    this.selectedStateCities = [];
  }

  onImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.imageFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.formData.imageUrl = e.target.result;
      };
      reader.readAsDataURL(this.imageFile);
    }
  }

  removeImage() {
    this.imagePreview = null;
    this.imageFile = null;
    this.formData.imageUrl = '';
  }

  onCountryChange() {
    if (this.formData.country) {
      this.selectedCountryStates = this.states[this.formData.country] || [];
      if (this.formData.state && !this.selectedCountryStates.includes(this.formData.state)) {
        this.formData.state = '';
        this.formData.city = '';
      }
    } else {
      this.selectedCountryStates = [];
      this.formData.state = '';
      this.formData.city = '';
    }
    this.selectedStateCities = [];
  }

  onStateChange() {
    if (this.formData.state) {
      this.selectedStateCities = this.cities[this.formData.state] || [];
      if (this.formData.city && !this.selectedStateCities.includes(this.formData.city)) {
        this.formData.city = '';
      }
    } else {
      this.selectedStateCities = [];
      this.formData.city = '';
    }
  }

  saveLocation() {
    if (!this.isFormValid()) {
      alert('Please fill in all required fields.');
      return;
    }

    // Trim all string fields to remove whitespace
    const trimmedData = {
      name: (this.formData.name || this.formData.locationName || '').trim(),
      type: (this.formData.type || this.formData.locationType || '').trim(),
      email: (this.formData.email || this.formData.emailAddress || '').trim(),
      phoneNumber: this.formData.phoneNumber?.trim() || '',
      addressLine1: this.formData.addressLine1?.trim() || '',
      addressLine2: this.formData.addressLine2?.trim() || '',
      city: this.formData.city?.trim() || '',
      state: this.formData.state?.trim() || '',
      country: this.formData.country?.trim() || '',
      zipCode: this.formData.zipCode?.trim() || '',
      code: this.formData.code?.trim() || '',
      imageUrl: this.formData.imageUrl || undefined
    };

    // Double-check validation after trimming
    if (!trimmedData.name || !trimmedData.type || 
        !trimmedData.email || !trimmedData.phoneNumber ||
        !trimmedData.addressLine1 || !trimmedData.city || 
        !trimmedData.state || !trimmedData.country || !trimmedData.zipCode) {
      alert('Please fill in all required fields.');
      return;
    }

    this.isLoading = true;
    // Clean up the data: convert empty strings to undefined for optional fields
    const locationData: Location = {
      id: this.formData.id || 0,
      ...trimmedData,
      addressLine2: trimmedData.addressLine2 || undefined,
      imageUrl: trimmedData.imageUrl || undefined
    };

    console.log('Sending location data:', locationData);

    if (this.showAddModal) {
      console.log('Attempting to create location with data:', locationData);
      this.locationService.create(locationData).subscribe({
        next: (response) => {
          console.log('Location created successfully:', response);
          this.isLoading = false;
          this.closeModals();
          this.loadLocations();
        },
        error: (err) => {
          console.error('Full error object:', err);
          console.error('Error status:', err?.status);
          console.error('Error statusText:', err?.statusText);
          console.error('Error error:', err?.error);
          console.error('Error message:', err?.message);
          console.error('Error details:', JSON.stringify(err, null, 2));
          
          let errorMessage = 'Error creating location. Please try again.';
          if (err?.error) {
            if (typeof err.error === 'string') {
              errorMessage = err.error;
            } else if (err.error.message) {
              errorMessage = err.error.message;
            } else if (err.error.error) {
              errorMessage = err.error.error;
            }
          } else if (err?.message) {
            errorMessage = err.message;
          }
          
          // Show more detailed error in console
          console.error('Final error message to show:', errorMessage);
          alert(`Error: ${errorMessage}\n\nStatus: ${err?.status || 'Unknown'}\n\nPlease check the browser console for more details.`);
          this.isLoading = false;
        }
      });
    } else if (this.showEditModal && (this.selectedLocation?.id || this.selectedLocation?.locationId)) {
      const locationId = this.selectedLocation.id || this.selectedLocation.locationId;
      this.locationService.update(locationId!, locationData).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeModals();
          this.loadLocations();
        },
        error: (err) => {
          console.error('Error updating location:', err);
          const errorMessage = err?.error?.message || err?.message || 'Error updating location. Please try again.';
          alert(errorMessage);
          this.isLoading = false;
        }
      });
    }
  }

  deleteLocation() {
    const locationId = this.locationToDelete?.id || this.locationToDelete?.locationId;
    if (!locationId) return;

    this.isLoading = true;
    this.locationService.delete(locationId).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeModals();
        this.loadLocations();
      },
      error: (err) => {
        console.error('Error deleting location:', err);
        alert('Error deleting location. Please try again.');
        this.isLoading = false;
      }
    });
  }

  isFormValid(): boolean {
    return !!(
      (this.formData.name || this.formData.locationName) &&
      (this.formData.type || this.formData.locationType) &&
      (this.formData.email || this.formData.emailAddress) &&
      this.formData.phoneNumber &&
      this.formData.addressLine1 &&
      this.formData.city &&
      this.formData.state &&
      this.formData.country &&
      this.formData.zipCode
    );
  }

  getLocationImage(location: Location): string {
    if (location.imageUrl) {
      return location.imageUrl;
    }
    // Default placeholder
    const locationName = location.name || location.locationName || 'Location';
    return 'https://via.placeholder.com/150?text=' + encodeURIComponent(locationName);
  }

  getTotalLocations(): number {
    return this.locations.length;
  }

  onImageError(event: Event, location: Location) {
    const img = event.target as HTMLImageElement;
    const locationName = location.name || location.locationName || '';
    const initial = locationName ? locationName.charAt(0) : 'L';
    img.src = `https://via.placeholder.com/50?text=${encodeURIComponent(initial)}`;
  }
}

