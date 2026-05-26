-- Create lab_result table (panel/header)
CREATE TABLE lab_result (
    result_id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    panel_name VARCHAR(200) NOT NULL, -- e.g., "Complete Blood Count", "Basic Metabolic Panel"
    order_date DATE NOT NULL,
    result_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'FINAL' CHECK (status IN ('PENDING', 'PRELIMINARY', 'FINAL', 'CANCELLED')),
    ordering_provider_id BIGINT REFERENCES staff(staff_id),
    lab_name VARCHAR(200) DEFAULT 'Meritus Medical Center Lab',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create lab_result_item table (individual test results within a panel)
CREATE TABLE lab_result_item (
    item_id BIGSERIAL PRIMARY KEY,
    result_id BIGINT NOT NULL REFERENCES lab_result(result_id) ON DELETE CASCADE,
    test_name VARCHAR(200) NOT NULL, -- e.g., "Hemoglobin", "Glucose"
    value VARCHAR(100), -- Test value (can be numeric or text)
    units VARCHAR(50), -- e.g., "g/dL", "mg/dL", "cells/μL"
    reference_range VARCHAR(100), -- e.g., "12.0-15.5", "70-100"
    flag VARCHAR(20), -- NULL, "L" (Low), "H" (High), "CRITICAL"
    abnormal BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX idx_lab_result_patient_id ON lab_result(patient_id);
CREATE INDEX idx_lab_result_order_date ON lab_result(order_date DESC);
CREATE INDEX idx_lab_result_result_date ON lab_result(result_date DESC);
CREATE INDEX idx_lab_result_status ON lab_result(status);
CREATE INDEX idx_lab_result_item_result_id ON lab_result_item(result_id);
CREATE INDEX idx_lab_result_item_flag ON lab_result_item(flag) WHERE flag IS NOT NULL;

-- Seed sample lab results for patient1 (patient_id = 1)
-- Complete Blood Count (CBC) - Recent
DO $$
DECLARE
  cbc_result_id BIGINT;
BEGIN
  INSERT INTO lab_result (patient_id, panel_name, order_date, result_date, status, ordering_provider_id, lab_name) 
  VALUES (1, 'Complete Blood Count (CBC)', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '3 days', 'FINAL', 1, 'Meritus Medical Center Lab')
  RETURNING result_id INTO cbc_result_id;

  INSERT INTO lab_result_item (result_id, test_name, value, units, reference_range, flag, abnormal, display_order) VALUES
  (cbc_result_id, 'White Blood Cell Count', '7.2', 'cells/μL', '4.5-11.0', NULL, false, 1),
  (cbc_result_id, 'Red Blood Cell Count', '4.8', 'million/μL', '4.5-5.5', NULL, false, 2),
  (cbc_result_id, 'Hemoglobin', '14.2', 'g/dL', '12.0-15.5', NULL, false, 3),
  (cbc_result_id, 'Hematocrit', '42.5', '%', '36.0-46.0', NULL, false, 4),
  (cbc_result_id, 'Platelet Count', '185', 'cells/μL', '150-450', NULL, false, 5);
END $$;

-- Basic Metabolic Panel (BMP) - Recent with abnormal values
DO $$
DECLARE
  bmp_result_id BIGINT;
BEGIN
  INSERT INTO lab_result (patient_id, panel_name, order_date, result_date, status, ordering_provider_id, lab_name) 
  VALUES (1, 'Basic Metabolic Panel (BMP)', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '8 days', 'FINAL', 1, 'Meritus Medical Center Lab')
  RETURNING result_id INTO bmp_result_id;

  INSERT INTO lab_result_item (result_id, test_name, value, units, reference_range, flag, abnormal, display_order) VALUES
  (bmp_result_id, 'Glucose', '105', 'mg/dL', '70-100', 'H', true, 1),
  (bmp_result_id, 'Sodium', '138', 'mEq/L', '136-145', NULL, false, 2),
  (bmp_result_id, 'Potassium', '4.2', 'mEq/L', '3.5-5.0', NULL, false, 3),
  (bmp_result_id, 'Chloride', '102', 'mEq/L', '98-107', NULL, false, 4),
  (bmp_result_id, 'BUN', '18', 'mg/dL', '7-20', NULL, false, 5),
  (bmp_result_id, 'Creatinine', '0.9', 'mg/dL', '0.6-1.2', NULL, false, 6);
END $$;

-- Lipid Panel - Older result
DO $$
DECLARE
  lipid_result_id BIGINT;
BEGIN
  INSERT INTO lab_result (patient_id, panel_name, order_date, result_date, status, ordering_provider_id, lab_name) 
  VALUES (1, 'Lipid Panel', CURRENT_DATE - INTERVAL '3 months', CURRENT_DATE - INTERVAL '3 months' + INTERVAL '2 days', 'FINAL', 1, 'Meritus Medical Center Lab')
  RETURNING result_id INTO lipid_result_id;

  INSERT INTO lab_result_item (result_id, test_name, value, units, reference_range, flag, abnormal, display_order) VALUES
  (lipid_result_id, 'Total Cholesterol', '195', 'mg/dL', '<200', NULL, false, 1),
  (lipid_result_id, 'HDL Cholesterol', '55', 'mg/dL', '>40', NULL, false, 2),
  (lipid_result_id, 'LDL Cholesterol', '120', 'mg/dL', '<100', 'H', true, 3),
  (lipid_result_id, 'Triglycerides', '100', 'mg/dL', '<150', NULL, false, 4);
END $$;

-- Comprehensive Metabolic Panel (CMP) - Pending
INSERT INTO lab_result (patient_id, panel_name, order_date, result_date, status, ordering_provider_id, lab_name) 
VALUES (1, 'Comprehensive Metabolic Panel (CMP)', CURRENT_DATE - INTERVAL '1 day', NULL, 'PENDING', 1, 'Meritus Medical Center Lab');

-- Seed sample lab results for patient2 (patient_id = 2)
-- Complete Blood Count (CBC) - Recent
DO $$
DECLARE
  cbc2_result_id BIGINT;
BEGIN
  INSERT INTO lab_result (patient_id, panel_name, order_date, result_date, status, ordering_provider_id, lab_name) 
  VALUES (2, 'Complete Blood Count (CBC)', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE - INTERVAL '5 days', 'FINAL', 1, 'Meritus Medical Center Lab')
  RETURNING result_id INTO cbc2_result_id;

  INSERT INTO lab_result_item (result_id, test_name, value, units, reference_range, flag, abnormal, display_order) VALUES
  (cbc2_result_id, 'White Blood Cell Count', '6.8', 'cells/μL', '4.5-11.0', NULL, false, 1),
  (cbc2_result_id, 'Red Blood Cell Count', '4.5', 'million/μL', '4.5-5.5', NULL, false, 2),
  (cbc2_result_id, 'Hemoglobin', '13.8', 'g/dL', '12.0-15.5', NULL, false, 3),
  (cbc2_result_id, 'Hematocrit', '41.0', '%', '36.0-46.0', NULL, false, 4),
  (cbc2_result_id, 'Platelet Count', '220', 'cells/μL', '150-450', NULL, false, 5);
END $$;

-- Basic Metabolic Panel (BMP) - With low value
DO $$
DECLARE
  bmp2_result_id BIGINT;
BEGIN
  INSERT INTO lab_result (patient_id, panel_name, order_date, result_date, status, ordering_provider_id, lab_name) 
  VALUES (2, 'Basic Metabolic Panel (BMP)', CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE - INTERVAL '12 days', 'FINAL', 1, 'Meritus Medical Center Lab')
  RETURNING result_id INTO bmp2_result_id;

  INSERT INTO lab_result_item (result_id, test_name, value, units, reference_range, flag, abnormal, display_order) VALUES
  (bmp2_result_id, 'Glucose', '68', 'mg/dL', '70-100', 'L', true, 1),
  (bmp2_result_id, 'Sodium', '140', 'mEq/L', '136-145', NULL, false, 2),
  (bmp2_result_id, 'Potassium', '3.8', 'mEq/L', '3.5-5.0', NULL, false, 3),
  (bmp2_result_id, 'Chloride', '104', 'mEq/L', '98-107', NULL, false, 4),
  (bmp2_result_id, 'BUN', '15', 'mg/dL', '7-20', NULL, false, 5),
  (bmp2_result_id, 'Creatinine', '0.85', 'mg/dL', '0.6-1.2', NULL, false, 6);
END $$;

