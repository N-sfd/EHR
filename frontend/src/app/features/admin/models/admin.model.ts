// Provider Templates
export interface VisitType {
  id?: number;
  name: string;
  durationMinutes: number;
  allowedDepartments: number[];
  defaultProviderType?: string;
  requiredResources?: string[];
  allowOverbook: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NoteTemplate {
  id?: number;
  name: string;
  category: string;
  content: string;
  isActive: boolean;
}

export interface OrderSet {
  id?: number;
  name: string;
  category: string;
  orders: OrderSetItem[];
  isActive: boolean;
}

export interface OrderSetItem {
  orderType: string;
  orderName: string;
  frequency?: string;
  duration?: string;
}

export interface ProviderTemplate {
  id?: number;
  providerId: number;
  providerName: string;
  visitTypes: VisitType[];
  noteTemplates: NoteTemplate[];
  orderSets: OrderSet[];
}

// Schedules
export interface ScheduleTemplate {
  id?: number;
  providerId: number;
  providerName: string;
  location: string;
  slotDurationMinutes: number;
  clinicHours: ClinicHours;
  weeklySchedule: WeeklySchedule;
  blockedTimes: BlockedTime[];
  overbookRules: OverbookRule[];
  isActive: boolean;
}

export interface ClinicHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  isOpen: boolean;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface WeeklySchedule {
  [day: string]: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'BLOCKED' | 'OVERBOOK_ALLOWED';
}

export interface BlockedTime {
  id?: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  isRecurring: boolean;
  recurrencePattern?: string;
}

export interface OverbookRule {
  id?: number;
  visitTypeId: number;
  maxOverbookCount: number;
  allowedDays: string[]; // ['MONDAY', 'TUESDAY', etc.]
  isActive: boolean;
}

// Registration Rules
export interface RegistrationRule {
  id?: number;
  name: string;
  description: string;
  ruleType: 'INSURANCE' | 'CONSENT' | 'DEMOGRAPHICS' | 'GUARANTOR' | 'OTHER';
  condition: RuleCondition;
  action: 'BLOCK' | 'WARN' | 'REQUIRE';
  isActive: boolean;
  priority: number;
}

export interface RuleCondition {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'EXISTS' | 'NOT_EXISTS' | 'GREATER_THAN' | 'LESS_THAN';
  value?: string | number;
}

// Alerts & Warnings
export interface AlertRule {
  id?: number;
  name: string;
  description: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  trigger: AlertTrigger;
  visibleRoles: string[]; // ['FRONT_DESK', 'NURSE', 'PROVIDER', 'ADMIN']
  isActive: boolean;
  message: string;
  autoDismiss?: boolean;
  dismissAfterMinutes?: number;
}

export interface AlertTrigger {
  triggerType: 'PATIENT_FIELD' | 'INSURANCE_STATUS' | 'APPOINTMENT_STATUS' | 'DEMOGRAPHICS' | 'CUSTOM';
  condition: RuleCondition;
  frequency: 'ONCE' | 'ALWAYS' | 'SCHEDULED';
}

