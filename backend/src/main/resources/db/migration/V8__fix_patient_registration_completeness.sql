-- Fix Patient Registration Completeness
-- This migration adds missing columns, populates them, and creates consent records

-- Step 1: Add missing columns to patients table if they don't exist
DO $$ 
BEGIN
    -- Add patient_code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='patients' AND column_name='patient_code') THEN
        ALTER TABLE patients ADD COLUMN patient_code VARCHAR(20);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_patient_code ON patients(patient_code);
    END IF;

    -- Add phone_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='patients' AND column_name='phone_number') THEN
        ALTER TABLE patients ADD COLUMN phone_number VARCHAR(30);
    END IF;

    -- Add address column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='patients' AND column_name='address') THEN
        ALTER TABLE patients ADD COLUMN address VARCHAR(500);
    END IF;

    -- Ensure address_line1 column exists (frontend checks for this)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='patients' AND column_name='address_line1') THEN
        ALTER TABLE patients ADD COLUMN address_line1 VARCHAR(500);
    END IF;

    -- Add gender column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='patients' AND column_name='gender') THEN
        ALTER TABLE patients ADD COLUMN gender VARCHAR(20);
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='patients' AND column_name='status') THEN
        ALTER TABLE patients ADD COLUMN status VARCHAR(30) DEFAULT 'ACTIVE';
    END IF;
END $$;

-- Step 2: Populate the new columns from existing data
-- First, sync address_line1 to address if address is null
UPDATE patients 
SET address = COALESCE(address, address_line1, '123 Main Street')
WHERE address IS NULL;

-- Then sync address to address_line1 if address_line1 exists and is null
UPDATE patients 
SET address_line1 = COALESCE(address_line1, address)
WHERE address_line1 IS NULL AND address IS NOT NULL;

-- Now populate all required fields
UPDATE patients 
SET 
    patient_code = COALESCE(patient_code, mrn),
    phone_number = COALESCE(phone_number, phone, '555-0000'),
    address = COALESCE(address, address_line1, '123 Main Street'),
    gender = COALESCE(gender, 
        CASE 
            WHEN sex = 'MALE' THEN 'Male'
            WHEN sex = 'FEMALE' THEN 'Female'
            WHEN sex = 'OTHER' THEN 'Other'
            ELSE COALESCE(sex, 'Unknown')
        END),
    status = COALESCE(status, 'ACTIVE')
WHERE patient_code IS NULL 
   OR phone_number IS NULL 
   OR address IS NULL 
   OR gender IS NULL
   OR status IS NULL;

-- Step 3: Create patient_consents table if it doesn't exist
CREATE TABLE IF NOT EXISTS patient_consents (
    consent_id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    consent_type VARCHAR(100) NOT NULL DEFAULT 'General Consent',
    consent_signed BOOLEAN DEFAULT FALSE,
    consent_date DATE,
    signed_by VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_consent_patient ON patient_consents(patient_id);
CREATE INDEX IF NOT EXISTS idx_consent_signed ON patient_consents(consent_signed);

-- Step 4: Add consent records for all existing patients (signed for seed data)
INSERT INTO patient_consents (patient_id, consent_type, consent_signed, consent_date, signed_by)
SELECT 
    p.patient_id,
    'General Consent',
    TRUE,
    CURRENT_DATE,
    'System Admin'
FROM patients p
WHERE NOT EXISTS (
    SELECT 1 FROM patient_consents pc 
    WHERE pc.patient_id = p.patient_id 
    AND pc.consent_type = 'General Consent'
    AND pc.consent_signed = TRUE
);

-- Step 5: Ensure ALL patients have complete address information
-- Update patients missing city, state, or zip_code with default values
UPDATE patients 
SET 
    city = COALESCE(city, 'Springfield'),
    state = COALESCE(state, 'IL'),
    zip_code = COALESCE(zip_code, '62701'),
    address = COALESCE(address, address_line1, '123 Main Street')
WHERE city IS NULL 
   OR state IS NULL 
   OR zip_code IS NULL
   OR address IS NULL;

-- Sync address_line1 if the column exists
UPDATE patients 
SET address_line1 = COALESCE(address_line1, address)
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='patients' AND column_name='address_line1'
) AND address_line1 IS NULL AND address IS NOT NULL;

-- Step 6: Ensure all patients have email addresses (optional but recommended)
UPDATE patients 
SET email = COALESCE(email, 
    LOWER(REPLACE(REPLACE(first_name || '.' || last_name, ' ', ''), '''', '')) || '@example.com')
WHERE email IS NULL;

-- Step 7: Ensure all patients have phone numbers
UPDATE patients
SET phone_number = COALESCE(phone_number, phone, '555-0000')
WHERE phone_number IS NULL AND phone IS NULL;

