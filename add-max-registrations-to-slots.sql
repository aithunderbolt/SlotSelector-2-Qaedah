-- Add max_registrations column to slots table
-- This allows each slot to have its own maximum registration limit
-- Run this in your Supabase SQL Editor

-- Add the column with a default value of 15
ALTER TABLE slots 
ADD COLUMN IF NOT EXISTS max_registrations INTEGER DEFAULT 15 NOT NULL;

-- Add a check constraint to ensure valid values (1-100)
ALTER TABLE slots 
ADD CONSTRAINT check_max_registrations_range 
CHECK (max_registrations >= 1 AND max_registrations <= 100);

-- Update existing slots to have the default value
UPDATE slots 
SET max_registrations = 15 
WHERE max_registrations IS NULL;
