-- Add consent columns for data sharing
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS share_email_publicly boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS share_phone_publicly boolean DEFAULT false;

-- Create secure view for public profile data
CREATE OR REPLACE VIEW public_profile_data AS
SELECT 
  p.id,
  p.name,
  p.bio,
  p.headline,
  p.photo_url,
  p.avatar_url,
  p.job_title,
  p.slug,
  p.linkedin,
  p.website,
  p.created_at,
  p.updated_at,
  p.allow_network_saves,
  p.lead_capture_enabled,
  p.organization_id,
  p.status,
  p.links_disclaimer_accepted,
  -- Sensitive data only if explicit consent
  CASE WHEN p.share_email_publicly = true THEN p.email ELSE NULL END as email,
  CASE WHEN p.share_phone_publicly = true THEN p.phone_number ELSE NULL END as phone_number
FROM profiles p
WHERE p.status = 'active';

-- Grant read access to the view
GRANT SELECT ON public_profile_data TO authenticated, anon;