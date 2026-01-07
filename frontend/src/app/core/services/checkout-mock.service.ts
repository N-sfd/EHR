import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Checkout } from '../models/ambulatory.model';

@Injectable({
  providedIn: 'root'
})
export class CheckoutMockService {
  private mockCheckouts: Checkout[] = [];

  create(checkout: Checkout): Observable<Checkout> {
    const newCheckout: Checkout = {
      ...checkout,
      id: this.mockCheckouts.length + 1,
      isComplete: false
    };
    this.mockCheckouts.push(newCheckout);
    return of(newCheckout).pipe(delay(400));
  }

  update(id: number, checkout: Checkout): Observable<Checkout> {
    const index = this.mockCheckouts.findIndex(c => c.id === id);
    if (index >= 0) {
      this.mockCheckouts[index] = { ...this.mockCheckouts[index], ...checkout };
      return of(this.mockCheckouts[index]).pipe(delay(400));
    }
    return of(checkout).pipe(delay(400));
  }

  get(id: number): Observable<Checkout> {
    const checkout = this.mockCheckouts.find(c => c.id === id);
    return of(checkout || {
      id: id,
      encounterId: id,
      patientId: 1,
      checkedOutByStaffId: 1,
      isComplete: false
    } as Checkout).pipe(delay(200));
  }

  getByEncounterId(encounterId: number): Observable<Checkout> {
    const checkout = this.mockCheckouts.find(c => c.encounterId === encounterId);
    return of(checkout || {
      id: undefined,
      encounterId: encounterId,
      patientId: 1,
      checkedOutByStaffId: 1,
      isComplete: false
    } as Checkout).pipe(delay(200));
  }
}

