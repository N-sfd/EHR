export interface Order {
  orderId?: number;
  orderNumber?: string;
  patientId: number;
  orderedByStaffId: number;
  orderType: string;
  orderCategory?: string;
  orderDescription: string;
  orderDetails?: string;
  startDateTime?: string;
  endDateTime?: string;
  status: string;
  priority?: string;
  departmentId?: number;
  verifiedByStaffId?: number;
  verifiedDateTime?: string;
  discontinuedByStaffId?: number;
  discontinuedDateTime?: string;
  discontinuationReason?: string;
  notes?: string;
}

