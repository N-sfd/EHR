-- Drop Legacy Tables V22
-- This migration drops tables that are NOT referenced by any JPA entity, repository, service, or controller
-- All tables dropped here have been verified to have no code references
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
    
    -- Verify canonical doctors table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'doctors' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'Canonical doctors table does not exist. Cannot drop legacy tables.';
    END IF;
    
    -- Verify canonical specializations table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'specializations' AND table_schema = 'public') THEN
        RAISE WARNING 'specializations table does not exist. Skipping specialties drop.';
    END IF;
    
    RAISE NOTICE 'Canonical tables verified. Proceeding with legacy table cleanup.';
END $$;

-- ============================================================================
-- STEP 2: Function to safely drop table if no FK dependencies exist
-- ============================================================================
CREATE OR REPLACE FUNCTION safe_drop_table_if_exists(table_name_to_drop TEXT, table_description TEXT)
RETURNS VOID AS $$
DECLARE
    fk_count INTEGER;
    row_count INTEGER;
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
    EXECUTE format('SELECT COUNT(*) FROM %I', table_name_to_drop) INTO row_count;
    IF row_count > 0 THEN
        RAISE WARNING 'Table % has % rows. Dropping anyway - ensure data migration is complete.', 
            table_name_to_drop, row_count;
    END IF;
    
    -- Drop the table
    EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', table_name_to_drop);
    RAISE NOTICE 'Dropped table: % (%)', table_name_to_drop, table_description;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 3: Drop legacy provider tables (replaced by doctors)
-- ============================================================================

-- Drop providers table (replaced by doctors)
SELECT safe_drop_table_if_exists('providers', 'Legacy providers table (replaced by doctors)');

-- Drop provider_schedules table (replaced by doctor_availability)
SELECT safe_drop_table_if_exists('provider_schedules', 'Legacy provider_schedules table (replaced by doctor_availability)');

-- ============================================================================
-- STEP 4: Drop legacy schedule template tables (replaced by doctor_availability)
-- ============================================================================

-- Drop schedule_templates table (replaced by doctor_availability)
SELECT safe_drop_table_if_exists('schedule_templates', 'Legacy schedule_templates table (replaced by doctor_availability)');

-- Drop schedule_blocked_ranges table (replaced by doctor_availability)
SELECT safe_drop_table_if_exists('schedule_blocked_ranges', 'Legacy schedule_blocked_ranges table (replaced by doctor_availability)');

-- ============================================================================
-- STEP 5: Drop duplicate scheduling tables
-- ============================================================================

-- Drop scheduling_departments table (duplicate of departments table)
-- Verified: No JPA entity, repository, or service references this table
-- All code uses canonical Department entity (departments table)
SELECT safe_drop_table_if_exists('scheduling_departments', 'Duplicate scheduling_departments table (replaced by departments)');

-- ============================================================================
-- STEP 6: Drop merged tables
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
-- STEP 7: Clean up helper function
-- ============================================================================
DROP FUNCTION IF EXISTS safe_drop_table_if_exists(TEXT, TEXT);

-- ============================================================================
-- STEP 8: Verification queries (run after migration to verify)
-- ============================================================================
-- After migration, verify legacy tables are gone:
-- 
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_name IN (
--   'providers',
--   'provider_schedules',
--   'schedule_templates',
--   'schedule_blocked_ranges',
--   'scheduling_departments',
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
-- WHERE table_name IN ('appointment', 'doctors', 'specializations', 'doctor_availability')
--   AND table_schema = 'public';
-- 
-- Should return 4 rows (canonical tables exist)
-- 
-- Verify no FK dependencies on dropped tables:
-- 
-- SELECT 
--     tc.table_name AS referencing_table,
--     kcu.column_name AS referencing_column,
--     kcu.referenced_table_name AS referenced_table
-- FROM information_schema.table_constraints tc
-- JOIN information_schema.key_column_usage kcu 
--     ON tc.constraint_name = kcu.constraint_name
--     AND tc.table_schema = kcu.table_schema
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--     AND tc.table_schema = 'public'
--     AND kcu.referenced_table_name IN (
--         'providers', 'provider_schedules', 'schedule_templates', 
--         'schedule_blocked_ranges', 'scheduling_departments', 'specialties'
--     );
-- 
-- Should return 0 rows (no FK dependencies)

