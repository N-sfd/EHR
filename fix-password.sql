-- Fix password hash for all users
UPDATE users SET password = '$2a$10$PAabNqJUqr226nEcM.Ki5OGmuzGr.SmaUqOOsmL7syeFzdyn6pSSm' WHERE active = true;

-- Verify
SELECT user_id, username, role, LENGTH(password) as pwd_len FROM users ORDER BY username;
