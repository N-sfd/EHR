import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProviderTemplate } from '../../features/admin/models/admin.model';
import { Provider } from '../models/provider.model';

/**
 * Service for managing provider templates.
 * Uses /api/provider-templates endpoints (relative URLs, proxy-friendly).
 */
@Injectable({
  providedIn: 'root'
})
export class ProviderTemplateService {
  private http = inject(HttpClient);

  /**
   * List all providers
   */
  listProviders(): Observable<Provider[]> {
    return this.http.get<Provider[]>('/api/providers', { withCredentials: true });
  }

  /**
   * List templates for a provider
   */
  listTemplates(providerId: number): Observable<ProviderTemplate[]> {
    return this.http.get<ProviderTemplate[]>(`/api/provider-templates?providerId=${providerId}`, { withCredentials: true });
  }

  /**
   * Get a specific template by ID
   */
  getTemplate(id: number): Observable<ProviderTemplate> {
    return this.http.get<ProviderTemplate>(`/api/provider-templates/${id}`, { withCredentials: true });
  }
}

