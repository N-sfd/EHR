export interface TreatmentTeam {
  treatmentTeamId?: number;
  patientId: number;
  staffId: number;
  role: string;
  startDate?: string;
  endDate?: string;
  isPrimary?: boolean;
  notes?: string;
}

