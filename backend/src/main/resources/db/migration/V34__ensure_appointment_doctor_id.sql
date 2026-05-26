-- Ensure appointment table has doctor_id column
-- This migration fixes the schema mismatch where the entity expects doctor_id
-- but the table might still have provider_id or be missing the column

DO $$
BEGIN
    -- Check if appointment table exists (singular, canonical)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointment') THEN
        -- Case 1: Table has provider_id but not doctor_id - rename it
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointment' AND column_name = 'provider_id')
           AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name = 'appointment' AND column_name = 'doctor_id') THEN
            -- Rename provider_id to doctor_id
            ALTER TABLE appointment RENAME COLUMN provider_id TO doctor_id;
            
            -- Update foreign key constraint if it exists
            ALTER TABLE appointment 
                DROP CONSTRAINT IF EXISTS fk_appointments_provider,
                DROP CONSTRAINT IF EXISTS appointments_provider_id_fkey;
            
            -- Add new foreign key to doctors.staff_id
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'doctors') THEN
                ALTER TABLE appointment 
                    ADD CONSTRAINT fk_appointment_doctor 
                    FOREIGN KEY (doctor_id) REFERENCES doctors(staff_id) ON DELETE RESTRICT;
            END IF;
            
            RAISE NOTICE 'Renamed provider_id to doctor_id in appointment table';
        END IF;
        
        -- Case 2: Table is missing doctor_id entirely - add it
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'appointment' AND column_name = 'doctor_id') THEN
            -- Add doctor_id column (nullable initially, will need to populate)
            ALTER TABLE appointment ADD COLUMN doctor_id BIGINT;
            
            -- Try to populate from existing provider_id if it exists
            IF EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'appointment' AND column_name = 'provider_id') THEN
                -- Map provider_id to doctor_id via staff table if possible
                UPDATE appointment a
                SET doctor_id = (
                    SELECT d.staff_id 
                    FROM doctors d 
                    JOIN staff s ON d.staff_id = s.staff_id
                    WHERE s.staff_id IN (
                        SELECT staff_id FROM staff 
                        WHERE first_name || ' ' || last_name IN (
                            SELECT first_name || ' ' || last_name 
                            FROM providers 
                            WHERE provider_id = a.provider_id
                        )
                    )
                    LIMIT 1
                )
                WHERE doctor_id IS NULL;
            END IF;
            
            -- Make it NOT NULL if we have doctors table, otherwise leave nullable
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'doctors') THEN
                -- Set a default value for any remaining NULLs (use first doctor if available)
                UPDATE appointment 
                SET doctor_id = (SELECT staff_id FROM doctors LIMIT 1)
                WHERE doctor_id IS NULL 
                  AND EXISTS (SELECT 1 FROM doctors);
                
                -- Now make it NOT NULL
                ALTER TABLE appointment ALTER COLUMN doctor_id SET NOT NULL;
                
                -- Add foreign key constraint
                ALTER TABLE appointment 
                    ADD CONSTRAINT fk_appointment_doctor 
                    FOREIGN KEY (doctor_id) REFERENCES doctors(staff_id) ON DELETE RESTRICT;
            END IF;
            
            RAISE NOTICE 'Added doctor_id column to appointment table';
        END IF;
        
        -- Case 3: Table exists but is named appointments (plural) - rename it
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments')
           AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointment') THEN
            ALTER TABLE appointments RENAME TO appointment;
            RAISE NOTICE 'Renamed appointments table to appointment (singular)';
        END IF;
        
        -- Ensure doctor_id column exists and has proper constraints
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointment' AND column_name = 'doctor_id') THEN
            -- Verify foreign key exists
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'appointment' 
                  AND constraint_name = 'fk_appointment_doctor'
                  AND constraint_type = 'FOREIGN KEY'
            ) AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'doctors') THEN
                ALTER TABLE appointment 
                    ADD CONSTRAINT fk_appointment_doctor 
                    FOREIGN KEY (doctor_id) REFERENCES doctors(staff_id) ON DELETE RESTRICT;
                RAISE NOTICE 'Added foreign key constraint for doctor_id';
            END IF;
        END IF;
        
        RAISE NOTICE 'appointment table doctor_id column verified';
    ELSE
        RAISE NOTICE 'appointment table does not exist - skipping doctor_id fix';
    END IF;
END $$;

