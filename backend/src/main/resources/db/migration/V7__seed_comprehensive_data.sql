-- Comprehensive Seed Data for Testing
-- This file adds more patients, providers, and appointments for the current week

-- Additional Patients (with all required fields for registration completeness)
INSERT INTO patients (mrn, first_name, last_name, date_of_birth, sex, phone, email, address_line1, city, state, zip_code, patient_code, phone_number, address, gender, status) VALUES
('MRN004', 'Maria', 'Garcia', '1985-07-20', 'FEMALE', '555-0104', 'maria.garcia@example.com', '321 Elm St', 'Springfield', 'IL', '62704', 'MRN004', '555-0104', '321 Elm St', 'Female', 'ACTIVE'),
('MRN005', 'William', 'Brown', '1992-11-05', 'MALE', '555-0105', 'william.brown@example.com', '654 Maple Dr', 'Springfield', 'IL', '62705', 'MRN005', '555-0105', '654 Maple Dr', 'Male', 'ACTIVE'),
('MRN006', 'Susan', 'Davis', '1988-02-14', 'FEMALE', '555-0106', 'susan.davis@example.com', '987 Cedar Ln', 'Springfield', 'IL', '62706', 'MRN006', '555-0106', '987 Cedar Ln', 'Female', 'ACTIVE'),
('MRN007', 'James', 'Wilson', '1970-09-30', 'MALE', '555-0107', 'james.wilson@example.com', '147 Birch Ave', 'Springfield', 'IL', '62707', 'MRN007', '555-0107', '147 Birch Ave', 'Male', 'ACTIVE'),
('MRN008', 'Patricia', 'Moore', '1995-04-18', 'FEMALE', '555-0108', 'patricia.moore@example.com', '258 Spruce Way', 'Springfield', 'IL', '62708', 'MRN008', '555-0108', '258 Spruce Way', 'Female', 'ACTIVE'),
('MRN009', 'Robert', 'Taylor', '1983-12-25', 'MALE', '555-0109', 'robert.taylor@example.com', '369 Willow St', 'Springfield', 'IL', '62709', 'MRN009', '555-0109', '369 Willow St', 'Male', 'ACTIVE'),
('MRN010', 'Jennifer', 'Anderson', '1991-06-08', 'FEMALE', '555-0110', 'jennifer.anderson@example.com', '741 Ash Blvd', 'Springfield', 'IL', '62710', 'MRN010', '555-0110', '741 Ash Blvd', 'Female', 'ACTIVE')
ON CONFLICT (mrn) DO NOTHING;

-- Additional Providers
INSERT INTO providers (first_name, last_name, specialty, department_id, is_active) VALUES
('Lisa', 'Martinez', 'Cardiologist', 1, TRUE),
('Thomas', 'Jackson', 'Pediatrician', 2, TRUE),
('Jessica', 'White', 'Internal Medicine', 3, TRUE),
('Christopher', 'Harris', 'Orthopedic Surgeon', 4, TRUE),
('Amanda', 'Clark', 'Cardiologist', 1, TRUE)
ON CONFLICT DO NOTHING;

-- Additional Coverages for new patients
INSERT INTO coverages (patient_id, payer, member_id, group_number, start_date, end_date, eligibility_status, copay, deductible, is_primary)
SELECT 
    p.patient_id,
    'UnitedHealthcare',
    'UHC111222333',
    'GRP004',
    '2024-01-01'::date,
    '2024-12-31'::date,
    'ACTIVE',
    35.00,
    600.00,
    TRUE
FROM patients p WHERE p.mrn = 'MRN004'
ON CONFLICT DO NOTHING;

INSERT INTO coverages (patient_id, payer, member_id, group_number, start_date, end_date, eligibility_status, copay, deductible, is_primary)
SELECT 
    p.patient_id,
    'Medicare',
    'MED444555666',
    'GRP005',
    '2024-01-01'::date,
    '2024-12-31'::date,
    'ACTIVE',
    20.00,
    200.00,
    TRUE
FROM patients p WHERE p.mrn = 'MRN007'
ON CONFLICT DO NOTHING;

-- Schedule Templates for additional providers
INSERT INTO schedule_templates (provider_id, day_of_week, start_time, end_time, slot_duration, overbook_allowed, is_active) VALUES
(3, 'MONDAY', '08:00', '17:00', 30, FALSE, TRUE),
(3, 'TUESDAY', '08:00', '17:00', 30, FALSE, TRUE),
(3, 'WEDNESDAY', '08:00', '17:00', 30, FALSE, TRUE),
(3, 'THURSDAY', '08:00', '17:00', 30, FALSE, TRUE),
(3, 'FRIDAY', '08:00', '17:00', 30, FALSE, TRUE),
(4, 'MONDAY', '09:00', '18:00', 30, TRUE, TRUE),
(4, 'TUESDAY', '09:00', '18:00', 30, TRUE, TRUE),
(4, 'WEDNESDAY', '09:00', '18:00', 30, TRUE, TRUE),
(4, 'THURSDAY', '09:00', '18:00', 30, TRUE, TRUE),
(4, 'FRIDAY', '09:00', '18:00', 30, TRUE, TRUE),
(5, 'MONDAY', '07:00', '16:00', 15, FALSE, TRUE),
(5, 'TUESDAY', '07:00', '16:00', 15, FALSE, TRUE),
(5, 'WEDNESDAY', '07:00', '16:00', 15, FALSE, TRUE),
(5, 'THURSDAY', '07:00', '16:00', 15, FALSE, TRUE),
(5, 'FRIDAY', '07:00', '16:00', 15, FALSE, TRUE)
ON CONFLICT DO NOTHING;

-- Comprehensive Appointments for Current Week (January 2026)
-- Monday appointments
INSERT INTO appointments (patient_id, provider_id, department_id, visit_type_id, start_date_time, duration_mins, status, reason, notes)
SELECT 
    p.patient_id,
    1, -- provider_id
    1, -- department_id
    2, -- visit_type_id (Follow-up)
    '2026-01-13 09:00:00'::timestamp, -- Monday
    30,
    'SCHEDULED',
    'Hypertension follow-up',
    'Patient reports stable BP readings'
FROM patients p WHERE p.mrn = 'MRN001'
ON CONFLICT DO NOTHING;

INSERT INTO appointments (patient_id, provider_id, department_id, visit_type_id, start_date_time, duration_mins, status, reason)
SELECT 
    p.patient_id,
    1,
    1,
    2,
    '2026-01-13 10:30:00'::timestamp,
    30,
    'CONFIRMED',
    'Cardiac check-up'
FROM patients p WHERE p.mrn = 'MRN003'
ON CONFLICT DO NOTHING;

INSERT INTO appointments (patient_id, provider_id, department_id, visit_type_id, start_date_time, duration_mins, status, reason)
SELECT 
    p.patient_id,
    2,
    2,
    1,
    '2026-01-13 11:00:00'::timestamp,
    60,
    'SCHEDULED',
    'New patient pediatric consultation'
FROM patients p WHERE p.mrn = 'MRN002'
ON CONFLICT DO NOTHING;

INSERT INTO appointments (patient_id, provider_id, department_id, visit_type_id, start_date_time, duration_mins, status, reason)
SELECT 
    p.patient_id,
    3,
    3,
    2,
    '2026-01-13 14:00:00'::timestamp,
    30,
    'SCHEDULED',
    'General health follow-up'
FROM patients p WHERE p.mrn = 'MRN004'
ON CONFLICT DO NOTHING;

-- Tuesday appointments
INSERT INTO appointments (patient_id, provider_id, department_id, visit_type_id, start_date_time, duration_mins, status, reason)
SELECT 
    p.patient_id,
    1,
    1,
    5,
    '2026-01-14 08:30:00'::timestamp, -- Tuesday
    60,
    'SCHEDULED',
    'Annual physical examination'
FROM patients p WHERE p.mrn = 'MRN005'
ON CONFLICT DO NOTHING;

INSERT INTO appointments (patient_id, provider_id, department_id, visit_type_id, start_date_time, duration_mins, status, reason)
SELECT 
    p.patient_id,
    2,
    2,
    2,
    '2026-01-14 10:00:00'::timestamp,
    30,
    'CONFIRMED',
    'Pediatric follow-up'
FROM patients p WHERE p.mrn = 'MRN006'
ON CONFLICT DO NOTHING;

INSERT INTO appointments (patient_id, provider_id, department_id, visit_type_id, start_date_time, duration_mins, status, reason)
SELECT 
    p.patient_id,
    4,
    4,
    4,
    '2026-01-14 13:30:00'::timestamp,
    45,
    'SCHEDULED',
    'Knee procedure consultation'
FROM patients p WHERE p.mrn = 'MRN007'
ON CONFLICT DO NOTHING;

-- Wednesday appointments
INSERT INTO appointments (patient_id, provider_id, department_id, visit_type_id, start_date_time, duration_mins, status, reason)
SELECT 
    p.patient_id,
    1,
    1,
    3,
    '2026-01-15 09:15:00'::timestamp, -- Wednesday
    30,
    'SCHEDULED',
    'Cardiac consultation'
FROM patients p WHERE p.mrn = 'MRN008'
ON CONFLICT DO NOTHING;

INSERT INTO appointments (patient_id, provider_id, department_id, visit_type_id, start_date_time, duration_mins, status, reason)
SELECT 
    p.patient_id,
    3,
    3,
    2,
    '2026-01-15 11:30:00'::timestamp,
    30,
    'ARRIVED',
    'Follow-up visit'
FROM patients p WHERE p.mrn = 'MRN009'
ON CONFLICT DO NOTHING;

INSERT INTO appointments (patient_id, provider_id, department_id, visit_type_id, start_date_time, duration_mins, status, reason)
SELECT 
    p.patient_id,
    2,
    2,
    6,
    '2026-01-15 15:00:00'::timestamp,
    15,
    'SCHEDULED',
    'Urgent care visit'
FROM patients p WHERE p.mrn = 'MRN010'
ON CONFLICT DO NOTHING;

-- Thursday appointments
INSERT INTO appointments (patient_id, provider_id, department_id, visit_type_id, start_date_time, duration_mins, status, reason)
SELECT 
    p.patient_id,
    1,
    1,
    2,
    '2026-01-16 08:00:00'::timestamp, -- Thursday
    30,
    'CHECKED_IN',
    'Routine cardiac follow-up'
FROM patients p WHERE p.mrn = 'MRN001'
ON CONFLICT DO NOTHING;

INSERT INTO appointments (patient_id, provider_id, department_id, visit_type_id, start_date_time, duration_mins, status, reason)
SELECT 
    p.patient_id,
    5,
    1,
    2,
    '2026-01-16 10:45:00'::timestamp,
    30,
    'SCHEDULED',
    'Cardiology follow-up'
FROM patients p WHERE p.mrn = 'MRN004'
ON CONFLICT DO NOTHING;

INSERT INTO appointments (patient_id, provider_id, department_id, visit_type_id, start_date_time, duration_mins, status, reason)
SELECT 
    p.patient_id,
    4,
    4,
    1,
    '2026-01-16 14:15:00'::timestamp,
    60,
    'SCHEDULED',
    'New patient orthopedic evaluation'
FROM patients p WHERE p.mrn = 'MRN005'
ON CONFLICT DO NOTHING;

-- Friday appointments
INSERT INTO appointments (patient_id, provider_id, department_id, visit_type_id, start_date_time, duration_mins, status, reason)
SELECT 
    p.patient_id,
    2,
    2,
    5,
    '2026-01-17 09:00:00'::timestamp, -- Friday
    60,
    'SCHEDULED',
    'Annual pediatric physical'
FROM patients p WHERE p.mrn = 'MRN002'
ON CONFLICT DO NOTHING;

INSERT INTO appointments (patient_id, provider_id, department_id, visit_type_id, start_date_time, duration_mins, status, reason)
SELECT 
    p.patient_id,
    3,
    3,
    2,
    '2026-01-17 11:00:00'::timestamp,
    30,
    'CONFIRMED',
    'General medicine follow-up'
FROM patients p WHERE p.mrn = 'MRN006'
ON CONFLICT DO NOTHING;

INSERT INTO appointments (patient_id, provider_id, department_id, visit_type_id, start_date_time, duration_mins, status, reason)
SELECT 
    p.patient_id,
    1,
    1,
    2,
    '2026-01-17 13:00:00'::timestamp,
    30,
    'SCHEDULED',
    'Cardiac monitoring follow-up'
FROM patients p WHERE p.mrn = 'MRN003'
ON CONFLICT DO NOTHING;

-- Weekend appointments (if any)
INSERT INTO appointments (patient_id, provider_id, department_id, visit_type_id, start_date_time, duration_mins, status, reason)
SELECT 
    p.patient_id,
    1,
    1,
    6,
    '2026-01-18 10:00:00'::timestamp, -- Saturday
    15,
    'SCHEDULED',
    'Urgent cardiac consultation'
FROM patients p WHERE p.mrn = 'MRN007'
ON CONFLICT DO NOTHING;

-- Note: patient_code, phone_number, address, gender, and status are now set in INSERT statements above
-- This ensures all required fields for registration completeness are populated

