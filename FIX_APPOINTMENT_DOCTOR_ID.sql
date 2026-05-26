-- Quick fix: Add doctor_id column to appointment table
-- This fixes the schema validation error immediately

DO $$
BEGIN
    -- Check if appointment table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointment') THEN
        -- If provider_id exists, rename it to doctor_id
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointment' AND column_name = 'provider_id')
           AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name = 'appointment' AND column_name = 'doctor_id') THEN
            ALTER TABLE appointment RENAME COLUMN provider_id TO doctor_id;
            RAISE NOTICE 'Renamed provider_id to doctor_id';
        END IF;
        
        -- If doctor_id doesn't exist, add it
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'appointment' AND column_name = 'doctor_id') THEN
            -- Add column (nullable initially)
            ALTER TABLE appointment ADD COLUMN doctor_id BIGINT;
            
            -- Try to populate from existing data if possible
            -- If there are any appointments, set a default doctor_id (first doctor)
            IF EXISTS (SELECT 1 FROM doctors LIMIT 1) THEN
                UPDATE appointment 
                SET doctor_id = (SELECT staff_id FROM doctors LIMIT 1)
                WHERE doctor_id IS NULL;
            END IF;
            
            -- Make it NOT NULL if doctors table exists
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'doctors') THEN
                ALTER TABLE appointment ALTER COLUMN doctor_id SET NOT NULL;
                
                -- Add foreign key constraint
                ALTER TABLE appointment 
                    DROP CONSTRAINT IF EXISTS fk_appointment_doctor;
                    
                ALTER TABLE appointment 
                    ADD CONSTRAINT fk_appointment_doctor 
                    FOREIGN KEY (doctor_id) REFERENCES doctors(staff_id) ON DELETE RESTRICT;
            END IF;
            
            RAISE NOTICE 'Added doctor_id column to appointment table';
        ELSE
            RAISE NOTICE 'doctor_id column already exists';
        END IF;
    ELSE
        RAISE NOTICE 'appointment table does not exist';
    END IF;
END $$;

-- Verify
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'appointment' 
  AND column_name IN ('doctor_id', 'provider_id')
ORDER BY column_name;

