export interface Service {
  id?: number;
  serviceName: string;
  departmentId?: number;
  departmentName?: string;
  price: number;
  status: 'Active' | 'Inactive';
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateServiceDto {
  serviceName: string;
  departmentId: number;
  price: number;
  status: 'Active' | 'Inactive';
  description?: string;
}

