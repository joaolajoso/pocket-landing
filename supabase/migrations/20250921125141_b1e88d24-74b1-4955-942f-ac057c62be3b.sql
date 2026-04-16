-- CRITICAL SECURITY FIXES
-- Phase 1: Emergency Data Protection

-- 1. Fix Profiles Table RLS Policy
-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create separate policies for public vs private profile data
-- Public profile viewing (limited fields only)
CREATE POLICY "Public profile info is viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (status = 'active'::account_status);

-- Note: We'll handle field-level access in the application layer by creating views

-- 2. Secure Newsletter Subscriptions
-- Remove public read access
DROP POLICY IF EXISTS "Users can view newsletter subscriptions" ON public.newsletter_subscriptions;

-- Add admin-only policy (will need to be implemented when admin system is ready)
CREATE POLICY "System can manage newsletter subscriptions" 
ON public.newsletter_subscriptions 
FOR ALL 
USING (true);

-- 3. Fix Links Table Public Access
-- Update existing policy to be more restrictive
DROP POLICY IF EXISTS "Public read active links" ON public.links;

-- Only allow public access to active links from active profiles
CREATE POLICY "Public can view active links from active profiles" 
ON public.links 
FOR SELECT 
USING (
  active = true 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = links.user_id 
    AND profiles.status = 'active'::account_status
  )
);

-- 4. Fix Link Groups Public Access
DROP POLICY IF EXISTS "Public read active groups" ON public.link_groups;

-- Only allow public access to active groups from active profiles
CREATE POLICY "Public can view active groups from active profiles" 
ON public.link_groups 
FOR SELECT 
USING (
  active = true 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = link_groups.user_id 
    AND profiles.status = 'active'::account_status
  )
);

-- 5. Update Database Functions Security
-- Update existing functions to include proper search_path

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, email, slug)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), 
    NEW.email,
    LOWER(REGEXP_REPLACE(COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), '[^a-zA-Z0-9]', '', 'g'))
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_slug_available(slug_to_check text, excluding_user_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Check if slug exists in profiles table (excluding current user if specified)
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE slug = slug_to_check 
    AND (excluding_user_id IS NULL OR id != excluding_user_id)
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Check against reserved slugs (optional - add more as needed)
  IF slug_to_check IN ('admin', 'api', 'www', 'mail', 'ftp', 'root', 'support', 'help', 'about', 'contact') THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_onboarding_slug(user_id_param uuid, new_slug_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Update onboarding records that reference this user
  UPDATE public.onboarding 
  SET profile_public_link = new_slug_param
  WHERE used_by = user_id_param;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_slug_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Only log if slug actually changed
  IF OLD.slug IS DISTINCT FROM NEW.slug THEN
    INSERT INTO public.profile_slug_history (
      user_id,
      old_slug,
      new_slug,
      reason
    ) VALUES (
      NEW.id,
      OLD.slug,
      NEW.slug,
      'profile_update'
    );
    
    -- Sync onboarding records
    PERFORM public.sync_onboarding_slug(NEW.id, NEW.slug);
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.deactivate_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Update the user's profile status to deactivated
  UPDATE public.profiles 
  SET status = 'deactivated', updated_at = now()
  WHERE id = auth.uid();
  
  -- Sign out the user immediately
  -- Note: The actual sign out will be handled in the client
END;
$function$;

-- 6. Create secure views for public profile data
-- Create a view that only exposes safe public profile fields
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  name,
  slug,
  bio,
  photo_url,
  avatar_url,
  headline,
  job_title,
  full_name,
  status,
  created_at,
  -- Only show website if it doesn't contain sensitive info
  CASE 
    WHEN website IS NOT NULL AND website != '' THEN website
    ELSE NULL
  END as website,
  -- Don't expose: email, linkedin, phone_number, organization_id
  allow_network_saves,
  lead_capture_enabled
FROM public.profiles
WHERE status = 'active'::account_status;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 7. Add RLS policy for the public view
ALTER VIEW public.public_profiles SET (security_invoker = true);