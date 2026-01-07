export interface ClinicalNote {
  noteId?: number;
  patientId: number;
  noteType: string;
  noteTitle?: string;
  noteContent: string;
  authoredByStaffId: number;
  authoredDateTime: string;
  status: string;
  signedByStaffId?: number;
  signedDateTime?: string;
  tags?: string[];
  attachments?: string[];
}

