-- Seed lab results for current test patients (IDs 1-7)
-- Runs after V999/V1000 which wiped the lab_result table

DELETE FROM lab_result_item WHERE result_id IN (SELECT result_id FROM lab_result WHERE patient_id IN (1,2,3,4,5,6,7));
DELETE FROM lab_result WHERE patient_id IN (1,2,3,4,5,6,7);

-- ── PATIENT 1 ──────────────────────────────────────────────────────────────
DO $$
DECLARE r BIGINT;
BEGIN
  INSERT INTO lab_result (patient_id,panel_name,order_date,result_date,status,lab_name)
  VALUES (1,'Complete Blood Count (CBC)',CURRENT_DATE-5,CURRENT_DATE-3,'FINAL','Meritus Medical Center Lab')
  RETURNING result_id INTO r;
  INSERT INTO lab_result_item(result_id,test_name,value,units,reference_range,flag,abnormal,display_order) VALUES
  (r,'WBC',          '7.2', 'cells/μL', '4.5-11.0', NULL,  false, 1),
  (r,'RBC',          '4.8', 'million/μL','4.5-5.5',  NULL,  false, 2),
  (r,'Hemoglobin',   '14.2','g/dL',     '12.0-15.5',NULL,  false, 3),
  (r,'Hematocrit',   '42.5','%',        '36.0-46.0',NULL,  false, 4),
  (r,'Platelet Count','185','cells/μL', '150-450',   NULL,  false, 5);
END $$;

DO $$
DECLARE r BIGINT;
BEGIN
  INSERT INTO lab_result (patient_id,panel_name,order_date,result_date,status,lab_name)
  VALUES (1,'Basic Metabolic Panel (BMP)',CURRENT_DATE-14,CURRENT_DATE-12,'FINAL','Meritus Medical Center Lab')
  RETURNING result_id INTO r;
  INSERT INTO lab_result_item(result_id,test_name,value,units,reference_range,flag,abnormal,display_order) VALUES
  (r,'Glucose',   '105','mg/dL', '70-100',   'H',   true,  1),
  (r,'Sodium',    '138','mEq/L', '136-145',  NULL,  false, 2),
  (r,'Potassium', '4.2','mEq/L', '3.5-5.0',  NULL,  false, 3),
  (r,'Creatinine','0.9','mg/dL', '0.6-1.2',  NULL,  false, 4),
  (r,'BUN',       '18', 'mg/dL', '7-20',     NULL,  false, 5);
END $$;

DO $$
DECLARE r BIGINT;
BEGIN
  INSERT INTO lab_result (patient_id,panel_name,order_date,result_date,status,lab_name)
  VALUES (1,'Lipid Panel',CURRENT_DATE-90,CURRENT_DATE-88,'FINAL','Meritus Medical Center Lab')
  RETURNING result_id INTO r;
  INSERT INTO lab_result_item(result_id,test_name,value,units,reference_range,flag,abnormal,display_order) VALUES
  (r,'Total Cholesterol','195','mg/dL','<200',  NULL, false, 1),
  (r,'HDL Cholesterol',  '55', 'mg/dL','>40',   NULL, false, 2),
  (r,'LDL Cholesterol',  '120','mg/dL','<100',  'H',  true,  3),
  (r,'Triglycerides',    '100','mg/dL','<150',  NULL, false, 4);
END $$;

-- ── PATIENT 2 ──────────────────────────────────────────────────────────────
DO $$
DECLARE r BIGINT;
BEGIN
  INSERT INTO lab_result (patient_id,panel_name,order_date,result_date,status,lab_name)
  VALUES (2,'Complete Blood Count (CBC)',CURRENT_DATE-7,CURRENT_DATE-5,'FINAL','Meritus Medical Center Lab')
  RETURNING result_id INTO r;
  INSERT INTO lab_result_item(result_id,test_name,value,units,reference_range,flag,abnormal,display_order) VALUES
  (r,'WBC',          '6.8', 'cells/μL', '4.5-11.0', NULL, false, 1),
  (r,'Hemoglobin',   '13.8','g/dL',     '12.0-15.5',NULL, false, 2),
  (r,'Platelet Count','220','cells/μL', '150-450',   NULL, false, 3);
END $$;

DO $$
DECLARE r BIGINT;
BEGIN
  INSERT INTO lab_result (patient_id,panel_name,order_date,result_date,status,lab_name)
  VALUES (2,'Basic Metabolic Panel (BMP)',CURRENT_DATE-20,CURRENT_DATE-18,'FINAL','Meritus Medical Center Lab')
  RETURNING result_id INTO r;
  INSERT INTO lab_result_item(result_id,test_name,value,units,reference_range,flag,abnormal,display_order) VALUES
  (r,'Glucose',   '68', 'mg/dL','70-100',  'L',  true,  1),
  (r,'Sodium',    '140','mEq/L','136-145', NULL, false, 2),
  (r,'Potassium', '3.8','mEq/L','3.5-5.0', NULL, false, 3),
  (r,'Creatinine','0.85','mg/dL','0.6-1.2',NULL, false, 4);
END $$;

-- ── PATIENT 3 ──────────────────────────────────────────────────────────────
DO $$
DECLARE r BIGINT;
BEGIN
  INSERT INTO lab_result (patient_id,panel_name,order_date,result_date,status,lab_name)
  VALUES (3,'HbA1c / Diabetes Panel',CURRENT_DATE-10,CURRENT_DATE-8,'FINAL','Meritus Medical Center Lab')
  RETURNING result_id INTO r;
  INSERT INTO lab_result_item(result_id,test_name,value,units,reference_range,flag,abnormal,display_order) VALUES
  (r,'HbA1c',         '7.4','%',    '<7.0', 'H', true,  1),
  (r,'Fasting Glucose','128','mg/dL','70-100','H', true,  2),
  (r,'Insulin',        '12', 'μU/mL','2-25', NULL,false, 3);
END $$;

-- ── PATIENT 4 ──────────────────────────────────────────────────────────────
DO $$
DECLARE r BIGINT;
BEGIN
  INSERT INTO lab_result (patient_id,panel_name,order_date,result_date,status,lab_name)
  VALUES (4,'Thyroid Function Panel',CURRENT_DATE-15,CURRENT_DATE-13,'FINAL','Meritus Medical Center Lab')
  RETURNING result_id INTO r;
  INSERT INTO lab_result_item(result_id,test_name,value,units,reference_range,flag,abnormal,display_order) VALUES
  (r,'TSH',  '2.1','mIU/L','0.4-4.0', NULL, false, 1),
  (r,'Free T4','1.2','ng/dL','0.8-1.8', NULL, false, 2),
  (r,'Free T3','3.0','pg/mL','2.3-4.2', NULL, false, 3);
END $$;

-- ── PATIENT 5 ──────────────────────────────────────────────────────────────
DO $$
DECLARE r BIGINT;
BEGIN
  INSERT INTO lab_result (patient_id,panel_name,order_date,result_date,status,lab_name)
  VALUES (5,'Comprehensive Metabolic Panel (CMP)',CURRENT_DATE-4,CURRENT_DATE-2,'FINAL','Meritus Medical Center Lab')
  RETURNING result_id INTO r;
  INSERT INTO lab_result_item(result_id,test_name,value,units,reference_range,flag,abnormal,display_order) VALUES
  (r,'Glucose',   '92', 'mg/dL','70-100',  NULL, false, 1),
  (r,'Sodium',    '141','mEq/L','136-145', NULL, false, 2),
  (r,'Potassium', '4.0','mEq/L','3.5-5.0', NULL, false, 3),
  (r,'Calcium',   '9.5','mg/dL','8.5-10.2',NULL, false, 4),
  (r,'ALT',       '35', 'U/L',  '7-56',    NULL, false, 5),
  (r,'AST',       '28', 'U/L',  '10-40',   NULL, false, 6);
END $$;
