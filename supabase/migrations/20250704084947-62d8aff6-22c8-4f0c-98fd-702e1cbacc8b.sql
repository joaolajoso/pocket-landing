
-- Add lead_capture_enabled column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN lead_capture_enabled boolean NOT NULL DEFAULT true;

-- Add comment to explain the column
COMMENT ON COLUMN public.profiles.lead_capture_enabled IS 'Controls whether the lead capture popup and floating button are shown on the user profile page';
