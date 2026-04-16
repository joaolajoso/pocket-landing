-- Drop and recreate the view with SECURITY INVOKER to use querying user's permissions
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
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
COMMENT ON VIEW public.public_profiles IS 'Public-safe view of profiles that excludes sensitive PII like email and phone_number. Uses SECURITY INVOKER to enforce RLS of querying user.';