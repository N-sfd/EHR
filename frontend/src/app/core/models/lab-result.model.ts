export interface LabResult {
  labResultId?: number;
  patientId: number;
  orderId?: number;
  testName: string;
  testCode?: string;
  testCategory?: string;
  specimenType?: string;
  collectedDateTime?: string;
  collectedByStaffId?: number;
  resultDateTime?: string;
  resultValue?: string;
  resultUnit?: string;
  referenceRange?: string;
  abnormalFlag?: string;
  status: string;
  verifiedByStaffId?: number;
  verifiedDateTime?: string;
  notes?: string;
  orderedByStaffId?: number;
}

