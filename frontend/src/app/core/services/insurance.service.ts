import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Insurance } from '../models/insurance.model';

@Injectable({
  providedIn: 'root'
})
export class InsuranceService {
  private http = inject(HttpClient);
  private apiUrl = '/api/insurances';

  create(insurance: Insurance): Observable<Insurance> {
    return this.http.post<Insurance>(this.apiUrl, insurance);
  }

  update(id: number, insurance: Insurance): Observable<Insurance> {
    return this.http.put<Insurance>(`${this.apiUrl}/${id}`, insurance);
  }

  get(id: number): Observable<Insurance> {
    return this.http.get<Insurance>(`${this.apiUrl}/${id}`);
  }

  getByPatientId(patientId: number): Observable<Insurance[]> {
    return this.http.get<Insurance[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

