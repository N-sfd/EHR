import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Rooming } from '../models/ambulatory.model';

@Injectable({
  providedIn: 'root'
})
export class RoomingMockService {
  private mockRooming: Rooming[] = [];

  create(rooming: Rooming): Observable<Rooming> {
    const newRooming: Rooming = {
      ...rooming,
      id: this.mockRooming.length + 1
    };
    this.mockRooming.push(newRooming);
    return of(newRooming).pipe(delay(400));
  }

  update(id: number, rooming: Rooming): Observable<Rooming> {
    const index = this.mockRooming.findIndex(r => r.id === id);
    if (index >= 0) {
      this.mockRooming[index] = { ...this.mockRooming[index], ...rooming };
      return of(this.mockRooming[index]).pipe(delay(400));
    }
    return of(rooming).pipe(delay(400));
  }

  get(id: number): Observable<Rooming> {
    const rooming = this.mockRooming.find(r => r.id === id);
    return of(rooming || {
      id: id,
      encounterId: id,
      patientId: 1,
      roomedByStaffId: 1,
      medicationsReviewed: false,
      allergiesReviewed: false
    } as Rooming).pipe(delay(200));
  }

  getByEncounterId(encounterId: number): Observable<Rooming> {
    const rooming = this.mockRooming.find(r => r.encounterId === encounterId);
    return of(rooming || {
      id: undefined,
      encounterId: encounterId,
      patientId: 1,
      roomedByStaffId: 1,
      medicationsReviewed: false,
      allergiesReviewed: false
    } as Rooming).pipe(delay(200));
  }
}

