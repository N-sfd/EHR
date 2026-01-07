export interface WorkListTask {
  taskId?: number;
  patientId: number;
  assignedToStaffId?: number;
  taskType: string;
  taskDescription: string;
  priority?: string;
  status: string;
  dueDateTime?: string;
  completedDateTime?: string;
  completedByStaffId?: number;
  notes?: string;
  createdByStaffId?: number;
  createdAt?: string;
}

