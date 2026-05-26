CREATE INDEX IF NOT EXISTS idx_ai_chat_session_user_id
    ON ai_chat_session(user_id);

CREATE INDEX IF NOT EXISTS idx_ai_chat_session_patient_id
    ON ai_chat_session(patient_id);

CREATE INDEX IF NOT EXISTS idx_ai_chat_message_session_id
    ON ai_chat_message(session_id);

CREATE INDEX IF NOT EXISTS idx_ai_audit_log_user_id
    ON ai_audit_log(user_id);

CREATE INDEX IF NOT EXISTS idx_ai_audit_log_patient_id
    ON ai_audit_log(patient_id);

CREATE INDEX IF NOT EXISTS idx_ai_document_chunk_source
    ON ai_document_chunk(source_type, source_ref);

CREATE INDEX IF NOT EXISTS idx_ai_document_chunk_patient_id
    ON ai_document_chunk(patient_id);

CREATE INDEX IF NOT EXISTS idx_ai_document_chunk_embedding_cosine
    ON ai_document_chunk
    USING hnsw (embedding vector_cosine_ops);
