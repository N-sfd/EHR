-- Create patient_consents table for tracking signed consents
-- This table stores patient consent records (HIPAA, General, Billing, etc.)

CREATE TABLE IF NOT EXISTS patient_consents (
    consent_id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    consent_type VARCHAR(100) NOT NULL,
    consent_signed BOOLEAN NOT NULL DEFAULT false,
    consent_date DATE,
    signed_by VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_consent_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_consent_patient_id ON patient_consents(patient_id);
CREATE INDEX IF NOT EXISTS idx_consent_type ON patient_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_consent_signed ON patient_consents(consent_signed);
CREATE INDEX IF NOT EXISTS idx_consent_patient_type ON patient_consents(patient_id, consent_type);

-- Add comments
COMMENT ON TABLE patient_consents IS 'Patient consent records for HIPAA, General, Billing, and Treatment consents';
COMMENT ON COLUMN patient_consents.consent_id IS 'Primary key';
COMMENT ON COLUMN patient_consents.patient_id IS 'Foreign key to patients table';
COMMENT ON COLUMN patient_consents.consent_type IS 'Type of consent: General Consent, HIPAA Consent, Billing Consent, Treatment Consent';
COMMENT ON COLUMN patient_consents.consent_signed IS 'Whether the consent has been signed';
COMMENT ON COLUMN patient_consents.consent_date IS 'Date when consent was signed';
COMMENT ON COLUMN patient_consents.signed_by IS 'Name of person who signed the consent';

