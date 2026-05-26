-- Create message_thread table
CREATE TABLE message_thread (
    thread_id BIGSERIAL PRIMARY KEY,
    subject VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL, -- patient_id or staff_id who created
    created_by_type VARCHAR(20) NOT NULL CHECK (created_by_type IN ('PATIENT', 'PROVIDER', 'ADMIN'))
);

-- Create message_participant table (many-to-many between threads and participants)
CREATE TABLE message_participant (
    participant_id BIGSERIAL PRIMARY KEY,
    thread_id BIGINT NOT NULL REFERENCES message_thread(thread_id) ON DELETE CASCADE,
    participant_id_ref BIGINT NOT NULL, -- patient_id or staff_id
    participant_type VARCHAR(20) NOT NULL CHECK (participant_type IN ('PATIENT', 'PROVIDER', 'ADMIN')),
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(thread_id, participant_id_ref, participant_type)
);

-- Create message table
CREATE TABLE message (
    message_id BIGSERIAL PRIMARY KEY,
    thread_id BIGINT NOT NULL REFERENCES message_thread(thread_id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL, -- patient_id or staff_id
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('PATIENT', 'PROVIDER', 'ADMIN')),
    body TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL -- when patient read this message (null = unread)
);

-- Indexes for performance
CREATE INDEX idx_message_thread_created_at ON message_thread(created_at DESC);
CREATE INDEX idx_message_participant_thread_id ON message_participant(thread_id);
CREATE INDEX idx_message_participant_participant ON message_participant(participant_id_ref, participant_type);
CREATE INDEX idx_message_thread_id ON message(thread_id);
CREATE INDEX idx_message_sent_at ON message(sent_at DESC);
CREATE INDEX idx_message_read_at ON message(read_at) WHERE read_at IS NULL;

-- Trigger to update thread updated_at when a message is added
CREATE OR REPLACE FUNCTION update_thread_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE message_thread
    SET updated_at = CURRENT_TIMESTAMP
    WHERE thread_id = NEW.thread_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_thread_updated_at
    AFTER INSERT ON message
    FOR EACH ROW
    EXECUTE FUNCTION update_thread_updated_at();

