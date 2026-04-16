-- Fix Security Warning: Function Search Path Mutable
-- Update all functions to have explicit search_path

CREATE OR REPLACE FUNCTION public.sync_onboarding_slug(user_id_param uuid, new_slug_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.onboarding 
  SET profile_public_link = new_slug_param
  WHERE used_by = user_id_param;
END;
$function$;

CREATE OR REPLACE FUNCTION public.migrate_existing_links()
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  profile_record RECORD;
  default_group_id UUID;
BEGIN
  FOR profile_record IN SELECT id, linkedin, website, email FROM profiles WHERE linkedin IS NOT NULL OR website IS NOT NULL OR email IS NOT NULL LOOP
    INSERT INTO link_groups (user_id, title) 
    VALUES (profile_record.id, 'Contact Information')
    RETURNING id INTO default_group_id;
    
    IF profile_record.linkedin IS NOT NULL THEN
      INSERT INTO links (user_id, group_id, title, url, icon) 
      VALUES (
        profile_record.id, 
        default_group_id, 
        'LinkedIn Profile', 
        profile_record.linkedin, 
        'linkedin'
      );
    END IF;
    
    IF profile_record.website IS NOT NULL THEN
      INSERT INTO links (user_id, group_id, title, url, icon) 
      VALUES (
        profile_record.id, 
        default_group_id, 
        'Website', 
        profile_record.website, 
        'website'
      );
    END IF;
    
    IF profile_record.email IS NOT NULL THEN
      INSERT INTO links (user_id, group_id, title, url, icon) 
      VALUES (
        profile_record.id, 
        default_group_id, 
        'Email', 
        CASE 
          WHEN profile_record.email LIKE 'mailto:%' THEN profile_record.email
          ELSE 'mailto:' || profile_record.email
        END, 
        'email'
      );
    END IF;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_signup_links(count_param integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..count_param LOOP
    INSERT INTO public.onboarding (signup_link_id)
    VALUES (encode(gen_random_bytes(10), 'hex'));
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.refresh_top_profile_views()
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM top_profile_views;

  INSERT INTO top_profile_views (id, name, top_views, refreshed_at)
  SELECT
    ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS id,
    p.name,
    COUNT(*) AS top_views,
    CURRENT_TIMESTAMP
  FROM profile_views pv
  INNER JOIN profiles p ON p.id = pv.profile_id
  WHERE p.slug NOT IN (
    'jootest', 'joaolajosotest', 'johndoe', 'victordejulio',
    'joao', 'simopedrosil', 'sharonnicollepardobarrios', 'victorjulio'
  )
  GROUP BY pv.profile_id, p.name
  HAVING COUNT(*) > 2
  ORDER BY top_views DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.deactivate_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.profiles 
  SET status = 'deactivated', updated_at = now()
  WHERE id = auth.uid();
END;
$function$;