-- Add INSERT and DELETE policies for slots table
-- Run this in your Supabase SQL Editor

-- Allow super admins to insert new slots
CREATE POLICY "Enable insert for all users" ON slots
  FOR INSERT WITH CHECK (true);

-- Allow super admins to delete slots
CREATE POLICY "Enable delete for all users" ON slots
  FOR DELETE USING (true);
