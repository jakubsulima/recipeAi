-- Add auth_method column to track how users authenticate
ALTER TABLE app_user ADD COLUMN auth_method VARCHAR(20) NOT NULL DEFAULT 'CREDENTIALS';

-- Make password nullable for OAuth users who don't have a password
ALTER TABLE app_user ALTER COLUMN password DROP NOT NULL;
