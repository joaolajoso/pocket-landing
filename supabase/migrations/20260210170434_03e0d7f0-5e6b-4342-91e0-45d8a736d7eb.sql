CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, name, slug, onboarding_completed)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    LOWER(REGEXP_REPLACE(
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      '[^a-zA-Z0-9]', '', 'g'
    )),
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(profiles.name, EXCLUDED.name);

  -- Handle business accounts
  IF NEW.raw_user_meta_data->>'account_type' = 'business' THEN
    INSERT INTO public.organizations (name, size_category, created_by)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'companyName', 'My Company'),
      NEW.raw_user_meta_data->>'companySize',
      NEW.id
    ) RETURNING id INTO org_id;

    INSERT INTO public.organization_members (organization_id, user_id, role, status, joined_at)
    VALUES (org_id, NEW.id, 'owner', 'active', now());

    UPDATE public.profiles SET organization_id = org_id WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;