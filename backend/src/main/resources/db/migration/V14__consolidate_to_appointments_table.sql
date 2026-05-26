-- Consolidate to appointments table (plural)
-- Goal: Make 'appointments' the ONLY appointment table
-- 1. Handle old appointments table (V2) - migrate data and drop
-- 2. Rename 'appointment' to 'appointments'
-- 3. Ensure primary key is 'id' not 'appointment_id'
-- 4. Migrate any remaining data from 'scheduling_appointments' to 'appointments'
-- 5. Drop 'scheduling_appointments' table

-- ============================================================================
-- STEP 1: Handle old appointments table (from V2) and rename appointment to appointments
-- ============================================================================
DO $$
BEGIN
    -- First, check if old appointments table exists (from V2 with appointment_id)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments')
       AND EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'appointment_id') THEN
        -- Old appointments table exists - migrate its data and drop it
        RAISE NOTICE 'Found old appointments table (V2) with appointment_id, migrating data...';
        
        -- Migrate data from old appointments to appointment (if appointment exists)
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointment') THEN
            INSERT INTO appointment (
                patient_id, provider_id, department_id, location_id,
                start_datetime, end_datetime, duration_minutes,
                visit_type, status, priority, reason, notes,
                created_at, updated_at, version
            )
            SELECT 
                a.patient_id,
                a.provider_id,
                a.department_id,
                NULL AS location_id,
                a.start_date_time AS start_datetime,
                a.start_date_time + (COALESCE(a.duration_mins, 30) || ' minutes')::INTERVAL AS end_datetime,
                COALESCE(a.duration_mins, 30) AS duration_minutes,
                NULL AS visit_type,
                UPPER(COALESCE(a.status, 'SCHEDULED')) AS status,
                'NORMAL' AS priority,
                a.reason,
                a.notes,
                COALESCE(a.created_at, CURRENT_TIMESTAMP) AS created_at,
                COALESCE(a.updated_at, CURRENT_TIMESTAMP) AS updated_at,
                0 AS version
            FROM appointments a
            WHERE NOT EXISTS (
                SELECT 1 FROM appointment ap 
                WHERE ap.patient_id = a.patient_id 
                  AND ap.provider_id = a.provider_id
                  AND ap.start_datetime = a.start_date_time
            )
            ON CONFLICT DO NOTHING;
            
            RAISE NOTICE 'Migrated data from old appointments table to appointment';
        END IF;
        
        -- Drop old appointments table
        DROP TABLE IF EXISTS appointments CASCADE;
        RAISE NOTICE 'Dropped old appointments table';
    END IF;
    
    -- Now rename appointment (singular) to appointments (plural) if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointment')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
        
        -- Rename the table
        ALTER TABLE appointment RENAME TO appointments;
        RAISE NOTICE 'Renamed appointment table to appointments';
    END IF;
    
    -- Ensure primary key column is named 'id' in appointments table (not appointment_id)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
        -- Check if appointment_id exists and id doesn't
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'appointment_id')
           AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name = 'appointments' AND column_name = 'id') THEN
            -- Rename appointment_id to id
            ALTER TABLE appointments RENAME COLUMN appointment_id TO id;
            RAISE NOTICE 'Renamed appointment_id to id in appointments table';
        END IF;
        
        -- Rename constraints (only if they exist)
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE table_name = 'appointments' AND constraint_name = 'fk_appointment_patient') THEN
                ALTER TABLE appointments RENAME CONSTRAINT fk_appointment_patient TO fk_appointments_patient;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE table_name = 'appointments' AND constraint_name = 'fk_appointment_provider') THEN
                ALTER TABLE appointments RENAME CONSTRAINT fk_appointment_provider TO fk_appointments_provider;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE table_name = 'appointments' AND constraint_name = 'fk_appointment_department') THEN
                ALTER TABLE appointments RENAME CONSTRAINT fk_appointment_department TO fk_appointments_department;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE table_name = 'appointments' AND constraint_name = 'fk_appointment_location') THEN
                ALTER TABLE appointments RENAME CONSTRAINT fk_appointment_location TO fk_appointments_location;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE table_name = 'appointments' AND constraint_name = 'chk_appointment_times') THEN
                ALTER TABLE appointments RENAME CONSTRAINT chk_appointment_times TO chk_appointments_times;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE table_name = 'appointments' AND constraint_name = 'chk_appointment_duration') THEN
                ALTER TABLE appointments RENAME CONSTRAINT chk_appointment_duration TO chk_appointments_duration;
            END IF;
        END $$;
        
        -- Rename indexes (only if they exist)
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_appointment_provider_start') THEN
                ALTER INDEX idx_appointment_provider_start RENAME TO idx_appointments_provider_start;
            END IF;
            IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_appointment_patient_start') THEN
                ALTER INDEX idx_appointment_patient_start RENAME TO idx_appointments_patient_start;
            END IF;
            IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_appointment_start_datetime') THEN
                ALTER INDEX idx_appointment_start_datetime RENAME TO idx_appointments_start_datetime;
            END IF;
            IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_appointment_end_datetime') THEN
                ALTER INDEX idx_appointment_end_datetime RENAME TO idx_appointments_end_datetime;
            END IF;
            IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_appointment_status') THEN
                ALTER INDEX idx_appointment_status RENAME TO idx_appointments_status;
            END IF;
            IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_appointment_department') THEN
                ALTER INDEX idx_appointment_department RENAME TO idx_appointments_department;
            END IF;
            IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_appointment_location') THEN
                ALTER INDEX idx_appointment_location RENAME TO idx_appointments_location;
            END IF;
            IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_appointment_date_range') THEN
                ALTER INDEX idx_appointment_date_range RENAME TO idx_appointments_date_range;
            END IF;
            IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_appointment_room') THEN
                ALTER INDEX idx_appointment_room RENAME TO idx_appointments_room;
            END IF;
            IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_appointment_visit_type') THEN
                ALTER INDEX idx_appointment_visit_type RENAME TO idx_appointments_visit_type;
            END IF;
        END $$;
        
        -- Update foreign key references in other tables
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointment_status_history') THEN
            ALTER TABLE appointment_status_history 
                DROP CONSTRAINT IF EXISTS fk_status_history_appointment;
            IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                          WHERE table_name = 'appointment_status_history' 
                          AND constraint_name = 'fk_status_history_appointments') THEN
                ALTER TABLE appointment_status_history 
                    ADD CONSTRAINT fk_status_history_appointments 
                        FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE;
            END IF;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'waitlist') THEN
            ALTER TABLE waitlist 
                DROP CONSTRAINT IF EXISTS fk_waitlist_appointment;
            IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                          WHERE table_name = 'waitlist' 
                          AND constraint_name = 'fk_waitlist_appointments') THEN
                ALTER TABLE waitlist 
                    ADD CONSTRAINT fk_waitlist_appointments 
                        FOREIGN KEY (converted_to_appointment_id) REFERENCES appointments(id) ON DELETE SET NULL;
            END IF;
        END IF;
    END IF;
END $$;

-- ============================================================================
-- STEP 2: Migrate any remaining data from scheduling_appointments
-- ============================================================================
DO $$
DECLARE
    migrated_count INT;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scheduling_appointments')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
        INSERT INTO appointments (
            patient_id, provider_id, department_id, location_id,
            start_datetime, end_datetime, duration_minutes,
            visit_type, status, priority, reason, notes,
            created_at, updated_at, version
        )
        SELECT 
            sa.patient_id,
            sa.provider_id,
            sa.department_id,
            NULL AS location_id,
            sa.start_date_time AS start_datetime,
            sa.start_date_time + (COALESCE(sa.duration_mins, 30) || ' minutes')::INTERVAL AS end_datetime,
            COALESCE(sa.duration_mins, 30) AS duration_minutes,
            NULL AS visit_type,
            UPPER(COALESCE(sa.status, 'SCHEDULED')) AS status,
            'NORMAL' AS priority,
            sa.reason,
            sa.notes,
            COALESCE(sa.created_at, CURRENT_TIMESTAMP) AS created_at,
            COALESCE(sa.updated_at, CURRENT_TIMESTAMP) AS updated_at,
            0 AS version
        FROM scheduling_appointments sa
        WHERE NOT EXISTS (
            SELECT 1 FROM appointments a 
            WHERE a.patient_id = sa.patient_id 
              AND a.provider_id = sa.provider_id
              AND a.start_datetime = sa.start_date_time
        )
        ON CONFLICT DO NOTHING;
        
        GET DIAGNOSTICS migrated_count = ROW_COUNT;
        RAISE NOTICE 'Migrated % rows from scheduling_appointments to appointments', migrated_count;
    ELSE
        RAISE NOTICE 'scheduling_appointments table does not exist, skipping migration';
    END IF;
END $$;

-- ============================================================================
-- STEP 3: Drop scheduling_appointments table (after migration)
-- ============================================================================
DROP TABLE IF EXISTS scheduling_appointments CASCADE;

-- ============================================================================
-- STEP 4: Update comments
-- ============================================================================
COMMENT ON TABLE appointments IS 'Canonical appointments table. All appointment operations use this table.';
COMMENT ON COLUMN appointments.start_datetime IS 'Appointment start time as TIMESTAMP (not string)';
COMMENT ON COLUMN appointments.end_datetime IS 'Appointment end time as TIMESTAMP (calculated from start_datetime + duration_minutes)';
