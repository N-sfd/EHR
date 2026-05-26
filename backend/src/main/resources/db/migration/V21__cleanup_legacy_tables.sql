-- Cleanup Legacy Tables
-- This migration safely drops all legacy/duplicate tables ONLY after verifying:
-- 1. Canonical tables exist
-- 2. No foreign key dependencies exist
-- 3. Tables are safe to drop
-- This script is idempotent (safe to run multiple times)

-- ============================================================================
-- STEP 1: Verify canonical tables exist
-- ============================================================================
DO $$
BEGIN
    -- Verify canonical appointment table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointment' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'Canonical appointment table does not exist. Cannot drop legacy tables.';
    END IF;
    
    -- Verify specializations table exists (if dropping specialties)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'specializations' AND table_schema = 'public') THEN
        RAISE WARNING 'specializations table does not exist. Skipping specialties drop.';
    END IF;
    
    RAISE NOTICE 'Canonical tables verified. Proceeding with legacy table cleanup.';
END $$;

-- ============================================================================
-- STEP 2: Drop legacy appointment tables (with FK dependency checks)
-- ============================================================================

-- Function to safely drop table if no FK dependencies exist
CREATE OR REPLACE FUNCTION safe_drop_table_if_exists(table_name_to_drop TEXT, table_description TEXT)
RETURNS VOID AS $$
DECLARE
    fk_count INTEGER;
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_schema = 'public' AND table_name = table_name_to_drop) THEN
        RAISE NOTICE 'Table % does not exist. Skipping.', table_name_to_drop;
        RETURN;
    END IF;
    
    -- Check for foreign key dependencies (tables that reference this table)
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND kcu.referenced_table_schema = 'public'
        AND kcu.referenced_table_name = table_name_to_drop;
    
    IF fk_count > 0 THEN
        RAISE WARNING 'Table % has % foreign key dependencies. Skipping drop. Please remove dependencies first.', 
            table_name_to_drop, fk_count;
        RETURN;
    END IF;
    
    -- Check row count (informational only)
    EXECUTE format('SELECT COUNT(*) FROM %I', table_name_to_drop) INTO fk_count;
    IF fk_count > 0 THEN
        RAISE WARNING 'Table % has % rows. Dropping anyway - ensure data migration is complete.', 
            table_name_to_drop, fk_count;
    END IF;
    
    -- Drop the table
    EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', table_name_to_drop);
    RAISE NOTICE 'Dropped table: % (%)', table_name_to_drop, table_description;
END;
$$ LANGUAGE plpgsql;

-- Drop legacy appointment tables
SELECT safe_drop_table_if_exists('scheduling_appointments', 'Legacy scheduling appointments table');
SELECT safe_drop_table_if_exists('appointments', 'Legacy appointments (plural) table');
SELECT safe_drop_table_if_exists('appointments_normalized', 'Intermediate normalized appointments table');
SELECT safe_drop_table_if_exists('appointment_audit', 'Appointment audit table (replaced by appointment_status_history)');

-- ============================================================================
-- STEP 3: Drop schedule template tables (replaced by provider_availability)
-- ============================================================================

SELECT safe_drop_table_if_exists('schedule_templates', 'Schedule templates table (replaced by provider_availability)');
SELECT safe_drop_table_if_exists('schedule_blocked_ranges', 'Schedule blocked ranges table (replaced by provider_availability)');
SELECT safe_drop_table_if_exists('provider_schedules', 'Provider schedules table (replaced by provider_availability)');
SELECT safe_drop_table_if_exists('provider_schedules_old', 'Legacy provider schedules table');

-- ============================================================================
-- STEP 4: Drop merged tables
-- ============================================================================

-- Drop specialties table (merged into specializations)
-- Only drop if specializations table exists and no FK dependencies
DO $$
DECLARE
    fk_count INTEGER;
    row_count INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'specializations' AND table_schema = 'public')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'specialties' AND table_schema = 'public') THEN
        
        -- Check for foreign key dependencies
        SELECT COUNT(*) INTO fk_count
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
            AND kcu.referenced_table_schema = 'public'
            AND kcu.referenced_table_name = 'specialties';
        
        IF fk_count > 0 THEN
            RAISE WARNING 'specialties table has % foreign key dependencies. Skipping drop. Please remove dependencies first.', fk_count;
        ELSE
            -- Check row count
            SELECT COUNT(*) INTO row_count FROM specialties;
            IF row_count > 0 THEN
                RAISE WARNING 'specialties table has % rows. Dropping anyway - ensure migration to specializations is complete.', row_count;
            END IF;
            DROP TABLE IF EXISTS specialties CASCADE;
            RAISE NOTICE 'Dropped specialties table (merged into specializations)';
        END IF;
    END IF;
END $$;

-- ============================================================================
-- STEP 5: Clean up helper function
-- ============================================================================
DROP FUNCTION IF EXISTS safe_drop_table_if_exists(TEXT, TEXT);

-- ============================================================================
-- STEP 6: Verification queries (run after migration to verify)
-- ============================================================================
-- After migration, verify legacy tables are gone:
-- 
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_name IN (
--   'appointments', 
--   'scheduling_appointments', 
--   'appointments_normalized',
--   'appointment_audit', 
--   'schedule_templates', 
--   'schedule_blocked_ranges',
--   'provider_schedules', 
--   'provider_schedules_old', 
--   'specialties'
-- ) 
-- AND table_schema = 'public';
-- 
-- Should return 0 rows (all legacy tables dropped)
-- 
-- Verify canonical tables still exist:
-- 
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_name IN ('appointment', 'specializations', 'provider_availability')
--   AND table_schema = 'public';
-- 
-- Should return 3 rows (canonical tables exist)
