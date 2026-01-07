import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl || '';

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }
    console.error('OrderService error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  getAll(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/api/orders`).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/api/orders/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getByPatientId(patientId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/api/orders/patient/${patientId}`).pipe(
      catchError(this.handleError)
    );
  }

  getActiveByPatientId(patientId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/api/orders/patient/${patientId}/active`).pipe(
      catchError(this.handleError)
    );
  }

  getByOrderType(orderType: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/api/orders/type/${orderType}`).pipe(
      catchError(this.handleError)
    );
  }

  getByStatus(status: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/api/orders/status/${status}`).pipe(
      catchError(this.handleError)
    );
  }

  create(order: Partial<Order>): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/api/orders`, order).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, order: Partial<Order>): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/api/orders/${id}`, order).pipe(
      catchError(this.handleError)
    );
  }

  verify(id: number, verifiedByStaffId: number): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/api/orders/${id}/verify`, { verifiedByStaffId }).pipe(
      catchError(this.handleError)
    );
  }

  discontinue(id: number, reason: string, discontinuedByStaffId: number): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/api/orders/${id}/discontinue`, { reason, discontinuedByStaffId }).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/orders/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}

