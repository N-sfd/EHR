import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { 
  VisitType, 
  NoteTemplate, 
  OrderSet, 
  ProviderTemplate,
  ScheduleTemplate,
  RegistrationRule,
  AlertRule
} from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminMockService {
  // Provider Templates
  getProviderTemplates(): Observable<ProviderTemplate[]> {
    const templates: ProviderTemplate[] = [
      {
        id: 1,
        providerId: 1,
        providerName: 'Dr. Sarah Johnson',
        visitTypes: [
          {
            id: 1,
            name: 'New Patient',
            durationMinutes: 60,
            allowedDepartments: [1, 2],
            defaultProviderType: 'PHYSICIAN',
            requiredResources: ['Exam Room'],
            allowOverbook: false,
            isActive: true
          },
          {
            id: 2,
            name: 'Follow-up',
            durationMinutes: 30,
            allowedDepartments: [1, 2, 3],
            defaultProviderType: 'PHYSICIAN',
            allowOverbook: true,
            isActive: true
          }
        ],
        noteTemplates: [
          {
            id: 1,
            name: 'Standard Visit',
            category: 'General',
            content: 'Patient presents for routine follow-up...',
            isActive: true
          }
        ],
        orderSets: [
          {
            id: 1,
            name: 'Annual Physical',
            category: 'Preventive',
            orders: [
              { orderType: 'LAB', orderName: 'CBC', frequency: 'Once' },
              { orderType: 'LAB', orderName: 'CMP', frequency: 'Once' }
            ],
            isActive: true
          }
        ]
      }
    ];
    return of(templates).pipe(delay(300));
  }

  getProviderTemplate(providerId: number): Observable<ProviderTemplate> {
    return this.getProviderTemplates().pipe(
      delay(200),
      map(templates => {
        const template = templates.find(t => t.providerId === providerId);
        if (template) {
          return template;
        }
        // Return empty template if not found
        return {
          id: undefined,
          providerId,
          providerName: `Provider ${providerId}`,
          visitTypes: [],
          noteTemplates: [],
          orderSets: []
        };
      })
    );
  }

  saveVisitType(visitType: VisitType): Observable<VisitType> {
    const saved = {
      ...visitType,
      id: visitType.id || Math.floor(Math.random() * 1000),
      createdAt: visitType.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return of(saved).pipe(delay(400));
  }

  deleteVisitType(visitTypeId: number): Observable<void> {
    return of(undefined).pipe(delay(300));
  }

  // Schedules
  getScheduleTemplates(): Observable<ScheduleTemplate[]> {
    const templates: ScheduleTemplate[] = [
      {
        id: 1,
        providerId: 1,
        providerName: 'Dr. Sarah Johnson',
        location: 'Main Clinic',
        slotDurationMinutes: 30,
        clinicHours: {
          monday: { isOpen: true, startTime: '08:00', endTime: '17:00' },
          tuesday: { isOpen: true, startTime: '08:00', endTime: '17:00' },
          wednesday: { isOpen: true, startTime: '08:00', endTime: '17:00' },
          thursday: { isOpen: true, startTime: '08:00', endTime: '17:00' },
          friday: { isOpen: true, startTime: '08:00', endTime: '17:00' },
          saturday: { isOpen: false, startTime: '09:00', endTime: '13:00' },
          sunday: { isOpen: false, startTime: '09:00', endTime: '13:00' }
        },
        weeklySchedule: {},
        blockedTimes: [
          {
            id: 1,
            startDate: '2026-01-10',
            endDate: '2026-01-10',
            startTime: '12:00',
            endTime: '13:00',
            reason: 'Lunch Break',
            isRecurring: true,
            recurrencePattern: 'DAILY'
          }
        ],
        overbookRules: [
          {
            id: 1,
            visitTypeId: 2,
            maxOverbookCount: 2,
            allowedDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY'],
            isActive: true
          }
        ],
        isActive: true
      }
    ];
    return of(templates).pipe(delay(300));
  }

  getScheduleTemplate(providerId: number): Observable<ScheduleTemplate> {
    return this.getScheduleTemplates().pipe(
      delay(200),
      map(templates => {
        const template = templates.find(t => t.providerId === providerId);
        if (template) {
          return template;
        }
        // Return empty template if not found
        return {
          id: undefined,
          providerId,
          providerName: `Provider ${providerId}`,
          location: '',
          slotDurationMinutes: 30,
          clinicHours: {
            monday: { isOpen: true, startTime: '08:00', endTime: '17:00' },
            tuesday: { isOpen: true, startTime: '08:00', endTime: '17:00' },
            wednesday: { isOpen: true, startTime: '08:00', endTime: '17:00' },
            thursday: { isOpen: true, startTime: '08:00', endTime: '17:00' },
            friday: { isOpen: true, startTime: '08:00', endTime: '17:00' },
            saturday: { isOpen: false, startTime: '09:00', endTime: '13:00' },
            sunday: { isOpen: false, startTime: '09:00', endTime: '13:00' }
          },
          weeklySchedule: {},
          blockedTimes: [],
          overbookRules: [],
          isActive: true
        };
      })
    );
  }

  saveScheduleTemplate(template: ScheduleTemplate): Observable<ScheduleTemplate> {
    const saved = {
      ...template,
      id: template.id || Math.floor(Math.random() * 1000)
    };
    return of(saved).pipe(delay(500));
  }

  // Registration Rules
  getRegistrationRules(): Observable<RegistrationRule[]> {
    const rules: RegistrationRule[] = [
      {
        id: 1,
        name: 'Require Insurance Before Check-In',
        description: 'Patient must have active insurance on file before check-in',
        ruleType: 'INSURANCE',
        condition: {
          field: 'insurance.eligibilityStatus',
          operator: 'EQUALS',
          value: 'ACTIVE'
        },
        action: 'BLOCK',
        isActive: true,
        priority: 1
      },
      {
        id: 2,
        name: 'Block if Consent Missing',
        description: 'Prevent check-in if required consent forms are not signed',
        ruleType: 'CONSENT',
        condition: {
          field: 'consent.requiredFormsSigned',
          operator: 'NOT_EQUALS',
          value: 'true'
        },
        action: 'BLOCK',
        isActive: true,
        priority: 2
      },
      {
        id: 3,
        name: 'Require Phone or Email',
        description: 'Patient must have at least phone or email on file',
        ruleType: 'DEMOGRAPHICS',
        condition: {
          field: 'contact.phone',
          operator: 'EXISTS'
        },
        action: 'WARN',
        isActive: true,
        priority: 3
      },
      {
        id: 4,
        name: 'Require Guarantor if Minor',
        description: 'Patients under 18 must have a guarantor',
        ruleType: 'GUARANTOR',
        condition: {
          field: 'patient.age',
          operator: 'LESS_THAN',
          value: 18
        },
        action: 'REQUIRE',
        isActive: true,
        priority: 4
      }
    ];
    return of(rules).pipe(delay(300));
  }

  saveRegistrationRule(rule: RegistrationRule): Observable<RegistrationRule> {
    const saved = {
      ...rule,
      id: rule.id || Math.floor(Math.random() * 1000)
    };
    return of(saved).pipe(delay(400));
  }

  toggleRegistrationRule(ruleId: number, isActive: boolean): Observable<void> {
    return of(undefined).pipe(delay(200));
  }

  deleteRegistrationRule(ruleId: number): Observable<void> {
    return of(undefined).pipe(delay(300));
  }

  // Alerts & Warnings
  getAlertRules(): Observable<AlertRule[]> {
    const rules: AlertRule[] = [
      {
        id: 1,
        name: 'Expired Insurance',
        description: 'Alert when patient insurance has expired',
        severity: 'CRITICAL',
        trigger: {
          triggerType: 'INSURANCE_STATUS',
          condition: {
            field: 'insurance.eligibilityStatus',
            operator: 'EQUALS',
            value: 'EXPIRED'
          },
          frequency: 'ALWAYS'
        },
        visibleRoles: ['FRONT_DESK', 'NURSE', 'PROVIDER'],
        isActive: true,
        message: 'Patient insurance has expired. Verify eligibility before appointment.',
        autoDismiss: false
      },
      {
        id: 2,
        name: 'Missing Demographics',
        description: 'Warn when required demographics are incomplete',
        severity: 'WARN',
        trigger: {
          triggerType: 'DEMOGRAPHICS',
          condition: {
            field: 'demographics.complete',
            operator: 'NOT_EQUALS',
            value: 'true'
          },
          frequency: 'ALWAYS'
        },
        visibleRoles: ['FRONT_DESK', 'NURSE'],
        isActive: true,
        message: 'Patient demographics are incomplete. Please update.',
        autoDismiss: true,
        dismissAfterMinutes: 5
      },
      {
        id: 3,
        name: 'Allergy Alert',
        description: 'Critical alert for known allergies',
        severity: 'CRITICAL',
        trigger: {
          triggerType: 'PATIENT_FIELD',
          condition: {
            field: 'allergies.count',
            operator: 'GREATER_THAN',
            value: 0
          },
          frequency: 'ALWAYS'
        },
        visibleRoles: ['NURSE', 'PROVIDER'],
        isActive: true,
        message: 'Patient has known allergies. Review before medication orders.',
        autoDismiss: false
      }
    ];
    return of(rules).pipe(delay(300));
  }

  saveAlertRule(rule: AlertRule): Observable<AlertRule> {
    const saved = {
      ...rule,
      id: rule.id || Math.floor(Math.random() * 1000)
    };
    return of(saved).pipe(delay(400));
  }

  toggleAlertRule(ruleId: number, isActive: boolean): Observable<void> {
    return of(undefined).pipe(delay(200));
  }

  deleteAlertRule(ruleId: number): Observable<void> {
    return of(undefined).pipe(delay(300));
  }
}

