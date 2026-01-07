-- Add department_id column to designations table
ALTER TABLE designations
  ADD COLUMN IF NOT EXISTS department_id BIGINT NULL;

-- Optional: Add foreign key constraint if departments table exists
-- ALTER TABLE designations
--   ADD CONSTRAINT fk_designations_department
--   FOREIGN KEY (department_id) REFERENCES departments(department_id);
-- Note: The foreign key references departments.department_id (the primary key column)

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_designations_department_id ON designations(department_id);

