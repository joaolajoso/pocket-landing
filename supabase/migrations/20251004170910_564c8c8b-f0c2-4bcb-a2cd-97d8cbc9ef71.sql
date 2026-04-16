-- Step 1: Enable RLS on tables only (excluding views)
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.top_profile_views ENABLE ROW LEVEL SECURITY;

-- Step 2: Clean orphaned data in correct order (respecting foreign key dependencies)

-- Clean employee_data_permissions orphaned by organization_members
DELETE FROM public.employee_data_permissions 
WHERE organization_member_id NOT IN (SELECT id FROM public.organization_members);

-- Clean organization_members orphaned by users not in profiles
DELETE FROM public.organization_members 
WHERE user_id NOT IN (SELECT id FROM public.profiles);

-- Clean organizations orphaned by users not in profiles  
DELETE FROM public.organizations 
WHERE created_by NOT IN (SELECT id FROM public.profiles);

-- Clean organization_invitations orphaned by organizations or users
DELETE FROM public.organization_invitations 
WHERE organization_id NOT IN (SELECT id FROM public.organizations)
   OR invited_by NOT IN (SELECT id FROM public.profiles);

-- Clean organization_goals orphaned by organizations or users
DELETE FROM public.organization_goals 
WHERE organization_id NOT IN (SELECT id FROM public.organizations)
   OR created_by NOT IN (SELECT id FROM public.profiles)
   OR (assigned_to IS NOT NULL AND assigned_to NOT IN (SELECT id FROM public.profiles));

-- Clean links orphaned by users not in profiles
DELETE FROM public.links 
WHERE user_id NOT IN (SELECT id FROM public.profiles);

-- Clean link_groups orphaned by users not in profiles
DELETE FROM public.link_groups 
WHERE user_id NOT IN (SELECT id FROM public.profiles);

-- Clean profile_design_settings orphaned by users not in profiles  
DELETE FROM public.profile_design_settings 
WHERE user_id NOT IN (SELECT id FROM public.profiles);

-- Clean employee_activity_log orphaned by users not in profiles
DELETE FROM public.employee_activity_log 
WHERE employee_id NOT IN (SELECT id FROM public.profiles);

-- Clean employee_performance_metrics orphaned by users not in profiles
DELETE FROM public.employee_performance_metrics 
WHERE employee_id NOT IN (SELECT id FROM public.profiles);

-- Clean connections orphaned by users not in profiles
DELETE FROM public.connections 
WHERE user_id NOT IN (SELECT id FROM public.profiles)
   OR connected_user_id NOT IN (SELECT id FROM public.profiles);

-- Clean contact_submissions orphaned by users not in profiles
DELETE FROM public.contact_submissions 
WHERE profile_owner_id NOT IN (SELECT id FROM public.profiles);

-- Step 3: Add foreign key constraints to reference public.profiles
ALTER TABLE public.links ADD CONSTRAINT fk_links_user_id FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.link_groups ADD CONSTRAINT fk_link_groups_user_id FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.profile_design_settings ADD CONSTRAINT fk_profile_design_settings_user_id FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.organization_members ADD CONSTRAINT fk_organization_members_user_id FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.organizations ADD CONSTRAINT fk_organizations_created_by FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.organization_invitations ADD CONSTRAINT fk_organization_invitations_invited_by FOREIGN KEY (invited_by) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.organization_goals ADD CONSTRAINT fk_organization_goals_created_by FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.organization_goals ADD CONSTRAINT fk_organization_goals_assigned_to FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.employee_activity_log ADD CONSTRAINT fk_employee_activity_log_employee_id FOREIGN KEY (employee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.employee_performance_metrics ADD CONSTRAINT fk_employee_performance_metrics_employee_id FOREIGN KEY (employee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.connections ADD CONSTRAINT fk_connections_user_id FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.connections ADD CONSTRAINT fk_connections_connected_user_id FOREIGN KEY (connected_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.contact_submissions ADD CONSTRAINT fk_contact_submissions_profile_owner_id FOREIGN KEY (profile_owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Step 4: Update handle_new_user trigger to handle business accounts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Step 5: Create organizations for existing business users without organizations
DO $$
DECLARE
  user_record RECORD;
  org_id UUID;
  member_id UUID;
BEGIN
  -- Find users with business account type but no organization
  FOR user_record IN 
    SELECT p.id, p.name, p.email
    FROM public.profiles p
    LEFT JOIN auth.users au ON au.id = p.id
    WHERE p.organization_id IS NULL
    AND au.raw_user_meta_data->>'account_type' = 'business'
  LOOP
    -- Create organization
    INSERT INTO public.organizations (
      name,
      created_by
    ) VALUES (
      COALESCE(user_record.name || '''s Company', 'My Company'),
      user_record.id
    ) RETURNING id INTO org_id;

    -- Add as organization owner
    INSERT INTO public.organization_members (
      organization_id,
      user_id,
      role,
      status,
      joined_at
    ) VALUES (
      org_id,
      user_record.id,
      'owner',
      'active',
      now()
    ) RETURNING id INTO member_id;

    -- Update profile
    UPDATE public.profiles 
    SET organization_id = org_id
    WHERE id = user_record.id;
  END LOOP;
END $$;