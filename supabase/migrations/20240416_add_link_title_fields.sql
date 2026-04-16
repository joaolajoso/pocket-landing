
-- Add title fields for each link type to store custom titles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS linkedin_title TEXT,
ADD COLUMN IF NOT EXISTS website_title TEXT,
ADD COLUMN IF NOT EXISTS email_title TEXT;
