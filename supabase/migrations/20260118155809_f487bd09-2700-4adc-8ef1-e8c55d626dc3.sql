-- Ensure new users use the new public page by default
-- First, update all existing users who don't have it set to true
UPDATE public.profiles 
SET use_new_public_page = true 
WHERE use_new_public_page = false OR use_new_public_page IS NULL;

-- Set the default value for new users to true
ALTER TABLE public.profiles 
ALTER COLUMN use_new_public_page SET DEFAULT true;