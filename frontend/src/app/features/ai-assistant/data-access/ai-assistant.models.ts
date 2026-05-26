export interface AiCitation {
  type: string;
  refId: string;
  label: string;
}

export interface AiChatRequest {
  sessionId?: string;
  message: string;
  patientId: number;
  contextType: string;
  contextRefId?: string;
  portal: 'STAFF' | 'MYCHART';
}

export interface AiChatResponse {
  sessionId: string;
  messageId: string;
  answer: string;
  citations: AiCitation[];
  disclaimer: string;
  needsEscalation: boolean;
  needsClinicalReview?: boolean;
  chartGroundingWarning?: boolean;
  blocked: boolean;
  blockedReason?: string;
  timestamp: string;
}

/** Parsed SSE payloads from {@code POST /api/ai/chat/stream}. */
export type ChatStreamEvent =
  | { kind: 'token'; text: string }
  | { kind: 'citations'; citations: AiCitation[] }
  | { kind: 'note'; text: string }
  | { kind: 'done' }
  | { kind: 'error'; message: string };
