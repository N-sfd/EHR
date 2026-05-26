-- Seed Top 5 Patients for Dashboard
-- These patients are displayed in the Admin Dashboard "Top 5 Patients" section

-- Insert Top 5 Patients with photo URLs (using UI-Avatars for now)
-- Note: photo_url can store either a URL or base64 data
INSERT INTO patients (
    mrn, 
    patient_code,
    first_name, 
    last_name, 
    date_of_birth, 
    sex,
    gender,
    phone,
    phone_number,
    email, 
    address_line1, 
    city, 
    state, 
    zip_code,
    address,
    photo_url,
    status,
    created_at,
    updated_at
) VALUES
-- Jesus Adams - Total Paid: $6,589, 80 Appointments
('MRN1001', 'MRN1001', 'Jesus', 'Adams', '1985-03-15', 'MALE', 'Male', '555-1001', '555-1001', 'jesus.adams@example.com', '123 Main Street', 'Springfield', 'IL', '62701', '123 Main Street', 'https://ui-avatars.com/api/?name=Jesus+Adams&background=0d9488&color=fff&size=200&bold=true', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Ezra Belcher - Total Paid: $5,632, 60 Appointments
('MRN1002', 'MRN1002', 'Ezra', 'Belcher', '1990-07-22', 'MALE', 'Male', '555-1002', '555-1002', 'ezra.belcher@example.com', '456 Oak Avenue', 'Springfield', 'IL', '62702', '456 Oak Avenue', 'https://ui-avatars.com/api/?name=Ezra+Belcher&background=3b82f6&color=fff&size=200&bold=true', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Glen Lentz - Total Paid: $4,125, 40 Appointments
('MRN1003', 'MRN1003', 'Glen', 'Lentz', '1988-11-08', 'MALE', 'Male', '555-1003', '555-1003', 'glen.lentz@example.com', '789 Pine Road', 'Springfield', 'IL', '62703', '789 Pine Road', 'https://ui-avatars.com/api/?name=Glen+Lentz&background=8b5cf6&color=fff&size=200&bold=true', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Bernard Griffith - Total Paid: $3,140, 25 Appointments
('MRN1004', 'MRN1004', 'Bernard', 'Griffith', '1992-02-14', 'MALE', 'Male', '555-1004', '555-1004', 'bernard.griffith@example.com', '321 Elm Street', 'Springfield', 'IL', '62704', '321 Elm Street', 'https://ui-avatars.com/api/?name=Bernard+Griffith&background=10b981&color=fff&size=200&bold=true', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- John Elsass - Total Paid: $2,654, 25 Appointments
('MRN1005', 'MRN1005', 'John', 'Elsass', '1987-09-30', 'MALE', 'Male', '555-1005', '555-1005', 'john.elsass@example.com', '654 Maple Drive', 'Springfield', 'IL', '62705', '654 Maple Drive', 'https://ui-avatars.com/api/?name=John+Elsass&background=f59e0b&color=fff&size=200&bold=true', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)

ON CONFLICT (mrn) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    photo_url = EXCLUDED.photo_url,
    updated_at = CURRENT_TIMESTAMP;

