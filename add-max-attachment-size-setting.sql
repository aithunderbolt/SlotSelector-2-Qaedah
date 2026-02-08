-- Add default max attachment size setting (in KB)
-- Default is 400 KB

INSERT INTO settings (key, value) 
VALUES ('max_attachment_size_kb', '400')
ON CONFLICT (key) DO NOTHING;
