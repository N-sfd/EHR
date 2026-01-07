-- Migrate specialties table to specializations
-- This script renames the table and updates column names

-- Step 1: Rename the table
ALTER TABLE specialties RENAME TO specializations;

-- Step 2: Rename the primary key column
ALTER TABLE specializations RENAME COLUMN specialty_id TO specialization_id;

-- Step 3: If there are any foreign key constraints, they will need to be updated
-- Check for foreign keys referencing specialties table and update them accordingly

