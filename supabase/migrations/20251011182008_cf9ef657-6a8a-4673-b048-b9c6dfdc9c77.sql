-- Fix security warnings

-- Fix function search_path for handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  org_id UUID;
  member_id UUID;
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, name, email, slug)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), 
    NEW.email,
    LOWER(REGEXP_REPLACE(COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), '[^a-zA-Z0-9]', '', 'g'))
  );

  -- Check if this is a business account
  IF NEW.raw_user_meta_data->>'account_type' = 'business' THEN
    -- Create organization for business account  
    INSERT INTO public.organizations (
      name,
      created_by
    ) VALUES (
      COALESCE(NEW.raw_user_meta_data->>'companyName', 'My Company'),
      NEW.id
    ) RETURNING id INTO org_id;

    -- Add user as organization owner
    INSERT INTO public.organization_members (
      organization_id,
      user_id,
      role,
      status,
      joined_at
    ) VALUES (
      org_id,
      NEW.id,
      'owner',
      'active',
      now()
    ) RETURNING id INTO member_id;

    -- Update profile with organization
    UPDATE public.profiles 
    SET organization_id = org_id
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$function$;

-- Fix migrate_existing_links function
CREATE OR REPLACE FUNCTION public.migrate_existing_links()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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