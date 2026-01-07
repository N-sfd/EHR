import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Provider } from '../models/provider.model';
import { ProviderMockService } from './provider-mock.service';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {
  private apiUrl = '/api/providers';
  private useMock = true; // Always use mock for now, can be configured via environment

  constructor(
    private http: HttpClient,
    private mockService: ProviderMockService
  ) {}

  getProviders(): Observable<Provider[]> {
    if (this.useMock) {
      return this.mockService.getProviders();
    }

    return this.http.get<Provider[]>(this.apiUrl).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.getProviders();
      })
    );
  }

  getProviderById(id: number): Observable<Provider> {
    if (this.useMock) {
      return this.mockService.getProviderById(id);
    }

    return this.http.get<Provider>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.getProviderById(id);
      })
    );
  }

  seedDemoProviders(): Observable<Provider[]> {
    return this.mockService.seedDemoProviders();
  }
}

