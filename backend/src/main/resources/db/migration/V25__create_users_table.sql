-- Create users table for Phase A authentication
CREATE TABLE IF NOT EXISTS users (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- BCrypt hashed
    role VARCHAR(50) NOT NULL, -- ADMIN, PATIENT, PROVIDER
    patient_id BIGINT, -- Optional: link to patient
    staff_id BIGINT, -- Optional: link to staff
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_role CHECK (role IN ('ADMIN', 'PATIENT', 'PROVIDER'))
);

-- Add foreign key constraints only if referenced tables exist
DO $$
BEGIN
    -- Add foreign key to patients table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_user_patient' AND table_name = 'users'
        ) THEN
            ALTER TABLE users 
            ADD CONSTRAINT fk_user_patient 
            FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE SET NULL;
        END IF;
    END IF;
    
    -- Add foreign key to staff table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_user_staff' AND table_name = 'users'
        ) THEN
            ALTER TABLE users 
            ADD CONSTRAINT fk_user_staff 
            FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- Create indexes (idempotent - drop first if exists, then create)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_username') THEN
        CREATE INDEX idx_users_username ON users(username);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_patient_id') THEN
        CREATE INDEX idx_users_patient_id ON users(patient_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_staff_id') THEN
        CREATE INDEX idx_users_staff_id ON users(staff_id);
    END IF;
END $$;

-- Insert sample users for development
-- Password for all: "password" (BCrypt hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy)
INSERT INTO users (username, password, role, patient_id, staff_id, active) VALUES
    ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', NULL, NULL, true),
    ('patient1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PATIENT', 1, NULL, true),
    ('patient2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PATIENT', 2, NULL, true),
    ('provider1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PROVIDER', NULL, 1, true)
ON CONFLICT (username) DO NOTHING;

