-- Migration: Update staff.photo_url column from VARCHAR(500) to TEXT
-- This allows storing base64-encoded images which can be much longer than 500 characters

-- For PostgreSQL
ALTER TABLE staff ALTER COLUMN photo_url TYPE TEXT;

-- For MySQL/MariaDB (if needed)
-- ALTER TABLE staff MODIFY COLUMN photo_url TEXT;

-- For H2 (if used for testing)
-- ALTER TABLE staff ALTER COLUMN photo_url TEXT;

