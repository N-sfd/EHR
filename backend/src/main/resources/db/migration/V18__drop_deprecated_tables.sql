-- Drop deprecated appointment tables after data migration verification
-- Only run after confirming all data has been migrated to canonical 'appointment' table
-- This migration is safe to run multiple times (uses IF EXISTS)

-- ============================================================================
-- STEP 1: Verify data migration (manual check recommended before running)
-- ============================================================================
-- Run these queries manually to verify before dropping:
-- 
-- SELECT COUNT(*) as total_in_appointment FROM appointment;
-- SELECT COUNT(*) as total_in_appointments FROM appointments;
-- SELECT COUNT(*) as total_in_scheduling_appointments FROM scheduling_appointments;
-- 
-- Verify: total_in_appointment >= (total_in_appointments + total_in_scheduling_appointments)

-- ============================================================================
-- STEP 2: Drop deprecated appointment tables
-- ============================================================================

-- Drop scheduling_appointments (legacy table)
DROP TABLE IF EXISTS scheduling_appointments CASCADE;

-- Drop appointments (plural, legacy table) - only if appointment (singular) exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointment') THEN
        DROP TABLE IF EXISTS appointments CASCADE;
        RAISE NOTICE 'Dropped deprecated appointments (plural) table';
    ELSE
        RAISE NOTICE 'appointment (singular) table does not exist - skipping drop of appointments (plural)';
    END IF;
END $$;

-- Drop appointments_normalized (intermediate table, if exists)
DROP TABLE IF EXISTS appointments_normalized CASCADE;

-- Drop appointment audit/history tables (if not using audit features)
DROP TABLE IF EXISTS appointment_audit CASCADE;
DROP TABLE IF EXISTS appointment_status_history CASCADE;

-- ============================================================================
-- STEP 3: Drop deprecated specialties table (merged into specializations)
-- ============================================================================
-- Only drop if specializations table exists and has data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'specializations')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'specialties') THEN
        -- Check if there's any data in specialties that needs migration
        IF EXISTS (SELECT 1 FROM specialties LIMIT 1) THEN
            RAISE NOTICE 'WARNING: specialties table has data. Ensure migration to specializations is complete before dropping.';
            -- Uncomment to drop after verification:
            -- DROP TABLE IF EXISTS specialties CASCADE;
        ELSE
            DROP TABLE IF EXISTS specialties CASCADE;
            RAISE NOTICE 'Dropped empty specialties table (merged into specializations)';
        END IF;
    END IF;
END $$;

-- ============================================================================
-- STEP 4: Drop other deprecated tables (if they exist)
-- ============================================================================

-- Drop provider_schedules_old (if exists)
DROP TABLE IF EXISTS provider_schedules_old CASCADE;

-- Drop rooming table (if exists and not used - fold into encounters later)
-- Uncomment only after confirming no active usage:
-- DROP TABLE IF EXISTS rooming CASCADE;

-- ============================================================================
-- Verification queries (run after migration)
-- ============================================================================
-- Verify deprecated tables are gone:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_name IN ('appointments', 'scheduling_appointments', 'appointments_normalized', 'specialties')
-- AND table_schema = 'public';
-- 
-- Should return 0 rows (all deprecated tables dropped)

