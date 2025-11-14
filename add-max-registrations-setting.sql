-- Add max_registrations_per_slot setting to the settings table
-- Run this in your Supabase SQL Editor

-- Insert default max registrations per slot setting
INSERT INTO settings (key, value) 
VALUES ('max_registrations_per_slot', '15')
ON CONFLICT (key) DO NOTHING;
