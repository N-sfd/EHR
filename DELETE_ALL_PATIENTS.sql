-- Delete All Patient Data
-- WARNING: This will permanently delete ALL patient records and related data!
-- Run this script with caution and ensure you have a backup if needed.

BEGIN;

-- Delete patient-related data from tables that don't have CASCADE
-- (Delete in order to respect foreign key constraints)

-- 1. Delete from encounters first (references patients without CASCADE)
-- Encounters also reference appointments, so delete encounters before appointments
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'encounters') THEN
        DELETE FROM encounters WHERE patient_id IS NOT NULL;
    END IF;
END $$;

-- 2. Delete from appointment (canonical table) and appointments (legacy) if present
DELETE FROM appointment WHERE patient_id IS NOT NULL;
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
        DELETE FROM appointments WHERE patient_id IS NOT NULL;
    END IF;
END $$;

-- 3. Delete from message tables (patient can be sender or participant)
DELETE FROM message WHERE sender_type = 'PATIENT';
DELETE FROM message_participant WHERE participant_type = 'PATIENT';
DELETE FROM message_thread WHERE created_by_type = 'PATIENT';

-- 4. Clear patient_id from users table (SET NULL constraint)
UPDATE users SET patient_id = NULL WHERE patient_id IS NOT NULL;

-- 5. Delete from tables with CASCADE (explicit for clarity and logging)
DELETE FROM patient_alerts;
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'insurances') THEN
        DELETE FROM insurances WHERE patient_id IS NOT NULL;
    END IF;
END $$;
DELETE FROM coverages;
DELETE FROM lab_result;
DELETE FROM patient_medication;
DELETE FROM refill_request;
DELETE FROM questionnaire_assignment;
DELETE FROM questionnaire_response;
DELETE FROM billing_statement;
DELETE FROM billing_line_item;
DELETE FROM payment;

-- 6. Delete from patient-related tables
DO $$ 
BEGIN
    -- Delete from patient_addresses if exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_addresses') THEN
        DELETE FROM patient_addresses;
    END IF;
    
    -- Delete from patient_contacts if exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_contacts') THEN
        DELETE FROM patient_contacts;
    END IF;
    
    -- Delete from patient_consents if exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_consents') THEN
        DELETE FROM patient_consents;
    END IF;
    
    -- Delete from patient_demographics if exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_demographics') THEN
        DELETE FROM patient_demographics;
    END IF;
    
    -- Delete from patient_emergency_contacts if exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_emergency_contacts') THEN
        DELETE FROM patient_emergency_contacts;
    END IF;
    
    -- Delete from patient_guarantor if exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_guarantor') THEN
        DELETE FROM patient_guarantor;
    END IF;
    
    -- Delete from patient_registration_status if exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_registration_status') THEN
        DELETE FROM patient_registration_status;
    END IF;
END $$;

-- 7. Finally, delete all patients
DELETE FROM patients;

-- 8. Reset sequences (optional - for clean IDs)
-- ALTER SEQUENCE IF EXISTS patients_patient_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS appointments_appointment_id_seq RESTART WITH 1;

COMMIT;

-- Verification queries
SELECT 'Remaining patients: ' || COUNT(*)::text FROM patients;
SELECT 'Remaining appointments: ' || COUNT(*)::text FROM appointments WHERE patient_id IS NOT NULL;
SELECT 'Remaining lab results: ' || COUNT(*)::text FROM lab_result;
SELECT 'Remaining medications: ' || COUNT(*)::text FROM patient_medication;
SELECT 'Remaining billing statements: ' || COUNT(*)::text FROM billing_statement;
