export interface CarePlan {
  carePlanId?: number;
  patientId: number;
  problemDescription: string;
  problemCategory?: string;
  status: string;
  onsetDate?: string;
  resolutionDate?: string;
  goals?: CarePlanGoal[];
  interventions?: CarePlanIntervention[];
  createdByStaffId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CarePlanGoal {
  goalId?: number;
  carePlanId?: number;
  goalDescription: string;
  targetDate?: string;
  status: string;
  achievedDate?: string;
}

export interface CarePlanIntervention {
  interventionId?: number;
  carePlanId?: number;
  interventionDescription: string;
  interventionType?: string;
  status: string;
  performedDate?: string;
  performedByStaffId?: number;
}

