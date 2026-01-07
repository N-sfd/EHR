-- Fix departments table schema
-- This script removes the old 'name' column and ensures 'department_name' is used

-- Step 1: If 'name' column exists and has data, copy it to 'department_name' (if department_name is null)
UPDATE departments 
SET department_name = name 
WHERE department_name IS NULL AND name IS NOT NULL;

-- Step 2: Drop the old 'name' column
ALTER TABLE departments DROP COLUMN IF EXISTS name;

-- Step 3: Ensure department_name has NOT NULL constraint
ALTER TABLE departments ALTER COLUMN department_name SET NOT NULL;

