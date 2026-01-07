import { VitalSign } from './vital-sign.model';
import { Medication } from './medication.model';
import { Allergy } from './allergy.model';
import { Order } from './order.model';
import { LabResult } from './lab-result.model';
import { ClinicalNote } from './clinical-note.model';
import { CarePlan } from './care-plan.model';
import { TreatmentTeam } from './treatment-team.model';
import { WorkListTask } from './work-list-task.model';

export interface PatientOverview {
  patientId: number;
  patientName?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  latestVitalSigns?: VitalSign;
  activeMedications?: Medication[];
  activeAllergies?: Allergy[];
  recentOrders?: Order[];
  recentLabResults?: LabResult[];
  recentClinicalNotes?: ClinicalNote[];
  activeCarePlans?: CarePlan[];
  treatmentTeam?: TreatmentTeam[];
  pendingTasks?: WorkListTask[];
}

