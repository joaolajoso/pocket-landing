
-- Add follow_up_date column to contact_submissions table
ALTER TABLE contact_submissions
ADD COLUMN IF NOT EXISTS follow_up_date TIMESTAMP WITH TIME ZONE;
