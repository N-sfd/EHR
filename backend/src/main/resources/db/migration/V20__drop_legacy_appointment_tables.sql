-- Drop Legacy Appointment Tables
-- This migration safely drops legacy appointment tables ONLY if the canonical 'appointment' table exists
-- Run this AFTER confirming all code uses the canonical 'appointment' table

-- ============================================================================
-- STEP 1: Verify canonical table exists
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointment' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'Canonical appointment table does not exist. Cannot drop legacy tables.';
    END IF;
    RAISE NOTICE 'Canonical appointment table exists. Proceeding with legacy table cleanup.';
END $$;

-- ============================================================================
-- STEP 2: Drop legacy appointment tables (duplicates)
-- ============================================================================

-- Drop scheduling_appointments (legacy)
DROP TABLE IF EXISTS scheduling_appointments CASCADE;

-- Drop appointments (plural, legacy) - only if appointment (singular) exists
DROP TABLE IF EXISTS appointments CASCADE;

-- Drop appointments_normalized (intermediate)
DROP TABLE IF EXISTS appointments_normalized CASCADE;

-- Drop appointment_audit (if not using audit features)
-- Note: appointment_status_history is KEPT as it's used for tracking status changes
DROP TABLE IF EXISTS appointment_audit CASCADE;

-- ============================================================================
-- STEP 3: Drop schedule template tables (if provider_availability replaces them)
-- ============================================================================
-- Uncomment if ScheduleTemplate code is removed and provider_availability is used instead:
-- DROP TABLE IF EXISTS schedule_templates CASCADE;
-- DROP TABLE IF EXISTS schedule_blocked_ranges CASCADE;

-- ============================================================================
-- STEP 4: Verification
-- ============================================================================
-- After migration, verify legacy tables are gone:
-- 
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_name IN ('appointments', 'scheduling_appointments', 'appointments_normalized', 'appointment_audit')
--   AND table_schema = 'public';
-- 
-- Should return 0 rows (all legacy tables dropped)
-- 
-- Verify canonical table still exists:
-- 
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_name = 'appointment' AND table_schema = 'public';
-- 
-- Should return 1 row (canonical table exists)

