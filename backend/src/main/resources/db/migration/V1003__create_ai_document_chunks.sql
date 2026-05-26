CREATE TABLE IF NOT EXISTS ai_document_chunk (
    id UUID PRIMARY KEY,
    source_type VARCHAR(64) NOT NULL,
    source_ref VARCHAR(128) NOT NULL,
    patient_id BIGINT NULL,
    title VARCHAR(255),
    chunk_text TEXT NOT NULL,
    metadata_json JSONB,
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
