import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { 
  VisitType, 
  NoteTemplate, 
  OrderSet, 
  ProviderTemplate,
  ScheduleTemplate,
  RegistrationRule,
  AlertRule
} from '../models/admin.model';
import { unwrap } from '../../../core/api/api-base';

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private http = inject(HttpClient);
  // Keep proxy-friendly: if apiUrl is empty, this becomes '' and you call /api/...
  readonly baseUrl = environment.apiUrl ?? '';

  // Standard request helpers
  private get<T>(path: string): Observable<T> {
    return this.http.get<T>(this.baseUrl + path, { withCredentials: true });
  }

  private post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(this.baseUrl + path, body, { withCredentials: true });
  }

  private put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(this.baseUrl + path, body, { withCredentials: true });
  }

  private delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(this.baseUrl + path, { withCredentials: true });
  }

  private patch<T>(path: string, body: any): Observable<T> {
    return this.http.patch<T>(this.baseUrl + path, body, { withCredentials: true });
  }

  // Provider Templates
  getProviderTemplates(): Observable<ProviderTemplate[]> {
    return this.get<any>('/api/admin/provider-templates').pipe(
      map(response => unwrap<ProviderTemplate[]>(response) || [])
    );
  }

  getProviderTemplate(providerId: number): Observable<ProviderTemplate> {
    return this.get<any>(`/api/admin/provider-templates/${providerId}`).pipe(
      map(response => unwrap<ProviderTemplate>(response))
    );
  }

  saveVisitType(visitType: VisitType): Observable<VisitType> {
    if (visitType.id) {
      return this.put<any>(`/api/admin/visit-types/${visitType.id}`, visitType).pipe(
        map(response => unwrap<VisitType>(response))
      );
    } else {
      return this.post<any>('/api/admin/visit-types', visitType).pipe(
        map(response => unwrap<VisitType>(response))
      );
    }
  }

  deleteVisitType(visitTypeId: number): Observable<void> {
    return this.delete<void>(`/api/admin/visit-types/${visitTypeId}`);
  }

  // Schedules
  getScheduleTemplates(): Observable<ScheduleTemplate[]> {
    return this.get<any>('/api/admin/schedule-templates').pipe(
      map(response => unwrap<ScheduleTemplate[]>(response) || [])
    );
  }

  getScheduleTemplate(providerId: number): Observable<ScheduleTemplate> {
    return this.get<any>(`/api/admin/schedule-templates/${providerId}`).pipe(
      map(response => unwrap<ScheduleTemplate>(response))
    );
  }

  saveScheduleTemplate(template: ScheduleTemplate): Observable<ScheduleTemplate> {
    if (template.id) {
      return this.put<any>(`/api/admin/schedule-templates/${template.id}`, template).pipe(
        map(response => unwrap<ScheduleTemplate>(response))
      );
    } else {
      return this.post<any>('/api/admin/schedule-templates', template).pipe(
        map(response => unwrap<ScheduleTemplate>(response))
      );
    }
  }

  // Registration Rules
  getRegistrationRules(): Observable<RegistrationRule[]> {
    return this.get<any>('/api/admin/registration-rules').pipe(
      map(response => unwrap<RegistrationRule[]>(response) || [])
    );
  }

  saveRegistrationRule(rule: RegistrationRule): Observable<RegistrationRule> {
    if (rule.id) {
      return this.put<any>(`/api/admin/registration-rules/${rule.id}`, rule).pipe(
        map(response => unwrap<RegistrationRule>(response))
      );
    } else {
      return this.post<any>('/api/admin/registration-rules', rule).pipe(
        map(response => unwrap<RegistrationRule>(response))
      );
    }
  }

  toggleRegistrationRule(ruleId: number, isActive: boolean): Observable<void> {
    return this.patch<void>(`/api/admin/registration-rules/${ruleId}/toggle`, { isActive });
  }

  deleteRegistrationRule(ruleId: number): Observable<void> {
    return this.delete<void>(`/api/admin/registration-rules/${ruleId}`);
  }

  // Alerts & Warnings
  getAlertRules(): Observable<AlertRule[]> {
    return this.get<any>('/api/admin/alert-rules').pipe(
      map(response => unwrap<AlertRule[]>(response) || [])
    );
  }

  saveAlertRule(rule: AlertRule): Observable<AlertRule> {
    if (rule.id) {
      return this.put<any>(`/api/admin/alert-rules/${rule.id}`, rule).pipe(
        map(response => unwrap<AlertRule>(response))
      );
    } else {
      return this.post<any>('/api/admin/alert-rules', rule).pipe(
        map(response => unwrap<AlertRule>(response))
      );
    }
  }

  toggleAlertRule(ruleId: number, isActive: boolean): Observable<void> {
    return this.patch<void>(`/api/admin/alert-rules/${ruleId}/toggle`, { isActive });
  }

  deleteAlertRule(ruleId: number): Observable<void> {
    return this.delete<void>(`/api/admin/alert-rules/${ruleId}`);
  }
}

