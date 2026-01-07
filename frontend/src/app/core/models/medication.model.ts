export interface Medication {
  medicationId?: number;
  patientId: number;
  medicationName: string;
  genericName?: string;
  dosage?: string;
  dosageUnit?: string;
  frequency?: string;
  route?: string;
  quantity?: number;
  quantityUnit?: string;
  startDate?: string;
  endDate?: string;
  prescribedByStaffId?: number;
  status: string;
  indication?: string;
  instructions?: string;
  isPrn: boolean;
  prnIndication?: string;
  allergiesChecked: boolean;
  notes?: string;
}

