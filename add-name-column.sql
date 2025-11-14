-- Add name column to users table
-- Run this in your Supabase SQL Editor

ALTER TABLE users ADD COLUMN name TEXT;

-- Optional: Update existing users with a default name if needed
-- UPDATE users SET name = username WHERE name IS NULL;
