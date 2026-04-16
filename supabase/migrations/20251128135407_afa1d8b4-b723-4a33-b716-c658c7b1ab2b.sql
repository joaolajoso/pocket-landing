-- Add banner_url column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS banner_url TEXT;