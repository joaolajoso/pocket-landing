
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  org_id UUID;
  base_slug TEXT;
  final_slug TEXT;
  slug_counter INTEGER := 0;
BEGIN
  -- Generate base slug
  base_slug := LOWER(REGEXP_REPLACE(
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    '[^a-zA-Z0-9]', '', 'g'
  ));
  
  -- Handle empty slug
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'user' || SUBSTR(NEW.id::text, 1, 8);
  END IF;
  
  -- Find unique slug
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE slug = final_slug AND id != NEW.id) LOOP
    slug_counter := slug_counter + 1;
    final_slug := base_slug || slug_counter::text;
  END LOOP;

  -- Create profile
  INSERT INTO public.profiles (id, email, name, slug, onboarding_completed)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    final_slug,
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
$function$;
