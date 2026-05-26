-- Update Patients to Incomplete Registration Status
-- This migration ensures John Doe (MRN001) and Jane Smith (MRN002) exist with incomplete registration
-- by removing address information (address_line1, city, state, zip_code) to match UI requirements

-- Insert or Update John Doe (MRN001) - Ensure exists with incomplete registration
INSERT INTO patients (
    mrn, 
    first_name, 
    last_name, 
    date_of_birth, 
    sex, 
    phone, 
    email, 
    patient_code, 
    phone_number, 
    gender, 
    status,
    address_line1,
    city,
    state,
    zip_code,
    address,
    created_at,
    updated_at
) VALUES (
    'MRN001',
    'John',
    'Doe',
    '1980-05-15',
    'MALE',
    '555-0101',
    'john.doe@example.com',
    'MRN001',
    '555-0101',
    'Male',
    'ACTIVE',
    NULL, -- address_line1 - missing for incomplete registration
    NULL, -- city - missing
    NULL, -- state - missing
    NULL, -- zip_code - missing
    NULL, -- address - missing
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (mrn) DO UPDATE SET
    address_line1 = NULL,
    city = NULL,
    state = NULL,
    zip_code = NULL,
    address = NULL,
    updated_at = CURRENT_TIMESTAMP;

-- Insert or Update Jane Smith (MRN002) - Ensure exists with incomplete registration
INSERT INTO patients (
    mrn, 
    first_name, 
    last_name, 
    date_of_birth, 
    sex, 
    phone, 
    email, 
    patient_code, 
    phone_number, 
    gender, 
    status,
    address_line1,
    city,
    state,
    zip_code,
    address,
    created_at,
    updated_at
) VALUES (
    'MRN002',
    'Jane',
    'Smith',
    '1990-08-22',
    'FEMALE',
    '555-0102',
    'jane.smith@example.com',
    'MRN002',
    '555-0102',
    'Female',
    'ACTIVE',
    NULL, -- address_line1 - missing for incomplete registration
    NULL, -- city - missing
    NULL, -- state - missing
    NULL, -- zip_code - missing
    NULL, -- address - missing
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (mrn) DO UPDATE SET
    address_line1 = NULL,
    city = NULL,
    state = NULL,
    zip_code = NULL,
    address = NULL,
    updated_at = CURRENT_TIMESTAMP;

-- Verify updates
DO $$
DECLARE
    john_count INTEGER;
    jane_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO john_count 
    FROM patients 
    WHERE mrn = 'MRN001' 
      AND address_line1 IS NULL 
      AND city IS NULL 
      AND state IS NULL 
      AND zip_code IS NULL;
    
    SELECT COUNT(*) INTO jane_count 
    FROM patients 
    WHERE mrn = 'MRN002' 
      AND address_line1 IS NULL 
      AND city IS NULL 
      AND state IS NULL 
      AND zip_code IS NULL;
    
    IF john_count = 1 THEN
        RAISE NOTICE 'Successfully updated John Doe (MRN001) - registration now incomplete';
    ELSE
        RAISE WARNING 'John Doe (MRN001) update may have failed - count: %', john_count;
    END IF;
    
    IF jane_count = 1 THEN
        RAISE NOTICE 'Successfully updated Jane Smith (MRN002) - registration now incomplete';
    ELSE
        RAISE WARNING 'Jane Smith (MRN002) update may have failed - count: %', jane_count;
    END IF;
END $$;

