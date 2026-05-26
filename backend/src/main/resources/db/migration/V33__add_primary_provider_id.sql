-- Add primary_provider_id column to patients table
-- This references staff_id (which can be a doctor/provider)

DO $$
BEGIN
    -- Add column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'patients' AND column_name = 'primary_provider_id'
    ) THEN
        ALTER TABLE patients 
        ADD COLUMN primary_provider_id BIGINT;
        
        -- Copy data from primary_doctor_id if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'patients' AND column_name = 'primary_doctor_id'
        ) THEN
            UPDATE patients 
            SET primary_provider_id = primary_doctor_id 
            WHERE primary_doctor_id IS NOT NULL;
        END IF;
        
        -- Add foreign key constraint if staff table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff') THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'fk_patient_primary_provider' AND table_name = 'patients'
            ) THEN
                ALTER TABLE patients 
                ADD CONSTRAINT fk_patient_primary_provider 
                FOREIGN KEY (primary_provider_id) REFERENCES staff(staff_id) ON DELETE SET NULL;
            END IF;
        END IF;
        
        -- Create index
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_patients_primary_provider_id') THEN
            CREATE INDEX idx_patients_primary_provider_id ON patients(primary_provider_id);
        END IF;
    END IF;
END $$;

