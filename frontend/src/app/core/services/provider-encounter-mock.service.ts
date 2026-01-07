import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ProviderEncounter } from '../models/ambulatory.model';

@Injectable({
  providedIn: 'root'
})
export class ProviderEncounterMockService {
  private mockEncounters: ProviderEncounter[] = [];

  create(encounter: ProviderEncounter): Observable<ProviderEncounter> {
    const newEncounter: ProviderEncounter = {
      ...encounter,
      id: this.mockEncounters.length + 1,
      isSigned: false,
      isComplete: false
    };
    this.mockEncounters.push(newEncounter);
    return of(newEncounter).pipe(delay(400));
  }

  update(id: number, encounter: ProviderEncounter): Observable<ProviderEncounter> {
    const index = this.mockEncounters.findIndex(e => e.id === id);
    if (index >= 0) {
      this.mockEncounters[index] = { ...this.mockEncounters[index], ...encounter };
      return of(this.mockEncounters[index]).pipe(delay(400));
    }
    return of(encounter).pipe(delay(400));
  }

  get(id: number): Observable<ProviderEncounter> {
    const encounter = this.mockEncounters.find(e => e.id === id);
    return of(encounter || {
      id: id,
      encounterId: id,
      patientId: 1,
      providerId: 1,
      isSigned: false,
      isComplete: false
    } as ProviderEncounter).pipe(delay(200));
  }

  getByEncounterId(encounterId: number): Observable<ProviderEncounter> {
    const encounter = this.mockEncounters.find(e => e.encounterId === encounterId);
    return of(encounter || {
      id: undefined,
      encounterId: encounterId,
      patientId: 1,
      providerId: 1,
      isSigned: false,
      isComplete: false
    } as ProviderEncounter).pipe(delay(200));
  }

  sign(id: number, staffId: number): Observable<ProviderEncounter> {
    const encounter = this.mockEncounters.find(e => e.id === id);
    if (encounter) {
      encounter.isSigned = true;
      return of(encounter).pipe(delay(300));
    }
    return this.get(id);
  }
}

