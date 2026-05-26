-- Fix appointments table primary key column name
-- Ensure the appointments table has 'id' as the primary key column (not appointment_id)

DO $$
BEGIN
    -- Check if appointments table exists with appointment_id column
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments')
       AND EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'appointment_id')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'appointments' AND column_name = 'id') THEN
        
        -- Rename the primary key column from appointment_id to id
        ALTER TABLE appointments RENAME COLUMN appointment_id TO id;
        
        -- Update the primary key constraint name if needed
        ALTER TABLE appointments RENAME CONSTRAINT appointments_pkey TO appointments_pkey;
        
        RAISE NOTICE 'Renamed appointment_id to id in appointments table';
    END IF;
    
    -- Verify the table has the correct structure
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'appointments' AND column_name = 'id') THEN
            RAISE EXCEPTION 'appointments table exists but does not have id column';
        END IF;
        RAISE NOTICE 'appointments table verified: has id column';
    END IF;
END $$;

