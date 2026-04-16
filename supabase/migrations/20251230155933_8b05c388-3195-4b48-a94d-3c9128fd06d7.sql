-- Add onboarding_completed column to profiles table
-- Default TRUE for existing users (they won't see onboarding)
-- New users will have FALSE set via trigger

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- Set all existing users to completed (they already have accounts)
UPDATE public.profiles SET onboarding_completed = true WHERE onboarding_completed = false;

-- Update the handle_new_user trigger to set onboarding_completed = false for new signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, onboarding_completed)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'),
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(profiles.name, EXCLUDED.name);
  RETURN new;
END;
$$;