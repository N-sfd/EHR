import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';

export interface FeaturesResponse {
  aiEnabled: boolean;
  /** Backend AI audit logging to {@code ai_audit_log} (for future admin indicators / diagnostics). */
  aiAuditEnabled: boolean;
  /** When true, {@code POST /api/ai/chat/stream} is enabled; UI may stream then fall back to {@code /api/ai/chat}. */
  aiStreamingEnabled: boolean;
}

/**
 * Loads {@code GET /api/features} once at app startup (see APP_INITIALIZER in main.ts).
 */
@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private readonly http = inject(HttpClient);
  private readonly data = signal<FeaturesResponse | null>(null);
  private readonly loadFinished = signal(false);

  /** True after the first load attempt completes (success or fallback). */
  readonly ready = computed(() => this.loadFinished());

  /** Whether chart AI is available on the backend (drives admin / future MyChart UI). */
  readonly aiEnabled = computed(() => this.data()?.aiEnabled === true);

  readonly aiAuditEnabled = computed(() => this.data()?.aiAuditEnabled === true);

  readonly aiStreamingEnabled = computed(() => this.data()?.aiStreamingEnabled === true);

  load(): Observable<FeaturesResponse> {
    return this.http.get<FeaturesResponse>('/api/features').pipe(
      tap((r) => {
        this.data.set(r);
        this.loadFinished.set(true);
      }),
      catchError(() => {
        this.data.set({ aiEnabled: false, aiAuditEnabled: false, aiStreamingEnabled: false });
        this.loadFinished.set(true);
        return of({ aiEnabled: false, aiAuditEnabled: false, aiStreamingEnabled: false });
      })
    );
  }
}
