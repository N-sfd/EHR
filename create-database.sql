-- SQL script to create staff_db database
-- Run this using: psql -U postgres -f create-database.sql
-- Or connect to PostgreSQL and run: CREATE DATABASE staff_db;

CREATE DATABASE staff_db;

-- Verify creation
\c staff_db
SELECT 'Database staff_db created successfully!' AS message;






