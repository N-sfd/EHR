-- Fix appointments table structure and rename to appointment (singular, canonical)
-- This migration ensures the appointment table has the correct column names and structure
-- Canonical table name: appointment (singular) - Epic/MyChart style

DO $$
BEGIN
    -- Step 0: Rename appointments (plural) to appointment (singular) if needed
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointment') THEN
        ALTER TABLE appointments RENAME TO appointment;
        RAISE NOTICE 'Renamed appointments table to appointment (singular, canonical)';
    END IF;
    
    -- Step 1: Fix primary key column name (appointment_id -> id)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointment') THEN
        -- Check if appointment_id exists and id doesn't
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointment' AND column_name = 'appointment_id')
           AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name = 'appointment' AND column_name = 'id') THEN
            -- Rename appointment_id to id
            ALTER TABLE appointment RENAME COLUMN appointment_id TO id;
            RAISE NOTICE 'Renamed appointment_id to id in appointment table';
        END IF;
        
        -- Step 2: Fix column names (start_date_time -> start_datetime, duration_mins -> duration_minutes)
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointment' AND column_name = 'start_date_time')
           AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name = 'appointment' AND column_name = 'start_datetime') THEN
            ALTER TABLE appointment RENAME COLUMN start_date_time TO start_datetime;
            RAISE NOTICE 'Renamed start_date_time to start_datetime';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointment' AND column_name = 'duration_mins')
           AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name = 'appointment' AND column_name = 'duration_minutes') THEN
            ALTER TABLE appointment RENAME COLUMN duration_mins TO duration_minutes;
            RAISE NOTICE 'Renamed duration_mins to duration_minutes';
        END IF;
        
        -- Step 3: Add missing end_datetime column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'appointment' AND column_name = 'end_datetime') THEN
            ALTER TABLE appointment ADD COLUMN end_datetime TIMESTAMP;
            
            -- Calculate end_datetime from start_datetime + duration_minutes for existing rows
            UPDATE appointment 
            SET end_datetime = start_datetime + (duration_minutes || ' minutes')::INTERVAL
            WHERE end_datetime IS NULL;
            
            -- Make it NOT NULL after populating
            ALTER TABLE appointment ALTER COLUMN end_datetime SET NOT NULL;
            
            RAISE NOTICE 'Added end_datetime column and populated from start_datetime + duration_minutes';
        END IF;
        
        -- Step 4: Add missing columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'appointment' AND column_name = 'version') THEN
            ALTER TABLE appointment ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
            RAISE NOTICE 'Added version column';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'appointment' AND column_name = 'priority') THEN
            ALTER TABLE appointment ADD COLUMN priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL';
            RAISE NOTICE 'Added priority column';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'appointment' AND column_name = 'appointment_type') THEN
            ALTER TABLE appointment ADD COLUMN appointment_type VARCHAR(30) NOT NULL DEFAULT 'IN_PERSON';
            RAISE NOTICE 'Added appointment_type column';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'appointment' AND column_name = 'location_id') THEN
            ALTER TABLE appointment ADD COLUMN location_id BIGINT;
            RAISE NOTICE 'Added location_id column';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'appointment' AND column_name = 'room_id') THEN
            ALTER TABLE appointment ADD COLUMN room_id BIGINT;
            RAISE NOTICE 'Added room_id column';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'appointment' AND column_name = 'visit_type') THEN
            ALTER TABLE appointment ADD COLUMN visit_type VARCHAR(50);
            RAISE NOTICE 'Added visit_type column';
        END IF;
        
        -- Step 5: Ensure status column has correct length (VARCHAR(30) not VARCHAR(20))
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointment' 
                     AND column_name = 'status' 
                     AND character_maximum_length < 30) THEN
            ALTER TABLE appointment ALTER COLUMN status TYPE VARCHAR(30);
            RAISE NOTICE 'Updated status column to VARCHAR(30)';
        END IF;
        
        -- Step 6: Verify the table has id column (critical check)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'appointment' AND column_name = 'id') THEN
            RAISE EXCEPTION 'CRITICAL: appointment table does not have id column after migration';
        END IF;
        
        RAISE NOTICE 'appointment table structure verified and fixed';
    ELSE
        RAISE NOTICE 'appointment table does not exist - skipping structure fixes';
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE appointment IS 'Canonical appointment table (singular, Epic/MyChart style). All appointment operations use this table.';
COMMENT ON COLUMN appointment.id IS 'Primary key (renamed from appointment_id)';
COMMENT ON COLUMN appointment.start_datetime IS 'Appointment start time as TIMESTAMP';
COMMENT ON COLUMN appointment.end_datetime IS 'Appointment end time as TIMESTAMP (calculated from start_datetime + duration_minutes)';
COMMENT ON COLUMN appointment.doctor_id IS 'Foreign key to doctors.staff_id (renamed from provider_id)';

