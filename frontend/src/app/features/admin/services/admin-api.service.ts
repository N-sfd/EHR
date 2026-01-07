import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
export class AdminApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api/admin';

  // Provider Templates
  getProviderTemplates(): Observable<ProviderTemplate[]> {
    return this.http.get<ProviderTemplate[]>(`${this.baseUrl}/provider-templates`);
  }

  getProviderTemplate(providerId: number): Observable<ProviderTemplate> {
    return this.http.get<ProviderTemplate>(`${this.baseUrl}/provider-templates/${providerId}`);
  }

  saveVisitType(visitType: VisitType): Observable<VisitType> {
    return visitType.id
      ? this.http.put<VisitType>(`${this.baseUrl}/visit-types/${visitType.id}`, visitType)
      : this.http.post<VisitType>(`${this.baseUrl}/visit-types`, visitType);
  }

  deleteVisitType(visitTypeId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/visit-types/${visitTypeId}`);
  }

  // Schedules
  getScheduleTemplates(): Observable<ScheduleTemplate[]> {
    return this.http.get<ScheduleTemplate[]>(`${this.baseUrl}/schedule-templates`);
  }

  getScheduleTemplate(providerId: number): Observable<ScheduleTemplate> {
    return this.http.get<ScheduleTemplate>(`${this.baseUrl}/schedule-templates/${providerId}`);
  }

  saveScheduleTemplate(template: ScheduleTemplate): Observable<ScheduleTemplate> {
    return template.id
      ? this.http.put<ScheduleTemplate>(`${this.baseUrl}/schedule-templates/${template.id}`, template)
      : this.http.post<ScheduleTemplate>(`${this.baseUrl}/schedule-templates`, template);
  }

  // Registration Rules
  getRegistrationRules(): Observable<RegistrationRule[]> {
    return this.http.get<RegistrationRule[]>(`${this.baseUrl}/registration-rules`);
  }

  saveRegistrationRule(rule: RegistrationRule): Observable<RegistrationRule> {
    return rule.id
      ? this.http.put<RegistrationRule>(`${this.baseUrl}/registration-rules/${rule.id}`, rule)
      : this.http.post<RegistrationRule>(`${this.baseUrl}/registration-rules`, rule);
  }

  toggleRegistrationRule(ruleId: number, isActive: boolean): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/registration-rules/${ruleId}/toggle`, { isActive });
  }

  deleteRegistrationRule(ruleId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/registration-rules/${ruleId}`);
  }

  // Alerts & Warnings
  getAlertRules(): Observable<AlertRule[]> {
    return this.http.get<AlertRule[]>(`${this.baseUrl}/alert-rules`);
  }

  saveAlertRule(rule: AlertRule): Observable<AlertRule> {
    return rule.id
      ? this.http.put<AlertRule>(`${this.baseUrl}/alert-rules/${rule.id}`, rule)
      : this.http.post<AlertRule>(`${this.baseUrl}/alert-rules`, rule);
  }

  toggleAlertRule(ruleId: number, isActive: boolean): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/alert-rules/${ruleId}/toggle`, { isActive });
  }

  deleteAlertRule(ruleId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/alert-rules/${ruleId}`);
  }
}

