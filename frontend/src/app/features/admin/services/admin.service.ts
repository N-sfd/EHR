import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminApiService } from './admin-api.service';
import {
  VisitType,
  ProviderTemplate,
  ScheduleTemplate,
  RegistrationRule,
  AlertRule
} from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiService = inject(AdminApiService);

  getProviderTemplates(): Observable<ProviderTemplate[]> {
    return this.apiService.getProviderTemplates();
  }

  getProviderTemplate(providerId: number): Observable<ProviderTemplate> {
    return this.apiService.getProviderTemplate(providerId);
  }

  saveVisitType(visitType: VisitType): Observable<VisitType> {
    return this.apiService.saveVisitType(visitType);
  }

  deleteVisitType(visitTypeId: number): Observable<void> {
    return this.apiService.deleteVisitType(visitTypeId);
  }

  getScheduleTemplates(): Observable<ScheduleTemplate[]> {
    return this.apiService.getScheduleTemplates();
  }

  getScheduleTemplate(providerId: number): Observable<ScheduleTemplate> {
    return this.apiService.getScheduleTemplate(providerId);
  }

  saveScheduleTemplate(template: ScheduleTemplate): Observable<ScheduleTemplate> {
    return this.apiService.saveScheduleTemplate(template);
  }

  getRegistrationRules(): Observable<RegistrationRule[]> {
    return this.apiService.getRegistrationRules();
  }

  saveRegistrationRule(rule: RegistrationRule): Observable<RegistrationRule> {
    return this.apiService.saveRegistrationRule(rule);
  }

  toggleRegistrationRule(ruleId: number, isActive: boolean): Observable<void> {
    return this.apiService.toggleRegistrationRule(ruleId, isActive);
  }

  deleteRegistrationRule(ruleId: number): Observable<void> {
    return this.apiService.deleteRegistrationRule(ruleId);
  }

  getAlertRules(): Observable<AlertRule[]> {
    return this.apiService.getAlertRules();
  }

  saveAlertRule(rule: AlertRule): Observable<AlertRule> {
    return this.apiService.saveAlertRule(rule);
  }

  toggleAlertRule(ruleId: number, isActive: boolean): Observable<void> {
    return this.apiService.toggleAlertRule(ruleId, isActive);
  }

  deleteAlertRule(ruleId: number): Observable<void> {
    return this.apiService.deleteAlertRule(ruleId);
  }
}
