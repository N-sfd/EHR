-- Seed Sample Data

-- Departments
INSERT INTO departments (name, location, is_active) VALUES
('Cardiology', 'Main Building, Floor 2', TRUE),
('Pediatrics', 'Main Building, Floor 1', TRUE),
('Internal Medicine', 'Main Building, Floor 3', TRUE),
('Orthopedics', 'Main Building, Floor 2', TRUE)
ON CONFLICT DO NOTHING;

-- Providers
INSERT INTO providers (first_name, last_name, specialty, department_id, is_active) VALUES
('Sarah', 'Johnson', 'Cardiologist', 1, TRUE),
('Michael', 'Williams', 'Pediatrician', 2, TRUE),
('Emily', 'Brown', 'Internal Medicine', 3, TRUE),
('David', 'Davis', 'Orthopedic Surgeon', 4, TRUE)
ON CONFLICT DO NOTHING;

-- Visit Types
INSERT INTO visit_types (name, duration_mins, allow_overbook, is_active) VALUES
('New Patient', 60, FALSE, TRUE),
('Follow-up', 30, TRUE, TRUE),
('Consultation', 30, FALSE, TRUE),
('Procedure', 45, FALSE, TRUE),
('Annual Physical', 60, FALSE, TRUE),
('Urgent Care', 15, TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- Visit Type Departments
INSERT INTO visit_type_departments (visit_type_id, department_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), -- New Patient
(2, 1), (2, 2), (2, 3), (2, 4), -- Follow-up
(3, 1), (3, 2), (3, 3), (3, 4), -- Consultation
(4, 1), (4, 4), -- Procedure
(5, 1), (5, 2), (5, 3), -- Annual Physical
(6, 1), (6, 2), (6, 3), (6, 4) -- Urgent Care
ON CONFLICT DO NOTHING;

-- Sample Patients (only columns that exist at this migration; extra columns like
-- patient_code/phone_number/address/gender/status are added by later migrations).
INSERT INTO patients (mrn, first_name, last_name, date_of_birth, sex, phone, email, address_line1, city, state, zip_code) VALUES
('MRN001', 'John', 'Doe', '1980-05-15', 'MALE', '555-0101', 'john.doe@example.com', '123 Main St', 'Springfield', 'IL', '62701'),
('MRN002', 'Jane', 'Smith', '1990-08-22', 'FEMALE', '555-0102', 'jane.smith@example.com', '456 Oak Ave', 'Springfield', 'IL', '62702'),
('MRN003', 'Robert', 'Johnson', '1975-03-10', 'MALE', '555-0103', 'robert.j@example.com', '789 Pine Rd', 'Springfield', 'IL', '62703')
ON CONFLICT (mrn) DO NOTHING;

-- Sample Coverages (using subqueries to get actual patient IDs)
INSERT INTO coverages (patient_id, payer, member_id, group_number, start_date, end_date, eligibility_status, copay, deductible, is_primary)
SELECT 
    p.patient_id,
    'Blue Cross Blue Shield',
    'BC123456789',
    'GRP001',
    '2024-01-01'::date,
    '2024-12-31'::date,
    'ACTIVE',
    25.00,
    500.00,
    TRUE
FROM patients p WHERE p.mrn = 'MRN001'
ON CONFLICT DO NOTHING;

INSERT INTO coverages (patient_id, payer, member_id, group_number, start_date, end_date, eligibility_status, copay, deductible, is_primary)
SELECT 
    p.patient_id,
    'Aetna',
    'AET987654321',
    'GRP002',
    '2024-01-01'::date,
    '2024-12-31'::date,
    'ACTIVE',
    30.00,
    750.00,
    TRUE
FROM patients p WHERE p.mrn = 'MRN002'
ON CONFLICT DO NOTHING;

INSERT INTO coverages (patient_id, payer, member_id, group_number, start_date, end_date, eligibility_status, copay, deductible, is_primary)
SELECT 
    p.patient_id,
    'Cigna',
    'CIG555666777',
    'GRP003',
    '2023-01-01'::date,
    '2023-12-31'::date,
    'EXPIRED',
    20.00,
    1000.00,
    TRUE
FROM patients p WHERE p.mrn = 'MRN003'
ON CONFLICT DO NOTHING;

-- Schedule Templates (Monday-Friday, 8 AM - 5 PM, 30 min slots)
INSERT INTO schedule_templates (provider_id, day_of_week, start_time, end_time, slot_duration, overbook_allowed, is_active) VALUES
(1, 'MONDAY', '08:00', '17:00', 30, FALSE, TRUE),
(1, 'TUESDAY', '08:00', '17:00', 30, FALSE, TRUE),
(1, 'WEDNESDAY', '08:00', '17:00', 30, FALSE, TRUE),
(1, 'THURSDAY', '08:00', '17:00', 30, FALSE, TRUE),
(1, 'FRIDAY', '08:00', '17:00', 30, FALSE, TRUE),
(2, 'MONDAY', '08:00', '17:00', 30, TRUE, TRUE),
(2, 'TUESDAY', '08:00', '17:00', 30, TRUE, TRUE),
(2, 'WEDNESDAY', '08:00', '17:00', 30, TRUE, TRUE),
(2, 'THURSDAY', '08:00', '17:00', 30, TRUE, TRUE),
(2, 'FRIDAY', '08:00', '17:00', 30, TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- Sample Appointments (using subqueries to get actual patient IDs)
INSERT INTO appointments (patient_id, provider_id, department_id, visit_type_id, start_date_time, duration_mins, status, reason)
SELECT 
    p.patient_id,
    1, -- provider_id
    1, -- department_id
    2, -- visit_type_id
    '2026-01-10 10:00:00'::timestamp,
    30,
    'SCHEDULED',
    'Follow-up for hypertension'
FROM patients p WHERE p.mrn = 'MRN001'
ON CONFLICT DO NOTHING;

INSERT INTO appointments (patient_id, provider_id, department_id, visit_type_id, start_date_time, duration_mins, status, reason)
SELECT 
    p.patient_id,
    2, -- provider_id
    2, -- department_id
    1, -- visit_type_id
    '2026-01-10 14:00:00'::timestamp,
    60,
    'SCHEDULED',
    'New patient consultation'
FROM patients p WHERE p.mrn = 'MRN002'
ON CONFLICT DO NOTHING;

INSERT INTO appointments (patient_id, provider_id, department_id, visit_type_id, start_date_time, duration_mins, status, reason)
SELECT 
    p.patient_id,
    1, -- provider_id
    1, -- department_id
    2, -- visit_type_id
    '2026-01-11 09:30:00'::timestamp,
    30,
    'SCHEDULED',
    'Cardiac follow-up'
FROM patients p WHERE p.mrn = 'MRN003'
ON CONFLICT DO NOTHING;

