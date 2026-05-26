-- Create patient_medication table
CREATE TABLE patient_medication (
    medication_id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    medication_name VARCHAR(200) NOT NULL,
    common_name VARCHAR(200), -- e.g., "ZyrTEC" for cetirizine
    dosage VARCHAR(100) NOT NULL, -- e.g., "10 mg"
    frequency VARCHAR(100) NOT NULL, -- e.g., "Once daily", "Twice daily", "Every 8 hours"
    instructions TEXT, -- e.g., "TAKE 1 TABLET BY MOUTH EVERY DAY IN THE MORNING"
    prescribed_date DATE NOT NULL,
    prescriber_id BIGINT REFERENCES staff(staff_id),
    prescription_number VARCHAR(50),
    quantity VARCHAR(50), -- e.g., "30 Tablets"
    day_supply INTEGER,
    pharmacy_name VARCHAR(200),
    pharmacy_address VARCHAR(255),
    pharmacy_city VARCHAR(100),
    pharmacy_state VARCHAR(50),
    pharmacy_zip VARCHAR(20),
    pharmacy_phone VARCHAR(50),
    refills_remaining INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_external BOOLEAN DEFAULT false, -- From another organization
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create refill_request table
CREATE TABLE refill_request (
    request_id BIGSERIAL PRIMARY KEY,
    medication_id BIGINT NOT NULL REFERENCES patient_medication(medication_id) ON DELETE CASCADE,
    patient_id BIGINT NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'DENIED', 'FILLED')),
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    processed_by BIGINT REFERENCES staff(staff_id)
);

-- Indexes for performance
CREATE INDEX idx_patient_medication_patient_id ON patient_medication(patient_id);
CREATE INDEX idx_patient_medication_active ON patient_medication(patient_id, is_active) WHERE is_active = true;
CREATE INDEX idx_refill_request_medication_id ON refill_request(medication_id);
CREATE INDEX idx_refill_request_patient_id ON refill_request(patient_id);
CREATE INDEX idx_refill_request_status ON refill_request(status);

-- Seed sample medications for patient1 (patient_id = 1)
INSERT INTO patient_medication (
    patient_id, medication_name, common_name, dosage, frequency, instructions,
    prescribed_date, prescriber_id, prescription_number, quantity, day_supply,
    pharmacy_name, pharmacy_address, pharmacy_city, pharmacy_state, pharmacy_zip, pharmacy_phone,
    refills_remaining, is_active, is_external
) VALUES
(1, 'cetirizine 10 mg tablet', 'ZyrTEC', '10 mg', 'Once daily', 'TAKE 1 TABLET BY MOUTH EVERY DAY IN THE MORNING', 
 CURRENT_DATE - INTERVAL '30 days', 1, '2305622', '30 Tablets', 30,
 'CVS/pharmacy #1435 - HAGERSTOWN, MD', '1503 POTOMAC AVENUE AT LONGMEADOW SHOPPING CENTER', 'Hagerstown', 'MD', '21742', '301-733-8515',
 2, true, false),
(1, 'lisinopril 10 mg tablet', 'Prinivil / Zestril', '10 mg', 'Once daily', 'TAKE 1 TABLET BY MOUTH ONCE DAILY',
 CURRENT_DATE - INTERVAL '60 days', 1, '2305623', '90 Tablets', 90,
 'CVS/pharmacy #1435 - HAGERSTOWN, MD', '1503 POTOMAC AVENUE AT LONGMEADOW SHOPPING CENTER', 'Hagerstown', 'MD', '21742', '301-733-8515',
 5, true, false),
(1, 'metformin 500 mg tablet', 'Glucophage', '500 mg', 'Twice daily', 'TAKE 1 TABLET BY MOUTH TWICE DAILY WITH MEALS',
 CURRENT_DATE - INTERVAL '45 days', 1, '2305624', '60 Tablets', 30,
 'CVS/pharmacy #1435 - HAGERSTOWN, MD', '1503 POTOMAC AVENUE AT LONGMEADOW SHOPPING CENTER', 'Hagerstown', 'MD', '21742', '301-733-8515',
 3, true, false),
(1, 'ibuprofen 200 mg tablet', 'Advil / Motrin', '200 mg', 'As needed', 'TAKE 1-2 TABLETS BY MOUTH EVERY 4-6 HOURS AS NEEDED FOR PAIN',
 CURRENT_DATE - INTERVAL '90 days', 1, '2305625', '50 Tablets', NULL,
 'CVS/pharmacy #1435 - HAGERSTOWN, MD', '1503 POTOMAC AVENUE AT LONGMEADOW SHOPPING CENTER', 'Hagerstown', 'MD', '21742', '301-733-8515',
 0, false, false); -- Inactive (past medication)

-- Seed sample medications for patient2 (patient_id = 2)
INSERT INTO patient_medication (
    patient_id, medication_name, common_name, dosage, frequency, instructions,
    prescribed_date, prescriber_id, prescription_number, quantity, day_supply,
    pharmacy_name, pharmacy_address, pharmacy_city, pharmacy_state, pharmacy_zip, pharmacy_phone,
    refills_remaining, is_active, is_external
) VALUES
(2, 'atorvastatin 20 mg tablet', 'Lipitor', '20 mg', 'Once daily', 'TAKE 1 TABLET BY MOUTH ONCE DAILY AT BEDTIME',
 CURRENT_DATE - INTERVAL '20 days', 1, '2305626', '30 Tablets', 30,
 'CVS/pharmacy #1435 - HAGERSTOWN, MD', '1503 POTOMAC AVENUE AT LONGMEADOW SHOPPING CENTER', 'Hagerstown', 'MD', '21742', '301-733-8515',
 4, true, false),
(2, 'amoxicillin 500 mg capsule', 'Amoxil', '500 mg', 'Three times daily', 'TAKE 1 CAPSULE BY MOUTH THREE TIMES DAILY FOR 7 DAYS',
 CURRENT_DATE - INTERVAL '5 days', 1, '2305627', '21 Capsules', 7,
 'CVS/pharmacy #1435 - HAGERSTOWN, MD', '1503 POTOMAC AVENUE AT LONGMEADOW SHOPPING CENTER', 'Hagerstown', 'MD', '21742', '301-733-8515',
 0, true, false); -- Active but no refills (short-term antibiotic)

