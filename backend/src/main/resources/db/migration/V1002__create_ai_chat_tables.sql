CREATE TABLE IF NOT EXISTS ai_chat_session (
    id UUID PRIMARY KEY,
    user_id BIGINT NOT NULL,
    patient_id BIGINT NULL,
    role VARCHAR(32) NOT NULL,
    portal VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_chat_message (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES ai_chat_session(id) ON DELETE CASCADE,
    sender VARCHAR(16) NOT NULL,
    content TEXT NOT NULL,
    model_name VARCHAR(128),
    prompt_tokens INT,
    completion_tokens INT,
    blocked BOOLEAN NOT NULL DEFAULT FALSE,
    blocked_reason VARCHAR(255),
    citations_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_audit_log (
    id UUID PRIMARY KEY,
    session_id UUID NULL REFERENCES ai_chat_session(id) ON DELETE SET NULL,
    user_id BIGINT NOT NULL,
    patient_id BIGINT NULL,
    request_type VARCHAR(64) NOT NULL,
    request_json JSONB,
    response_json JSONB,
    allowed_context_json JSONB,
    blocked BOOLEAN NOT NULL DEFAULT FALSE,
    blocked_reason VARCHAR(255),
    latency_ms BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_feedback (
    id UUID PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES ai_chat_message(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL,
    rating VARCHAR(16) NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
