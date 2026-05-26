-- Drop ALL unused/legacy tables from database
-- This migration removes tables that are not referenced by any JPA entities
-- Run after verifying data migration is complete

-- ============================================================================
-- STEP 1: Drop legacy appointment tables (duplicates)
-- ============================================================================

-- Drop scheduling_appointments (legacy)
DROP TABLE IF EXISTS scheduling_appointments CASCADE;

-- Drop appointments (plural, legacy) - only if appointment (singular) exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointment') THEN
        DROP TABLE IF EXISTS appointments CASCADE;
        RAISE NOTICE 'Dropped deprecated appointments (plural) table';
    END IF;
END $$;

-- Drop appointments_normalized (intermediate)
DROP TABLE IF EXISTS appointments_normalized CASCADE;

-- Drop appointment audit table (if not using audit features)
DROP TABLE IF EXISTS appointment_audit CASCADE;

-- KEEP appointment_status_history (used for tracking status changes)

-- ============================================================================
-- STEP 2: Drop providers table (already dropped by V15, but safe to retry)
-- ============================================================================
-- V15 migration already dropped providers table, but this is safe to run again

DROP TABLE IF EXISTS providers CASCADE;
DROP TABLE IF EXISTS provider_schedules CASCADE;  -- Replaced by provider_availability
DROP TABLE IF EXISTS provider_schedules_old CASCADE;
DROP TABLE IF EXISTS provider_to_doctor_mapping CASCADE;

-- KEEP provider_availability (used for provider availability management)
-- KEEP provider_encounters (used for clinical encounters)

-- ============================================================================
-- STEP 3: Drop specialties table (merged into specializations)
-- ============================================================================
-- Drop specialties table if specializations exists (canonical table)
-- WARNING: Ensure any data in specialties has been migrated to specializations first

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'specializations')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'specialties') THEN
        -- Check if there's any data in specialties that needs migration
        IF EXISTS (SELECT 1 FROM specialties LIMIT 1) THEN
            RAISE WARNING 'specialties table has data. Dropping anyway - ensure migration to specializations is complete.';
        END IF;
        DROP TABLE IF EXISTS specialties CASCADE;
        RAISE NOTICE 'Dropped specialties table (merged into specializations)';
    END IF;
END $$;

-- ============================================================================
-- STEP 4: Drop duplicate Encounter entity table (if root Encounter not used)
-- ============================================================================
-- Note: Both com.ehr.staffservice.entity.Encounter and 
-- com.ehr.staffservice.entity.ambulatory.Encounter map to "encounters" table
-- The ambulatory.Encounter is the canonical one
-- Root Encounter entity may have schema mismatches - verify before dropping

-- Keep encounters table (used by ambulatory.Encounter)
-- If root Encounter entity is not used, it should be removed from code, not table

-- ============================================================================
-- STEP 5: Keep rooming table (USED)
-- ============================================================================
-- Rooming table is USED by:
-- - Rooming entity
-- - RoomingRepository
-- - RoomingService
-- - RoomingController
-- DO NOT DROP - Keep this table

-- ============================================================================
-- STEP 6: Drop schedule template tables (replaced by provider_availability)
-- ============================================================================
-- These tables are replaced by provider_availability for availability management

DROP TABLE IF EXISTS schedule_templates CASCADE;
DROP TABLE IF EXISTS schedule_blocked_ranges CASCADE;

-- ============================================================================
-- STEP 7: KEEP patient_access_patients (used for patient access management)
-- ============================================================================
-- DO NOT DROP - This table is used for patient access management

-- ============================================================================
-- STEP 8: Drop patient_consents (if not used - check for entity)
-- ============================================================================
-- Uncomment only if no PatientConsent entity exists:
-- DROP TABLE IF EXISTS patient_consents CASCADE;

-- ============================================================================
-- STEP 9: Keep these tables (USED by entities)
-- ============================================================================
-- DO NOT DROP:
-- - encounter_diagnoses (used by ambulatory.Encounter @ElementCollection)
-- - encounter_orders (used by ambulatory.Encounter @ElementCollection)
-- - visit_type_departments (used by VisitType @ElementCollection)
-- - visit_type_resources (used by VisitType @ElementCollection)
-- - patient_addresses (has PatientAddress entity)
-- - patient_contacts (has PatientContact entity)
-- - patient_demographics (has PatientDemographics entity)
-- - clinical_notes (has ClinicalNote entity)
-- - clinical_alerts (has ClinicalAlert entity)
-- - clinic_settings (has ClinicSettings entity)
-- - patients (canonical)
-- - appointment (canonical, singular)
-- - permissions (canonical)
-- - specializations (canonical)

-- ============================================================================
-- STEP 10: Verification queries (run after migration)
-- ============================================================================
-- Verify deprecated tables are gone:
-- 
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_name IN (
--   'appointments', 
--   'scheduling_appointments', 
--   'appointments_normalized',
--   'appointment_audit',
--   'appointment_status_history',
--   'providers',
--   'provider_schedules',
--   'provider_schedules_old',
--   'schedule_templates',
--   'schedule_blocked_ranges',
--   'specialties',
--   'patient_access_patients'
-- )
-- AND table_schema = 'public';
-- 
-- Should return 0 rows (all deprecated tables dropped)

-- ============================================================================
-- STEP 11: Final verification - list all remaining tables
-- ============================================================================
-- Run this to see all tables after cleanup:
--
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
--   AND table_type = 'BASE TABLE'
-- ORDER BY table_name;

