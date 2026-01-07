-- Patient Access (Prelude) Tables

CREATE TABLE IF NOT EXISTS patients (
    patient_id BIGSERIAL PRIMARY KEY,
    mrn VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    sex VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(100),
    address_line1 VARCHAR(200),
    address_line2 VARCHAR(200),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patient_mrn ON patients(mrn);
CREATE INDEX idx_patient_name ON patients(first_name, last_name);

CREATE TABLE IF NOT EXISTS patient_alerts (
    patient_id BIGINT NOT NULL,
    alert VARCHAR(255),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS coverages (
    coverage_id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    payer VARCHAR(200) NOT NULL,
    member_id VARCHAR(50) NOT NULL,
    group_number VARCHAR(50),
    start_date DATE,
    end_date DATE,
    eligibility_status VARCHAR(20) NOT NULL,
    copay DECIMAL(10, 2),
    deductible DECIMAL(10, 2),
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

CREATE INDEX idx_coverage_patient ON coverages(patient_id);
CREATE INDEX idx_coverage_status ON coverages(eligibility_status);

