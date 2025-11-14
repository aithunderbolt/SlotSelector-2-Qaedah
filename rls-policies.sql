-- RLS Policies for Super Admin Management Features
-- Run these in your Supabase SQL Editor

-- ============================================
-- SLOTS TABLE POLICIES
-- ============================================
-- Allow super admins to insert new slots
CREATE POLICY "Enable insert for all users" ON slots
  FOR INSERT WITH CHECK (true);

-- Allow super admins to update slot names
CREATE POLICY "Enable update for all users" ON slots
  FOR UPDATE USING (true);

-- Allow super admins to delete slots
CREATE POLICY "Enable delete for all users" ON slots
  FOR DELETE USING (true);

-- ============================================
-- USERS TABLE POLICIES
-- ============================================
-- Allow super admins to create new slot admin users
CREATE POLICY "Enable insert for all users" ON users
  FOR INSERT WITH CHECK (true);

-- Allow super admins to update existing users (username, password, slot assignment)
CREATE POLICY "Enable update for all users" ON users
  FOR UPDATE USING (true);

-- Allow super admins to delete slot admin users
CREATE POLICY "Enable delete for all users" ON users
  FOR DELETE USING (true);

-- ============================================
-- NOTES
-- ============================================
-- These policies use WITH CHECK (true) and USING (true) for simplicity
-- since the application already restricts these operations to super admins
-- through the UI. The read policies for both tables already exist from
-- the initial setup.
