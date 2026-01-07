import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AdminMockService } from './admin-mock.service';
import { AdminApiService } from './admin-api.service';
import { 
  VisitType, 
  NoteTemplate, 
  OrderSet, 
  ProviderTemplate,
  ScheduleTemplate,
  RegistrationRule,
  AlertRule
} from '../models/admin.model';

/**
 * Unified admin service that switches between mock and API based on environment
 */
@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private mockService = inject(AdminMockService);
  private apiService = inject(AdminApiService);
  
  private useMock = (environment as any).useMock !== false; // Default to true if not set

  // Provider Templates
  getProviderTemplates(): Observable<ProviderTemplate[]> {
    return this.useMock
      ? this.mockService.getProviderTemplates()
      : this.apiService.getProviderTemplates();
  }

  getProviderTemplate(providerId: number): Observable<ProviderTemplate> {
    return this.useMock
      ? this.mockService.getProviderTemplate(providerId)
      : this.apiService.getProviderTemplate(providerId);
  }

  saveVisitType(visitType: VisitType): Observable<VisitType> {
    return this.useMock
      ? this.mockService.saveVisitType(visitType)
      : this.apiService.saveVisitType(visitType);
  }

  deleteVisitType(visitTypeId: number): Observable<void> {
    return this.useMock
      ? this.mockService.deleteVisitType(visitTypeId)
      : this.apiService.deleteVisitType(visitTypeId);
  }

  // Schedules
  getScheduleTemplates(): Observable<ScheduleTemplate[]> {
    return this.useMock
      ? this.mockService.getScheduleTemplates()
      : this.apiService.getScheduleTemplates();
  }

  getScheduleTemplate(providerId: number): Observable<ScheduleTemplate> {
    return this.useMock
      ? this.mockService.getScheduleTemplate(providerId)
      : this.apiService.getScheduleTemplate(providerId);
  }

  saveScheduleTemplate(template: ScheduleTemplate): Observable<ScheduleTemplate> {
    return this.useMock
      ? this.mockService.saveScheduleTemplate(template)
      : this.apiService.saveScheduleTemplate(template);
  }

  // Registration Rules
  getRegistrationRules(): Observable<RegistrationRule[]> {
    return this.useMock
      ? this.mockService.getRegistrationRules()
      : this.apiService.getRegistrationRules();
  }

  saveRegistrationRule(rule: RegistrationRule): Observable<RegistrationRule> {
    return this.useMock
      ? this.mockService.saveRegistrationRule(rule)
      : this.apiService.saveRegistrationRule(rule);
  }

  toggleRegistrationRule(ruleId: number, isActive: boolean): Observable<void> {
    return this.useMock
      ? this.mockService.toggleRegistrationRule(ruleId, isActive)
      : this.apiService.toggleRegistrationRule(ruleId, isActive);
  }

  deleteRegistrationRule(ruleId: number): Observable<void> {
    return this.useMock
      ? this.mockService.deleteRegistrationRule(ruleId)
      : this.apiService.deleteRegistrationRule(ruleId);
  }

  // Alerts & Warnings
  getAlertRules(): Observable<AlertRule[]> {
    return this.useMock
      ? this.mockService.getAlertRules()
      : this.apiService.getAlertRules();
  }

  saveAlertRule(rule: AlertRule): Observable<AlertRule> {
    return this.useMock
      ? this.mockService.saveAlertRule(rule)
      : this.apiService.saveAlertRule(rule);
  }

  toggleAlertRule(ruleId: number, isActive: boolean): Observable<void> {
    return this.useMock
      ? this.mockService.toggleAlertRule(ruleId, isActive)
      : this.apiService.toggleAlertRule(ruleId, isActive);
  }

  deleteAlertRule(ruleId: number): Observable<void> {
    return this.useMock
      ? this.mockService.deleteAlertRule(ruleId)
      : this.apiService.deleteAlertRule(ruleId);
  }
}

