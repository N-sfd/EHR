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
  readonly flags = inject(FeatureFlagsService);
  private readonly route = inject(ActivatedRoute);
  private readonly patientService = inject(PatientService);
  private readonly appointmentService = inject(AppointmentService);

  get aiEnabled(): boolean {
    return this.flags.aiEnabled();
  }

  get aiOllama(): boolean {
    return this.flags.aiOllama();
  }

  get aiStatusLabel(): string {
    if (!this.aiEnabled) return 'AI not configured';
    if (this.aiOllama) {
      const model = this.flags.aiChatModel();
      return model ? `Ollama · ${model}` : 'Ollama (local)';
    }
    return 'AI online';
  }

  get aiStreamingEnabled(): boolean {
    return this.flags.aiStreamingEnabled();
  }
  info = signal<string | null>(null);

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

  copySetupCommand(): void {
    const cmd = this.aiOllama || !this.aiEnabled
      ? "# Local Ollama (PowerShell)\r\n# Ollama already installed — restart API with:\r\n.\\stop-backend.ps1\r\n.\\start-backend.ps1 -Ollama"
      : "Set environment: EHR_AI_ENABLED=true && set OPENAI_API_KEY=your_key_here";
    try {
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(cmd).then(() => {
          this.info.set('Setup command copied to clipboard');
          setTimeout(() => this.info.set(null), 3500);
        }).catch(() => {
          alert(cmd);
        });
      } else {
        // Fallback for older browsers
        alert(cmd);
      }
    } catch (e) {
      alert(cmd);
    }
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

    if (!this.aiStreamingEnabled) {
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
        const isUnavailable = err?.status === 503 || err?.status === 404 || err?.status === 500;
        if (isUnavailable) {
          this.handleAiUnavailable(req.message);
        } else {
          this.updateLastMessage(m => ({ ...m, text: 'Unable to get a response. Please try again.', isStreaming: false }));
          this.error.set('Request failed — please retry.');
          this.loading.set(false);
        }
      }
    });
  }

  private handleAiUnavailable(message: string): void {
    const lower = message.toLowerCase();
    let reply = '';

    if (/schedule|appointment|slot|calendar|book|waitlist/.test(lower)) {
      reply = this.patientId()
        ? `AI is not fully configured on this server. For ${this.patientLabel}, open Appointments or use Schedule Grid to view and book slots.\n\nTo enable AI: set EHR_AI_ENABLED=true and provide OPENAI_API_KEY (or EHR_AI_OLLAMA=true for local Ollama), then restart the backend.`
        : `AI is not fully configured on this server. Use Schedule Grid or New Appointment to manage the calendar.\n\nTo enable AI: set EHR_AI_ENABLED=true with OPENAI_API_KEY or local Ollama.`;
    } else if (/patient|mrn|demographic|contact/.test(lower)) {
      reply = `AI is not fully configured. Patient records are available under Patients in the sidebar.\n\nTo enable AI: set EHR_AI_ENABLED=true and restart the backend.`;
    } else {
      reply = `AI backend is not configured (EHR_AI_ENABLED=false).\n\nTo enable the assistant:\n1. Set EHR_AI_ENABLED=true\n2. Set OPENAI_API_KEY (or EHR_AI_OLLAMA=true for Ollama)\n3. Restart the backend\n\nYou can still use scheduling, patients, and reports without AI.`;
    }

    this.updateLastMessage(m => ({ ...m, text: reply, isStreaming: false }));
    this.error.set('AI backend not configured. See response for setup steps.');
    this.loading.set(false);
  }
}
