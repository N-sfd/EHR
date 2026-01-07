export interface LocationDto {
  id: number;
  code: string;        // "BR01"
  name: string;        // "Main Branch"
  type?: string;       // "HOSPITAL", "CLINIC"
  addressLine1?: string;
  addressLine2?: string;  // Added for compatibility
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phoneNumber?: string;
  email?: string;
  // Aliases for backward compatibility
  locationName?: string;  // Alias for name
  locationType?: string;  // Alias for type
  locationId?: number;    // Alias for id
  emailAddress?: string;  // Alias for email
  imageUrl?: string;      // For image display
}

export interface StaffLocationDto {
  id: number;
  staffId: number;
  locationId: number;
  days?: string[]; // ['Mon','Wed']
}

// Type alias for backward compatibility
export type Location = LocationDto;
