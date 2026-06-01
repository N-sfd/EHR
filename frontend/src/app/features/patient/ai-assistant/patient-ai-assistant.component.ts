import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, of } from 'rxjs';
import { FeatureFlagsService } from '../../../core/services/feature-flags.service';

interface ChatMessage { role: 'user' | 'assistant'; text: string; timestamp: Date; isLoading?: boolean; }

@Component({
  selector: 'app-patient-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './patient-ai-assistant.component.html',
  styleUrls: ['./patient-ai-assistant.component.css']
})
export class PatientAiAssistantComponent implements OnInit {
  private http    = inject(HttpClient);
  private flags   = inject(FeatureFlagsService);

  isLoading  = signal(true);
  isSending  = signal(false);
  input      = '';
  messages   = signal<ChatMessage[]>([]);
  activeTab  = signal<'chat' | 'labs' | 'meds' | 'vitals'>('chat');

  patientId: number | null = null;
  labs:  any[] = [];
  meds:  any[] = [];
  aiEnabled = false;

  readonly vitalsMock = [
    { name: 'Blood Pressure', value: '—', unit: 'mmHg', icon: 'fa-heart-pulse',  color: '#dc2626', note: 'Not yet recorded' },
    { name: 'Heart Rate',     value: '—', unit: 'bpm',  icon: 'fa-heartbeat',    color: '#059669', note: 'Not yet recorded' },
    { name: 'Temperature',    value: '—', unit: '°F',   icon: 'fa-thermometer',  color: '#d97706', note: 'Not yet recorded' },
    { name: 'Weight',         value: '—', unit: 'lbs',  icon: 'fa-weight-scale', color: '#7c3aed', note: 'Not yet recorded' },
    { name: 'O₂ Saturation',  value: '—', unit: '%',    icon: 'fa-lungs',        color: '#0891b2', note: 'Not yet recorded' },
    { name: 'Blood Glucose',  value: '—', unit: 'mg/dL',icon: 'fa-droplet',      color: '#db2777', note: 'See Lab Results' },
  ];

  ngOnInit(): void {
    this.aiEnabled = this.flags.aiEnabled();
    this.http.get<any>('/api/patient/smart/session', { withCredentials: true })
      .pipe(catchError(() => of(null)))
      .subscribe(session => {
        this.patientId = session?.patientId ?? null;
        this.loadPatientData();
      });
  }

  private loadPatientData(): void {
    forkJoin({
      labs: this.http.get<any[]>('/api/results/labs', { withCredentials: true }).pipe(catchError(() => of([]))),
      meds: this.http.get<any[]>('/api/meds',         { withCredentials: true }).pipe(catchError(() => of([])))
    }).subscribe(({ labs, meds }) => {
      this.labs = (labs || []).sort((a, b) =>
        new Date(b.resultDate || b.orderDate || 0).getTime() -
        new Date(a.resultDate || a.orderDate || 0).getTime()
      );
      this.meds = meds || [];
      this.isLoading.set(false);
    });
  }

  setTab(t: 'chat' | 'labs' | 'meds' | 'vitals'): void { this.activeTab.set(t); }

  quickAsk(query: string): void {
    this.setTab('chat');
    this.input = query;
    this.send();
  }

  send(): void {
    const text = this.input.trim();
    if (!text || this.isSending()) return;
    this.input = '';
    this.messages.update(m => [...m, { role: 'user', text, timestamp: new Date() }]);
    this.messages.update(m => [...m, { role: 'assistant', text: '', timestamp: new Date(), isLoading: true }]);
    this.isSending.set(true);

    if (this.aiEnabled) {
      this.callAiBackend(text);
    } else {
      this.ruleBasedResponse(text);
    }
  }

  private callAiBackend(message: string): void {
    this.http.post<any>('/api/ai/chat',
      { message, patientId: this.patientId || 1, contextType: 'GENERAL', portal: 'MYCHART' },
      { withCredentials: true }
    ).pipe(catchError(() => of(null)))
      .subscribe(res => {
        const reply = res?.answer || 'For personalized medical advice, please contact your care team directly.';
        this.resolveLastMessage(reply);
      });
  }

  private ruleBasedResponse(_q: string): void {
    setTimeout(() => {
      const reply =
        'AI is not configured on this server.\n\n' +
        'To review lab results: open a patient profile and click "Lab Results".\n\n' +
        'To enable AI: set EHR_AI_ENABLED=true with a valid OPENAI_API_KEY.';
      this.resolveLastMessage(reply);
    }, 400);
  }

  private resolveLastMessage(text: string): void {
    this.messages.update(msgs => {
      const copy = [...msgs];
      copy[copy.length - 1] = { ...copy[copy.length - 1], text, isLoading: false };
      return copy;
    });
    this.isSending.set(false);
  }

  get activeMedsCount(): number   { return this.meds.filter(m => m.isActive).length; }
  get inactiveMedsCount(): number { return this.meds.filter(m => !m.isActive).length; }

  statusClass(s: string): string {
    if (!s) return 'status-normal';
    if (s === 'ABNORMAL') return 'status-abnormal';
    if (s === 'CRITICAL')  return 'status-critical';
    return 'status-normal';
  }

  statusLabel(s: string): string {
    if (s === 'ABNORMAL') return '⚠ Abnormal';
    if (s === 'CRITICAL')  return '🔴 Critical';
    return '✓ Normal';
  }

  clearChat(): void { this.messages.set([]); }

  onKey(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); }
  }
}
