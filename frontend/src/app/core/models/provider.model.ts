export interface Provider {
  id: number;
  name: string;
  specialty: string;
  department: string;
  active: boolean;
  imageUrl?: string;
  photoUrl?: string; // Alias for imageUrl
}

