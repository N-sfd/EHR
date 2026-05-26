-- Update patient_consents table to add new FHIR-compliant fields
-- Adds: status, accepted_at, version, accepted_by, document_url, signature_id

-- Add new columns
ALTER TABLE patient_consents 
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'REVOKED',
    ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS version VARCHAR(50),
    ADD COLUMN IF NOT EXISTS accepted_by VARCHAR(50),
    ADD COLUMN IF NOT EXISTS document_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS signature_id VARCHAR(100);

-- Update status based on existing consent_signed field
UPDATE patient_consents 
SET status = CASE 
    WHEN consent_signed = true THEN 'ACTIVE'
    ELSE 'REVOKED'
END
WHERE status IS NULL;

-- Set accepted_at from consent_date if available
UPDATE patient_consents 
SET accepted_at = consent_date::timestamp
WHERE accepted_at IS NULL AND consent_date IS NOT NULL;

-- Set accepted_by from signed_by if available
UPDATE patient_consents 
SET accepted_by = CASE 
    WHEN signed_by ILIKE '%guardian%' OR signed_by ILIKE '%parent%' THEN 'GUARDIAN'
    ELSE 'PATIENT'
END
WHERE accepted_by IS NULL AND signed_by IS NOT NULL;

-- Set default version
UPDATE patient_consents 
SET version = '1.0'
WHERE version IS NULL;

-- Make status NOT NULL after setting defaults
ALTER TABLE patient_consents 
    ALTER COLUMN status SET NOT NULL,
    ALTER COLUMN status SET DEFAULT 'REVOKED';

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_consent_status ON patient_consents(status);
CREATE INDEX IF NOT EXISTS idx_consent_patient_status ON patient_consents(patient_id, status);

-- Add comments
COMMENT ON COLUMN patient_consents.status IS 'Consent status: ACTIVE or REVOKED';
COMMENT ON COLUMN patient_consents.accepted_at IS 'Timestamp when consent was accepted';
COMMENT ON COLUMN patient_consents.version IS 'Consent version/rule identifier';
COMMENT ON COLUMN patient_consents.accepted_by IS 'Who accepted: PATIENT or GUARDIAN';
COMMENT ON COLUMN patient_consents.document_url IS 'URL to consent document if stored externally';
COMMENT ON COLUMN patient_consents.signature_id IS 'Reference to signature record if stored separately';

