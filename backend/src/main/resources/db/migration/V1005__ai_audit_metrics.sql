ALTER TABLE ai_audit_log
    ADD COLUMN IF NOT EXISTS success BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE ai_audit_log
    ADD COLUMN IF NOT EXISTS error_message VARCHAR(512);

ALTER TABLE ai_audit_log
    ADD COLUMN IF NOT EXISTS prompt_tokens INT;

ALTER TABLE ai_audit_log
    ADD COLUMN IF NOT EXISTS completion_tokens INT;

ALTER TABLE ai_audit_log
    ADD COLUMN IF NOT EXISTS total_tokens INT;
