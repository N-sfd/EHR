export interface ImagingStudy {
  imagingStudyId?: number;
  patientId: number;
  orderId?: number;
  studyType: string;
  studyDescription: string;
  bodyPart?: string;
  modality?: string;
  scheduledDateTime?: string;
  performedDateTime?: string;
  performedByStaffId?: number;
  status: string;
  report?: string;
  reportDateTime?: string;
  reportedByStaffId?: number;
  findings?: string;
  impression?: string;
  recommendations?: string;
  notes?: string;
  orderedByStaffId?: number;
}

