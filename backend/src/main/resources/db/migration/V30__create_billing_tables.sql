-- Create billing_statement table
CREATE TABLE billing_statement (
    statement_id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    statement_number VARCHAR(50) UNIQUE NOT NULL,
    statement_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    balance_due NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create billing_line_item table (charges on a statement)
CREATE TABLE billing_line_item (
    line_item_id BIGSERIAL PRIMARY KEY,
    statement_id BIGINT NOT NULL REFERENCES billing_statement(statement_id) ON DELETE CASCADE,
    description VARCHAR(500) NOT NULL,
    service_date DATE,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create payment table (payments made toward statements)
CREATE TABLE payment (
    payment_id BIGSERIAL PRIMARY KEY,
    statement_id BIGINT NOT NULL REFERENCES billing_statement(statement_id) ON DELETE CASCADE,
    patient_id BIGINT NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('CREDIT_CARD', 'DEBIT_CARD', 'CHECK', 'CASH', 'ONLINE')),
    payment_reference VARCHAR(100), -- Transaction ID, check number, etc.
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_billing_statement_patient_id ON billing_statement(patient_id);
CREATE INDEX idx_billing_statement_status ON billing_statement(patient_id, status);
CREATE INDEX idx_billing_statement_due_date ON billing_statement(due_date);
CREATE INDEX idx_billing_line_item_statement_id ON billing_line_item(statement_id);
CREATE INDEX idx_payment_statement_id ON payment(statement_id);
CREATE INDEX idx_payment_patient_id ON payment(patient_id);

-- Seed sample billing statements for patient1 (patient_id = 1)
-- Statement 1: Recent, partially paid
DO $$
DECLARE
  stmt1_id BIGINT;
BEGIN
  INSERT INTO billing_statement (patient_id, statement_number, statement_date, due_date, total_amount, paid_amount, balance_due, status) 
  VALUES (1, 'STMT-2025-001', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '5 days', 250.00, 100.00, 150.00, 'PARTIAL')
  RETURNING statement_id INTO stmt1_id;

  INSERT INTO billing_line_item (statement_id, description, service_date, quantity, unit_price, total_price, display_order) VALUES
  (stmt1_id, 'Office Visit - Established Patient', CURRENT_DATE - INTERVAL '20 days', 1, 150.00, 150.00, 1),
  (stmt1_id, 'Lab Work - Complete Blood Count', CURRENT_DATE - INTERVAL '20 days', 1, 75.00, 75.00, 2),
  (stmt1_id, 'Lab Work - Basic Metabolic Panel', CURRENT_DATE - INTERVAL '20 days', 1, 25.00, 25.00, 3);

  INSERT INTO payment (statement_id, patient_id, amount, payment_date, payment_method, payment_reference, notes) VALUES
  (stmt1_id, 1, 100.00, CURRENT_DATE - INTERVAL '10 days', 'ONLINE', 'TXN-12345', 'Partial payment');
END $$;

-- Statement 2: Overdue
DO $$
DECLARE
  stmt2_id BIGINT;
BEGIN
  INSERT INTO billing_statement (patient_id, statement_number, statement_date, due_date, total_amount, paid_amount, balance_due, status) 
  VALUES (1, 'STMT-2025-002', CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE - INTERVAL '30 days', 180.00, 0.00, 180.00, 'OVERDUE')
  RETURNING statement_id INTO stmt2_id;

  INSERT INTO billing_line_item (statement_id, description, service_date, quantity, unit_price, total_price, display_order) VALUES
  (stmt2_id, 'Office Visit - Follow-up', CURRENT_DATE - INTERVAL '50 days', 1, 120.00, 120.00, 1),
  (stmt2_id, 'Lab Work - Lipid Panel', CURRENT_DATE - INTERVAL '50 days', 1, 60.00, 60.00, 2);
END $$;

-- Statement 3: Paid
DO $$
DECLARE
  stmt3_id BIGINT;
BEGIN
  INSERT INTO billing_statement (patient_id, statement_number, statement_date, due_date, total_amount, paid_amount, balance_due, status) 
  VALUES (1, 'STMT-2024-120', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '45 days', 95.00, 95.00, 0.00, 'PAID')
  RETURNING statement_id INTO stmt3_id;

  INSERT INTO billing_line_item (statement_id, description, service_date, quantity, unit_price, total_price, display_order) VALUES
  (stmt3_id, 'Office Visit - Established Patient', CURRENT_DATE - INTERVAL '65 days', 1, 95.00, 95.00, 1);

  INSERT INTO payment (statement_id, patient_id, amount, payment_date, payment_method, payment_reference, notes) VALUES
  (stmt3_id, 1, 95.00, CURRENT_DATE - INTERVAL '50 days', 'CREDIT_CARD', 'TXN-98765', 'Full payment');
END $$;

-- Seed sample billing statements for patient2 (patient_id = 2)
-- Statement 1: Pending
DO $$
DECLARE
  stmt4_id BIGINT;
BEGIN
  INSERT INTO billing_statement (patient_id, statement_number, statement_date, due_date, total_amount, paid_amount, balance_due, status) 
  VALUES (2, 'STMT-2025-003', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '5 days', 220.00, 0.00, 220.00, 'PENDING')
  RETURNING statement_id INTO stmt4_id;

  INSERT INTO billing_line_item (statement_id, description, service_date, quantity, unit_price, total_price, display_order) VALUES
  (stmt4_id, 'Office Visit - New Patient', CURRENT_DATE - INTERVAL '15 days', 1, 180.00, 180.00, 1),
  (stmt4_id, 'Lab Work - Complete Blood Count', CURRENT_DATE - INTERVAL '15 days', 1, 40.00, 40.00, 2);
END $$;

-- Statement 2: Paid
DO $$
DECLARE
  stmt5_id BIGINT;
BEGIN
  INSERT INTO billing_statement (patient_id, statement_number, statement_date, due_date, total_amount, paid_amount, balance_due, status) 
  VALUES (2, 'STMT-2024-121', CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE - INTERVAL '25 days', 140.00, 140.00, 0.00, 'PAID')
  RETURNING statement_id INTO stmt5_id;

  INSERT INTO billing_line_item (statement_id, description, service_date, quantity, unit_price, total_price, display_order) VALUES
  (stmt5_id, 'Office Visit - Established Patient', CURRENT_DATE - INTERVAL '45 days', 1, 140.00, 140.00, 1);

  INSERT INTO payment (statement_id, patient_id, amount, payment_date, payment_method, payment_reference, notes) VALUES
  (stmt5_id, 2, 140.00, CURRENT_DATE - INTERVAL '30 days', 'DEBIT_CARD', 'TXN-54321', 'Full payment');
END $$;

