import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Patient } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientContextService {
  private patientSubject = new BehaviorSubject<Patient | null>(null);
  public patient$: Observable<Patient | null> = this.patientSubject.asObservable();

  setPatient(patient: Patient | null) {
    this.patientSubject.next(patient);
  }

  getPatient(): Patient | null {
    return this.patientSubject.value;
  }

  clear() {
    this.patientSubject.next(null);
  }
}

