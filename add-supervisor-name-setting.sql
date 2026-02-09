-- Insert default supervisor name setting
INSERT INTO settings (key, value) 
VALUES ('supervisor_name', 'Farheen')
ON CONFLICT (key) DO NOTHING;
