import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Location } from '../models/location.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<Location[]> {
    return this.apiService.get<Location[]>('/api/locations').pipe(
      catchError((error) => {
        // Silently handle connection errors - return empty array
        console.warn('Location service unavailable, returning empty array');
        return of([]);
      })
    );
  }

  getById(id: number): Observable<Location> {
    return this.apiService.get<Location>(`/api/locations/${id}`);
  }

  create(location: Location): Observable<Location> {
    return this.apiService.post<Location>('/api/locations', location);
  }

  update(id: number, location: Location): Observable<Location> {
    return this.apiService.put<Location>(`/api/locations/${id}`, location);
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`/api/locations/${id}`);
  }

  getImageUrl(id: number): string {
    return `${environment.apiUrl}/api/locations/${id}/image`;
  }
}

