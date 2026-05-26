export interface Guarantor {
  id?: number;
  patientId: number;
  relationship: string; // Self, Spouse, Parent, etc.
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  homePhone?: string;
  workPhone?: string;
  mobilePhone?: string;
  myChartStatus?: 'ENROLLED' | 'NOT_ENROLLED' | 'PENDING';
}

export interface PatientBalance {
  patientId: number;
  insuranceBalance: number;
  selfPayBalance: number;
  totalBalance: number;
  aging: {
    '0-30': number;
    '31-60': number;
    '61-90': number;
    '90+': number;
  };
}

export interface PatientStatement {
  id?: number;
  patientId: number;
  statementDate: string;
  invoiceNumber: string;
  charged: number;
  outstanding: number;
  status: 'PAID' | 'PARTIAL' | 'OUTSTANDING';
}

export interface PatientPayment {
  id?: number;
  patientId: number;
  paymentDate: string;
  paymentType: 'COPAY' | 'DEDUCTIBLE' | 'PAYMENT' | 'REFUND';
  amount: number;
  paymentMethod: 'CASH' | 'CHECK' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'ONLINE';
  referenceNumber?: string;
}

export interface PatientVisit {
  id?: number;
  patientId: number;
  visitDate: string;
  department: string;
  provider: string;
  copay?: number;
  status: 'COMPLETED' | 'SCHEDULED' | 'CANCELLED' | 'NO_SHOW';
}

export interface PatientActivity {
  id?: string;
  patientId: number;
  timestamp: string;
  type: 'NOTE' | 'CALL' | 'EMAIL' | 'TASK' | 'ALERT';
  comment: string;
  createdBy?: string;
}

