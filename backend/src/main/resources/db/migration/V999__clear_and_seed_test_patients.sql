-- Clear all patient data and seed fresh test patients
-- This migration deletes all existing patient data and creates new test patients

BEGIN;

-- Delete patient-related data in correct order (respecting foreign keys)
DELETE FROM patient_alerts;
DELETE FROM coverages;
DELETE FROM lab_result;
DELETE FROM patient_medication;
DELETE FROM refill_request;
DELETE FROM questionnaire_assignment;
DELETE FROM questionnaire_response;
DELETE FROM billing_statement;
DELETE FROM billing_line_item;
DELETE FROM payment;
DELETE FROM encounters WHERE patient_id IS NOT NULL;
DELETE FROM appointments WHERE patient_id IS NOT NULL;
DELETE FROM message WHERE sender_type = 'PATIENT';
DELETE FROM message_participant WHERE participant_type = 'PATIENT';
DELETE FROM message_thread WHERE created_by_type = 'PATIENT';
UPDATE users SET patient_id = NULL WHERE patient_id IS NOT NULL;

-- Delete from patient-related tables if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_addresses') THEN
        DELETE FROM patient_addresses;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_contacts') THEN
        DELETE FROM patient_contacts;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_consents') THEN
        DELETE FROM patient_consents;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_demographics') THEN
        DELETE FROM patient_demographics;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_emergency_contacts') THEN
        DELETE FROM patient_emergency_contacts;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_guarantor') THEN
        DELETE FROM patient_guarantor;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_registration_status') THEN
        DELETE FROM patient_registration_status;
    END IF;
END $$;

-- Delete all patients
DELETE FROM patients;

-- Reset patient_id sequence
ALTER SEQUENCE IF EXISTS patients_patient_id_seq RESTART WITH 1;

-- Seed new test patients with complete data
INSERT INTO patients (
    patient_code, first_name, last_name, date_of_birth, sex, gender,
    phone_number, phone, email,
    address_line1, address, city, state, zip_code,
    status, created_at, updated_at
) VALUES
-- Patient 1: Complete registration
('P-0001', 'John', 'Doe', '1980-05-15', 'MALE', 'Male', 
 '555-0101', '555-0101', 'john.doe@example.com',
 '123 Main Street', '123 Main Street', 'Springfield', 'IL', '62701',
 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Patient 2: Missing address fields (CRITICAL)
('P-0002', 'Jane', 'Smith', '1990-08-22', 'FEMALE', 'Female',
 '555-0102', '555-0102', 'jane.smith@example.com',
 NULL, NULL, NULL, NULL, NULL,
 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Patient 3: Missing email (WARNING)
('P-0003', 'Robert', 'Johnson', '1975-03-10', 'MALE', 'Male',
 '555-0103', '555-0103', NULL,
 '456 Oak Avenue', '456 Oak Avenue', 'Chicago', 'IL', '60601',
 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Patient 4: Complete registration
('P-0004', 'Emily', 'Davis', '1992-11-20', 'FEMALE', 'Female',
 '555-0104', '555-0104', 'emily.davis@example.com',
 '789 Pine Road', '789 Pine Road', 'Peoria', 'IL', '61601',
 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Patient 5: Missing phone (WARNING)
('P-0005', 'Michael', 'Wilson', '1988-07-05', 'MALE', 'Male',
 NULL, NULL, 'michael.wilson@example.com',
 '321 Elm Street', '321 Elm Street', 'Rockford', 'IL', '61101',
 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

COMMIT;

