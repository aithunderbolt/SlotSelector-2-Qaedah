-- Create attendance table for slot admins to track attendance
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  attendance_time TIME,
  total_students INTEGER NOT NULL DEFAULT 0,
  students_present INTEGER NOT NULL DEFAULT 0,
  students_absent INTEGER NOT NULL DEFAULT 0,
  students_on_leave INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_student_counts CHECK (
    students_present + students_absent + students_on_leave = total_students
  ),
  UNIQUE(class_id, slot_id, attendance_date)
);

-- Enable RLS
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated operations (app handles authorization)
CREATE POLICY "Enable read for all users" ON attendance
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON attendance
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON attendance
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON attendance
  FOR DELETE USING (true);

-- Create indexes for faster queries
CREATE INDEX idx_attendance_class_id ON attendance(class_id);
CREATE INDEX idx_attendance_slot_id ON attendance(slot_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_attendance_admin_user ON attendance(admin_user_id);
