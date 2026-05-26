import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription, forkJoin, catchError, of } from 'rxjs';
import { AiAssistantApi } from '../data-access/ai-assistant.api';
import { AiChatRequest, AiChatResponse, AiCitation } from '../data-access/ai-assistant.models';
import { FeatureFlagsService } from '../../../core/services/feature-flags.service';
import { PatientService } from '../../../core/services/patient.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Patient } from '../../../core/models/patient.model';

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  upcomingAppointments: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  citations?: AiCitation[];
  meta?: AiChatResponse | null;
  streamNote?: string | null;
  isStreaming?: boolean;
}

@Component({
  selector: 'app-assistant-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assistant-panel.component.html',
  styleUrl: './assistant-panel.component.css'
})
export class AssistantPanelComponent implements OnInit, OnDestroy {
  private readonly api = inject(AiAssistantApi);
  private readonly flags = inject(FeatureFlagsService);
  private readonly route = inject(ActivatedRoute);
  private readonly patientService = inject(PatientService);
  private readonly appointmentService = inject(AppointmentService);

  patientId = signal<number>(0);
  patient = signal<Patient | null>(null);
  stats = signal<DashboardStats | null>(null);
  input = '';
  messages = signal<ChatMessage[]>([]);

  loading = signal(false);
  error = signal<string | null>(null);

  private currentStream?: Subscription;
  private tokenBatch = '';
  private batchTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('patientId')
      || this.route.snapshot.queryParamMap.get('patientId');
    if (id) {
      this.patientId.set(+id);
      this.patientService.getById(+id).subscribe({
        next: p => this.patient.set(p),
        error: () => {}
      });
    }
    this.loadDashboardStats();
  }

  private loadDashboardStats(): void {
    const today = new Date().toISOString().slice(0, 10);
    forkJoin({
      patients: this.patientService.getAll().pipe(catchError(() => of([]))),
      appointments: this.appointmentService.getAll().pipe(catchError(() => of([])))
    }).subscribe(({ patients, appointments }) => {
      const todayApts = appointments.filter(a =>
        (a.appointmentDate || a.date || '').startsWith(today)
      ).length;
      const upcoming = appointments.filter(a =>
        (a.appointmentDate || a.date || '') >= today && a.status !== 'Cancelled'
      ).length;
      this.stats.set({
        totalPatients: patients.length,
        todayAppointments: todayApts,
        upcomingAppointments: upcoming
      });
    });
  }

  ngOnDestroy(): void {
    this.currentStream?.unsubscribe();
    this.clearBatchTimer();
  }

  get patientLabel(): string {
    const p = this.patient();
    if (p) return `${p.firstName} ${p.lastName}`;
    const id = this.patientId();
    return id ? `Patient #${id}` : 'General Query';
  }

  submit(): void {
    const message = this.input.trim();
    if (!message || this.loading()) return;

    this.messages.update(msgs => [...msgs, {
      role: 'user',
      text: message,
      timestamp: new Date()
    }]);
    this.input = '';
    this.error.set(null);

    this.stopStreamInternal(false);
    this.loading.set(true);

    const assistantMsg: ChatMessage = {
      role: 'assistant',
      text: '',
      timestamp: new Date(),
      isStreaming: true
    };
    this.messages.update(msgs => [...msgs, assistantMsg]);

    const req: AiChatRequest = {
      message,
      patientId: this.patientId() || 1,
      contextType: 'GENERAL',
      contextRefId: this.patientId() ? String(this.patientId()) : 'general',
      portal: 'STAFF'
    };

    if (!this.flags.aiStreamingEnabled()) {
      this.runChatOnly(req);
      return;
    }

    this.tokenBatch = '';
    this.currentStream = this.api.streamChatEvents(req).subscribe({
      next: (ev) => {
        if (ev.kind === 'token') {
          this.enqueueTokens(ev.text);
        } else if (ev.kind === 'citations') {
          this.updateLastMessage(m => ({ ...m, citations: ev.citations }));
        } else if (ev.kind === 'note') {
          this.updateLastMessage(m => ({ ...m, streamNote: ev.text }));
        } else if (ev.kind === 'done') {
          this.flushTokenBatchNow();
        } else if (ev.kind === 'error') {
          this.error.set(ev.message);
        }
      },
      error: () => {
        this.flushTokenBatchNow();
        this.runChatOnly(req);
      },
      complete: () => {
        this.flushTokenBatchNow();
        this.updateLastMessage(m => ({ ...m, isStreaming: false }));
        this.loading.set(false);
        this.currentStream = undefined;
      }
    });
  }

  stop(): void {
    this.stopStreamInternal(true);
    this.updateLastMessage(m => ({ ...m, isStreaming: false }));
  }

  clearChat(): void {
    this.messages.set([]);
    this.error.set(null);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit();
    }
  }

  private updateLastMessage(updater: (m: ChatMessage) => ChatMessage): void {
    this.messages.update(msgs => {
      if (msgs.length === 0) return msgs;
      const last = msgs[msgs.length - 1];
      return [...msgs.slice(0, -1), updater(last)];
    });
  }

  private stopStreamInternal(clearLoading: boolean): void {
    this.currentStream?.unsubscribe();
    this.currentStream = undefined;
    this.clearBatchTimer();
    if (clearLoading) this.loading.set(false);
  }

  private clearBatchTimer(): void {
    if (this.batchTimer !== null) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }

  private enqueueTokens(text: string): void {
    this.tokenBatch += text;
    if (this.batchTimer !== null) return;
    this.batchTimer = setTimeout(() => this.flushTokenBatch(), 5);
  }

  private flushTokenBatch(): void {
    this.batchTimer = null;
    if (!this.tokenBatch) return;
    const chunk = this.tokenBatch;
    this.tokenBatch = '';
    this.updateLastMessage(m => ({ ...m, text: m.text + chunk }));
    if (this.tokenBatch) this.batchTimer = setTimeout(() => this.flushTokenBatch(), 5);
  }

  private flushTokenBatchNow(): void {
    this.clearBatchTimer();
    if (this.tokenBatch) {
      const chunk = this.tokenBatch;
      this.tokenBatch = '';
      this.updateLastMessage(m => ({ ...m, text: m.text + chunk }));
    }
  }

  private runChatOnly(req: AiChatRequest): void {
    this.api.chat(req).subscribe({
      next: (res) => {
        this.updateLastMessage(m => ({
          ...m,
          text: res.answer,
          citations: res.citations ?? [],
          streamNote: res.chartGroundingWarning
            ? 'Some numeric details may not match chart context; confirm with your clinician.'
            : null,
          meta: res,
          isStreaming: false
        }));
        this.loading.set(false);
      },
      error: (err) => {
        const is503 = err?.status === 503 || err?.status === 404 || err?.status === 500;
        const msg = is503
          ? 'AI service is not configured on this server. Enable it by setting EHR_AI_ENABLED=true with a valid OPENAI_API_KEY.'
          : 'Unable to get a response. Please try again.';
        this.updateLastMessage(m => ({ ...m, text: msg, isStreaming: false }));
        this.error.set(is503 ? 'AI backend not configured (EHR_AI_ENABLED=false).' : 'Request failed — please retry.');
        this.loading.set(false);
      }
    });
  }
}
