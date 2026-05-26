ALTER TABLE ai_document_chunk
    ADD COLUMN IF NOT EXISTS audience VARCHAR(16) NOT NULL DEFAULT 'BOTH';

ALTER TABLE ai_document_chunk
    ADD COLUMN IF NOT EXISTS portal VARCHAR(16) NOT NULL DEFAULT 'BOTH';

ALTER TABLE ai_document_chunk
    ADD COLUMN IF NOT EXISTS department_id BIGINT NULL;

ALTER TABLE ai_document_chunk
    ADD COLUMN IF NOT EXISTS effective_date DATE NULL;

ALTER TABLE ai_document_chunk
    ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE ai_document_chunk
    ADD COLUMN IF NOT EXISTS content_version INT NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_ai_document_chunk_retrieval
    ON ai_document_chunk (status, portal, audience)
    WHERE embedding IS NOT NULL;
