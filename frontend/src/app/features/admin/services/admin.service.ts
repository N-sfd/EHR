import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
  
  private useMock = (environment as any).useMock === true; // Only use mock if explicitly set to true

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

  // Schedules - Always use mock for now since backend endpoints don't exist
  getScheduleTemplates(): Observable<ScheduleTemplate[]> {
    // Always use mock service since backend endpoints don't exist yet
    return this.mockService.getScheduleTemplates();
  }

  getScheduleTemplate(providerId: number): Observable<ScheduleTemplate> {
    // Always use mock service since backend endpoints don't exist yet
    return this.mockService.getScheduleTemplate(providerId);
  }

  saveScheduleTemplate(template: ScheduleTemplate): Observable<ScheduleTemplate> {
    // Always use mock service since backend endpoints don't exist yet
    return this.mockService.saveScheduleTemplate(template);
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

