import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EligibilityVerification } from '../models/eligibility-verification.model';

@Injectable({
  providedIn: 'root'
})
export class EligibilityVerificationService {
  private http = inject(HttpClient);
  private apiUrl = '/api/eligibility-verifications';

  create(verification: EligibilityVerification): Observable<EligibilityVerification> {
    return this.http.post<EligibilityVerification>(this.apiUrl, verification);
  }

  update(id: number, verification: EligibilityVerification): Observable<EligibilityVerification> {
    return this.http.put<EligibilityVerification>(`${this.apiUrl}/${id}`, verification);
  }

  get(id: number): Observable<EligibilityVerification> {
    return this.http.get<EligibilityVerification>(`${this.apiUrl}/${id}`);
  }

  getByPatientId(patientId: number): Observable<EligibilityVerification[]> {
    return this.http.get<EligibilityVerification[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  getByInsuranceId(insuranceId: number): Observable<EligibilityVerification[]> {
    return this.http.get<EligibilityVerification[]>(`${this.apiUrl}/insurance/${insuranceId}`);
  }

  verify(patientId: number, insuranceId: number): Observable<EligibilityVerification> {
    return this.http.post<EligibilityVerification>(`${this.apiUrl}/verify`, {
      patientId,
      insuranceId
    });
  }
}

