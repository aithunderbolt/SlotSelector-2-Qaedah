-- Create classes table for super admin to manage classes
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- Duration in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated operations (app handles authorization)
CREATE POLICY "Enable read for all users" ON classes
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON classes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON classes
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON classes
  FOR DELETE USING (true);

-- Create index for faster queries
CREATE INDEX idx_classes_name ON classes(name);
