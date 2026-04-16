-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public profile info is viewable by everyone" ON public.profiles;

-- Update the existing user view policy to allow full access to own data
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Drop existing view if it exists and recreate with safe fields
DROP VIEW IF EXISTS public.public_profiles;

-- Create a safe public view that excludes sensitive information like email and phone
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  name,
  bio,
  headline,
  photo_url,
  avatar_url,
  job_title,
  slug,
  linkedin,
  website,
  created_at,
  updated_at,
  allow_network_saves,
  lead_capture_enabled,
  links_disclaimer_accepted,
  organization_id,
  status
  -- Explicitly excludes: email, phone_number (sensitive PII)
FROM public.profiles
WHERE status = 'active';

-- Grant SELECT access to the safe public view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Add comment explaining the security measure
COMMENT ON VIEW public.public_profiles IS 'Public-safe view of profiles that excludes sensitive PII like email and phone_number. Use this view for public profile pages.';