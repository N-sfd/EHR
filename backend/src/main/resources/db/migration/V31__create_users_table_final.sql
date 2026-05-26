-- Final migration to ensure users table exists
-- This will run after all other migrations (V30 was the last one)
-- Version 31 ensures it runs regardless of V25/V25_1 status

-- Create users table if it doesn't exist
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

-- Add foreign key constraints only if referenced tables exist (idempotent)
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

-- Create indexes if they don't exist (idempotent)
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_patient_id ON users(patient_id);
CREATE INDEX IF NOT EXISTS idx_users_staff_id ON users(staff_id);

-- Insert sample users (idempotent - checks if referenced IDs exist first)
INSERT INTO users (username, password, role, patient_id, staff_id, active) VALUES
    ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', NULL, NULL, true)
ON CONFLICT (username) DO NOTHING;

-- Insert patient1 - use patient_id=1 only if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients' AND EXISTS (SELECT 1 FROM patients WHERE patient_id = 1)) THEN
        INSERT INTO users (username, password, role, patient_id, staff_id, active) VALUES
            ('patient1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PATIENT', 1, NULL, true)
        ON CONFLICT (username) DO NOTHING;
    ELSE
        INSERT INTO users (username, password, role, patient_id, staff_id, active) VALUES
            ('patient1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PATIENT', NULL, NULL, true)
        ON CONFLICT (username) DO NOTHING;
    END IF;
END $$;

-- Insert patient2 - use patient_id=2 only if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients' AND EXISTS (SELECT 1 FROM patients WHERE patient_id = 2)) THEN
        INSERT INTO users (username, password, role, patient_id, staff_id, active) VALUES
            ('patient2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PATIENT', 2, NULL, true)
        ON CONFLICT (username) DO NOTHING;
    ELSE
        INSERT INTO users (username, password, role, patient_id, staff_id, active) VALUES
            ('patient2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PATIENT', NULL, NULL, true)
        ON CONFLICT (username) DO NOTHING;
    END IF;
END $$;

-- Insert provider1 - use staff_id=1 only if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff' AND EXISTS (SELECT 1 FROM staff WHERE staff_id = 1)) THEN
        INSERT INTO users (username, password, role, patient_id, staff_id, active) VALUES
            ('provider1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PROVIDER', NULL, 1, true)
        ON CONFLICT (username) DO NOTHING;
    ELSE
        INSERT INTO users (username, password, role, patient_id, staff_id, active) VALUES
            ('provider1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PROVIDER', NULL, NULL, true)
        ON CONFLICT (username) DO NOTHING;
    END IF;
END $$;

