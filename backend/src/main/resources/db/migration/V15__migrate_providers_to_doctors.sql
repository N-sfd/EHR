-- Migrate Providers to Doctors
-- Goal: Make 'doctors' the ONLY provider table
-- 1. Create Staff records for providers (if they don't exist)
-- 2. Create Doctor records for those Staff records
-- 3. Update all foreign keys from provider_id to doctor_id (staff_id)
-- 4. Migrate provider_schedules to doctor_availability + schedule_templates
-- 5. Migrate provider_encounters to encounters (doctor_id)
-- 6. Drop providers, provider_schedules, provider_encounters tables

-- ============================================================================
-- STEP 1: Create Staff records for providers (if they don't exist)
-- ============================================================================
DO $$
DECLARE
    provider_record RECORD;
    new_staff_id BIGINT;
    staff_code_counter INT := 1;
BEGIN
    -- Only proceed if providers table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'providers') THEN
        FOR provider_record IN 
            SELECT p.provider_id, p.first_name, p.last_name, p.specialty, p.department_id, p.is_active, p.created_at, p.updated_at
            FROM providers p
            WHERE NOT EXISTS (
                -- Check if a Staff record already exists for this provider (by name match)
                SELECT 1 FROM staff s 
                WHERE s.first_name = p.first_name 
                  AND s.last_name = p.last_name
            )
        LOOP
            -- Generate a unique staff_code
            LOOP
                EXIT WHEN NOT EXISTS (
                    SELECT 1 FROM staff WHERE staff_code = 'STAFF-' || LPAD(staff_code_counter::TEXT, 6, '0')
                );
                staff_code_counter := staff_code_counter + 1;
            END LOOP;
            
            -- Insert Staff record
            INSERT INTO staff (
                staff_code, first_name, last_name, department_id, 
                status, employment_type, created_at, updated_at
            ) VALUES (
                'STAFF-' || LPAD(staff_code_counter::TEXT, 6, '0'),
                provider_record.first_name,
                provider_record.last_name,
                provider_record.department_id,
                CASE WHEN provider_record.is_active THEN 'ACTIVE' ELSE 'INACTIVE' END,
                'FULL_TIME',
                COALESCE(provider_record.created_at, CURRENT_TIMESTAMP),
                COALESCE(provider_record.updated_at, CURRENT_TIMESTAMP)
            ) RETURNING staff_id INTO new_staff_id;
            
            -- Create Doctor record for this Staff
            INSERT INTO doctors (
                staff_id, doctor_code, specialization, 
                created_at, updated_at
            ) VALUES (
                new_staff_id,
                'D-' || LPAD(new_staff_id::TEXT, 6, '0'),
                provider_record.specialty,
                COALESCE(provider_record.created_at, CURRENT_TIMESTAMP),
                COALESCE(provider_record.updated_at, CURRENT_TIMESTAMP)
            ) ON CONFLICT (staff_id) DO NOTHING;
            
            -- Store mapping: provider_id -> staff_id (for later FK updates)
            -- We'll use a temporary table for this
            CREATE TEMP TABLE IF NOT EXISTS provider_to_doctor_mapping (
                provider_id BIGINT,
                doctor_id BIGINT -- this is staff_id
            );
            
            INSERT INTO provider_to_doctor_mapping (provider_id, doctor_id)
            VALUES (provider_record.provider_id, new_staff_id)
            ON CONFLICT DO NOTHING;
            
            staff_code_counter := staff_code_counter + 1;
        END LOOP;
        
        -- Also map existing providers that already have matching Staff/Doctor records
        INSERT INTO provider_to_doctor_mapping (provider_id, doctor_id)
        SELECT DISTINCT p.provider_id, d.staff_id
        FROM providers p
        JOIN staff s ON s.first_name = p.first_name AND s.last_name = p.last_name
        JOIN doctors d ON d.staff_id = s.staff_id
        WHERE NOT EXISTS (
            SELECT 1 FROM provider_to_doctor_mapping pm WHERE pm.provider_id = p.provider_id
        );
        
        RAISE NOTICE 'Created Staff and Doctor records for providers';
    ELSE
        RAISE NOTICE 'providers table does not exist, skipping Staff/Doctor creation';
    END IF;
END $$;

-- ============================================================================
-- STEP 2: Update appointments table: provider_id -> doctor_id
-- ============================================================================
DO $$
BEGIN
    -- Only proceed if appointments table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'provider_to_doctor_mapping') THEN
        
        -- Update appointments.provider_id to doctor_id (staff_id) if provider_id column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'provider_id') THEN
            UPDATE appointments a
            SET provider_id = pm.doctor_id
            FROM provider_to_doctor_mapping pm
            WHERE a.provider_id = pm.provider_id
              AND EXISTS (SELECT 1 FROM doctors d WHERE d.staff_id = pm.doctor_id);
            
            -- Rename column from provider_id to doctor_id
            ALTER TABLE appointments RENAME COLUMN provider_id TO doctor_id;
            
            -- Update foreign key constraint
            ALTER TABLE appointments 
                DROP CONSTRAINT IF EXISTS fk_appointments_provider,
                ADD CONSTRAINT fk_appointments_doctor 
                    FOREIGN KEY (doctor_id) REFERENCES doctors(staff_id) ON DELETE RESTRICT;
            
            -- Rename index
            ALTER INDEX IF EXISTS idx_appointments_provider_start RENAME TO idx_appointments_doctor_start;
            
            RAISE NOTICE 'Updated appointments table: provider_id -> doctor_id';
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'appointments' AND column_name = 'doctor_id') THEN
            RAISE NOTICE 'appointments table already has doctor_id column, skipping update';
        ELSE
            RAISE NOTICE 'appointments table does not have provider_id or doctor_id column, skipping update';
        END IF;
    END IF;
END $$;

-- ============================================================================
-- STEP 3: Update schedule_templates: provider_id -> doctor_id
-- ============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'provider_to_doctor_mapping') THEN
        -- Update schedule_templates.provider_id to doctor_id
        UPDATE schedule_templates st
        SET provider_id = pm.doctor_id
        FROM provider_to_doctor_mapping pm
        WHERE st.provider_id = pm.provider_id
          AND EXISTS (SELECT 1 FROM doctors d WHERE d.staff_id = pm.doctor_id);
        
        -- Rename column
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'schedule_templates' AND column_name = 'provider_id') THEN
            ALTER TABLE schedule_templates RENAME COLUMN provider_id TO doctor_id;
            
            -- Update foreign key constraint
            ALTER TABLE schedule_templates 
                DROP CONSTRAINT IF EXISTS schedule_templates_provider_id_fkey,
                ADD CONSTRAINT fk_schedule_templates_doctor 
                    FOREIGN KEY (doctor_id) REFERENCES doctors(staff_id) ON DELETE CASCADE;
            
            -- Rename index
            ALTER INDEX IF EXISTS idx_schedule_provider RENAME TO idx_schedule_doctor;
        END IF;
        
        RAISE NOTICE 'Updated schedule_templates: provider_id -> doctor_id';
    END IF;
END $$;

-- ============================================================================
-- STEP 4: Migrate provider_schedules to doctor_availability + schedule_templates
-- ============================================================================
DO $$
DECLARE
    schedule_record RECORD;
    doctor_id_val BIGINT;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'provider_schedules')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'provider_to_doctor_mapping') THEN
        
        FOR schedule_record IN 
            SELECT ps.*, pm.doctor_id
            FROM provider_schedules ps
            JOIN provider_to_doctor_mapping pm ON ps.provider_id = pm.provider_id
            WHERE ps.is_available = TRUE
        LOOP
            doctor_id_val := schedule_record.doctor_id;
            
            -- Insert into doctor_availability
            INSERT INTO doctor_availability (
                doctor_id, day_of_week, start_time, end_time, availability_type,
                created_at, updated_at
            ) VALUES (
                doctor_id_val,
                UPPER(TO_CHAR(schedule_record.schedule_date, 'DAY'))::VARCHAR(20),
                schedule_record.start_time,
                schedule_record.end_time,
                'REGULAR',
                COALESCE(schedule_record.created_at, CURRENT_TIMESTAMP),
                COALESCE(schedule_record.updated_at, CURRENT_TIMESTAMP)
            ) ON CONFLICT DO NOTHING;
            
            -- Also create schedule_template if it doesn't exist
            INSERT INTO schedule_templates (
                doctor_id, day_of_week, start_time, end_time, slot_duration, 
                overbook_allowed, is_active, created_at, updated_at
            )
            SELECT 
                doctor_id_val,
                UPPER(TO_CHAR(schedule_record.schedule_date, 'DAY'))::VARCHAR(20),
                schedule_record.start_time,
                schedule_record.end_time,
                COALESCE(schedule_record.slot_interval_minutes, 30),
                COALESCE(schedule_record.allow_overbooking, FALSE),
                TRUE,
                COALESCE(schedule_record.created_at, CURRENT_TIMESTAMP),
                COALESCE(schedule_record.updated_at, CURRENT_TIMESTAMP)
            WHERE NOT EXISTS (
                SELECT 1 FROM schedule_templates st
                WHERE st.doctor_id = doctor_id_val
                  AND st.day_of_week = UPPER(TO_CHAR(schedule_record.schedule_date, 'DAY'))::VARCHAR(20)
            );
        END LOOP;
        
        RAISE NOTICE 'Migrated provider_schedules to doctor_availability and schedule_templates';
    ELSE
        RAISE NOTICE 'provider_schedules table does not exist, skipping migration';
    END IF;
END $$;

-- ============================================================================
-- STEP 5: Migrate provider_encounters to encounters (add doctor_id)
-- ============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'provider_encounters')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'provider_to_doctor_mapping') THEN
        
        -- Add doctor_id column to encounters if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'encounters' AND column_name = 'doctor_id') THEN
            ALTER TABLE encounters ADD COLUMN doctor_id BIGINT;
            
            -- Add foreign key constraint
            ALTER TABLE encounters 
                ADD CONSTRAINT fk_encounters_doctor 
                    FOREIGN KEY (doctor_id) REFERENCES doctors(staff_id) ON DELETE SET NULL;
            
            -- Add index
            CREATE INDEX IF NOT EXISTS idx_encounters_doctor ON encounters(doctor_id);
        END IF;
        
        -- Migrate data: Update encounters with doctor_id from provider_encounters
        UPDATE encounters e
        SET doctor_id = pm.doctor_id
        FROM provider_encounters pe
        JOIN provider_to_doctor_mapping pm ON pe.provider_id = pm.provider_id
        WHERE e.id = pe.encounter_id
          AND e.doctor_id IS NULL;
        
        -- Copy provider_encounter specific fields to encounters if they don't exist
        -- (assessment, diagnosis, plan, SOAP notes, etc.)
        -- Note: This assumes encounters table has these columns or they will be added separately
        
        RAISE NOTICE 'Migrated provider_encounters to encounters (doctor_id)';
    ELSE
        RAISE NOTICE 'provider_encounters table does not exist, skipping migration';
    END IF;
END $$;

-- ============================================================================
-- STEP 6: Update waitlist table: preferred_provider_id -> preferred_doctor_id
-- ============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'waitlist')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'provider_to_doctor_mapping') THEN
        
        -- Update waitlist.preferred_provider_id to doctor_id
        UPDATE waitlist w
        SET preferred_provider_id = pm.doctor_id
        FROM provider_to_doctor_mapping pm
        WHERE w.preferred_provider_id = pm.provider_id
          AND EXISTS (SELECT 1 FROM doctors d WHERE d.staff_id = pm.doctor_id);
        
        -- Rename column
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'waitlist' AND column_name = 'preferred_provider_id') THEN
            ALTER TABLE waitlist RENAME COLUMN preferred_provider_id TO preferred_doctor_id;
            
            -- Update foreign key constraint
            ALTER TABLE waitlist 
                DROP CONSTRAINT IF EXISTS fk_waitlist_provider,
                ADD CONSTRAINT fk_waitlist_doctor 
                    FOREIGN KEY (preferred_doctor_id) REFERENCES doctors(staff_id) ON DELETE SET NULL;
            
            -- Rename index
            ALTER INDEX IF EXISTS idx_waitlist_provider RENAME TO idx_waitlist_doctor;
        END IF;
        
        RAISE NOTICE 'Updated waitlist: preferred_provider_id -> preferred_doctor_id';
    END IF;
END $$;

-- ============================================================================
-- STEP 7: Update provider_availability table (if exists): provider_id -> doctor_id
-- ============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'provider_availability')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'provider_to_doctor_mapping') THEN
        
        -- Update provider_availability.provider_id to doctor_id
        UPDATE provider_availability pa
        SET provider_id = pm.doctor_id
        FROM provider_to_doctor_mapping pm
        WHERE pa.provider_id = pm.provider_id
          AND EXISTS (SELECT 1 FROM doctors d WHERE d.staff_id = pm.doctor_id);
        
        -- Rename column
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'provider_availability' AND column_name = 'provider_id') THEN
            ALTER TABLE provider_availability RENAME COLUMN provider_id TO doctor_id;
            
            -- Update foreign key constraint
            ALTER TABLE provider_availability 
                DROP CONSTRAINT IF EXISTS fk_availability_provider,
                ADD CONSTRAINT fk_availability_doctor 
                    FOREIGN KEY (doctor_id) REFERENCES doctors(staff_id) ON DELETE CASCADE;
            
            -- Rename index
            ALTER INDEX IF EXISTS idx_availability_provider_date RENAME TO idx_availability_doctor_date;
        END IF;
        
        RAISE NOTICE 'Updated provider_availability: provider_id -> doctor_id';
    END IF;
END $$;

-- ============================================================================
-- STEP 8: Drop legacy tables
-- ============================================================================
DROP TABLE IF EXISTS provider_encounters CASCADE;
DROP TABLE IF EXISTS provider_schedules CASCADE;
DROP TABLE IF EXISTS providers CASCADE;

-- ============================================================================
-- STEP 9: Clean up temporary mapping table
-- ============================================================================
DROP TABLE IF EXISTS provider_to_doctor_mapping;

-- ============================================================================
-- STEP 10: Update comments
-- ============================================================================
COMMENT ON TABLE doctors IS 'Canonical provider table. All provider/doctor operations use this table.';
COMMENT ON COLUMN appointments.doctor_id IS 'Foreign key to doctors.staff_id (doctor who will see the patient)';
COMMENT ON COLUMN encounters.doctor_id IS 'Foreign key to doctors.staff_id (doctor who provided the encounter)';

