import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Checkout } from '../models/ambulatory.model';
import { CheckoutMockService } from './checkout-mock.service';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private http = inject(HttpClient);
  private mockService = inject(CheckoutMockService);
  private apiUrl = '/api/checkouts';
  private useMock = environment.useMock !== false;

  create(checkout: Checkout): Observable<Checkout> {
    if (this.useMock) {
      return this.mockService.create(checkout);
    }
    return this.http.post<Checkout>(this.apiUrl, checkout).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.create(checkout);
      })
    );
  }

  update(id: number, checkout: Checkout): Observable<Checkout> {
    if (this.useMock) {
      return this.mockService.update(id, checkout);
    }
    return this.http.put<Checkout>(`${this.apiUrl}/${id}`, checkout).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.update(id, checkout);
      })
    );
  }

  get(id: number): Observable<Checkout> {
    if (this.useMock) {
      return this.mockService.get(id);
    }
    return this.http.get<Checkout>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.get(id);
      })
    );
  }

  getByEncounterId(encounterId: number): Observable<Checkout> {
    if (this.useMock) {
      return this.mockService.getByEncounterId(encounterId);
    }
    return this.http.get<Checkout>(`${this.apiUrl}/encounter/${encounterId}`).pipe(
      catchError(err => {
        console.warn('API failed, using mock data:', err);
        return this.mockService.getByEncounterId(encounterId);
      })
    );
  }

  complete(id: number): Observable<Checkout> {
    return this.http.patch<Checkout>(`${this.apiUrl}/${id}/complete`, {});
  }
}

