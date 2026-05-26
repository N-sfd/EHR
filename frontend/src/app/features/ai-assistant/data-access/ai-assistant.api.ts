import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AiChatRequest,
  AiChatResponse,
  AiCitation,
  ChatStreamEvent
} from './ai-assistant.models';

@Injectable({ providedIn: 'root' })
export class AiAssistantApi {
  private readonly http = inject(HttpClient);

  chat(request: AiChatRequest): Observable<AiChatResponse> {
    return this.http.post<AiChatResponse>('/api/ai/chat', request, {
      withCredentials: true
    });
  }

  /**
   * POST + fetch streaming (EventSource cannot send a JSON body).
   * Emits token/citations/done/error events; completes after {@code done} or abort.
   */
  streamChatEvents(request: AiChatRequest): Observable<ChatStreamEvent> {
    return new Observable<ChatStreamEvent>((observer) => {
      const ac = new AbortController();

      void (async () => {
        try {
          const res = await fetch('/api/ai/chat/stream', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'text/event-stream',
              'Cache-Control': 'no-cache'
            },
            credentials: 'include',
            body: JSON.stringify(request),
            signal: ac.signal
          });

          if (!res.ok) {
            observer.error(new Error(`stream ${res.status}`));
            return;
          }

          const reader = res.body!.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }
            buffer += decoder.decode(value, { stream: true });

            let sep: number;
            while ((sep = buffer.indexOf('\n\n')) >= 0) {
              const rawEvent = buffer.slice(0, sep);
              buffer = buffer.slice(sep + 2);

              for (const line of rawEvent.split(/\r?\n/)) {
                const trimmed = line.trim();
                if (!trimmed.startsWith('data:')) {
                  continue;
                }
                const json = trimmed.slice(5).trim();
                if (!json) {
                  continue;
                }
                const data = JSON.parse(json) as {
                  type: string;
                  content?: string;
                  citations?: AiCitation[];
                  message?: string;
                };

                if (data.type === 'token' && data.content != null) {
                  observer.next({ kind: 'token', text: data.content });
                } else if (data.type === 'citations' && data.citations) {
                  observer.next({ kind: 'citations', citations: data.citations });
                } else if (data.type === 'note' && data.message != null) {
                  observer.next({ kind: 'note', text: data.message });
                } else if (data.type === 'done') {
                  observer.next({ kind: 'done' });
                  observer.complete();
                  return;
                } else if (data.type === 'error') {
                  const msg = data.message || 'Stream error';
                  observer.next({ kind: 'error', message: msg });
                  observer.error(new Error(msg));
                  return;
                }
              }
            }
          }

          observer.complete();
        } catch (e) {
          if ((e as Error).name === 'AbortError') {
            observer.complete();
          } else {
            observer.error(e);
          }
        }
      })();

      return () => ac.abort();
    });
  }
}
