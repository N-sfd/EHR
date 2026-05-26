import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, options?: { params?: Record<string, any> }): Observable<T> {
    const opts = { ...options, withCredentials: true };
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, opts);
  }

  post<T>(endpoint: string, data: any, options?: { params?: Record<string, any> }): Observable<T> {
    const opts = { ...options, withCredentials: true };
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data, opts);
  }

  put<T>(endpoint: string, data: any, options?: { params?: Record<string, any> }): Observable<T> {
    const opts = { ...options, withCredentials: true };
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, data, opts);
  }

  delete<T>(endpoint: string, options?: { params?: Record<string, any> }): Observable<T> {
    const opts = { ...options, withCredentials: true };
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`, opts);
  }
}


