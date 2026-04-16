
-- Function: profiles → links (sync linkedin/website fields to links table)
CREATE OR REPLACE FUNCTION sync_profile_to_links()
RETURNS TRIGGER AS $$
DECLARE
  existing_link_id uuid;
BEGIN
  -- Prevent infinite loop
  IF current_setting('app.syncing_links', true) = 'true' THEN
    RETURN NEW;
  END IF;
  
  PERFORM set_config('app.syncing_links', 'true', true);

  -- Sync linkedin
  IF NEW.linkedin IS DISTINCT FROM OLD.linkedin THEN
    SELECT id INTO existing_link_id FROM public.links 
      WHERE user_id = NEW.id AND icon = 'linkedin' LIMIT 1;
    
    IF NEW.linkedin IS NOT NULL AND NEW.linkedin != '' THEN
      IF existing_link_id IS NOT NULL THEN
        UPDATE public.links SET url = NEW.linkedin, active = true, updated_at = now()
          WHERE id = existing_link_id;
      ELSE
        INSERT INTO public.links (user_id, title, url, icon, active, position)
          VALUES (NEW.id, 'LinkedIn', NEW.linkedin, 'linkedin', true, 0);
      END IF;
    ELSE
      IF existing_link_id IS NOT NULL THEN
        UPDATE public.links SET active = false, updated_at = now()
          WHERE id = existing_link_id;
      END IF;
    END IF;
  END IF;

  -- Sync website
  IF NEW.website IS DISTINCT FROM OLD.website THEN
    SELECT id INTO existing_link_id FROM public.links 
      WHERE user_id = NEW.id AND icon = 'website' ORDER BY position LIMIT 1;
    
    IF NEW.website IS NOT NULL AND NEW.website != '' THEN
      IF existing_link_id IS NOT NULL THEN
        UPDATE public.links SET url = NEW.website, active = true, updated_at = now()
          WHERE id = existing_link_id;
      ELSE
        INSERT INTO public.links (user_id, title, url, icon, active, position)
          VALUES (NEW.id, 'Website', NEW.website, 'website', true, 1);
      END IF;
    ELSE
      IF existing_link_id IS NOT NULL THEN
        UPDATE public.links SET active = false, updated_at = now()
          WHERE id = existing_link_id;
      END IF;
    END IF;
  END IF;

  PERFORM set_config('app.syncing_links', 'false', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: links → profiles (sync linkedin/website links back to profiles)
CREATE OR REPLACE FUNCTION sync_links_to_profile()
RETURNS TRIGGER AS $$
DECLARE
  field_name text;
  new_url text;
  target_user_id uuid;
BEGIN
  IF current_setting('app.syncing_links', true) = 'true' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  PERFORM set_config('app.syncing_links', 'true', true);

  IF TG_OP = 'DELETE' THEN
    IF OLD.icon = 'linkedin' THEN field_name := 'linkedin';
    ELSIF OLD.icon = 'website' THEN field_name := 'website';
    END IF;
    target_user_id := OLD.user_id;
    IF field_name IS NOT NULL THEN
      EXECUTE format('UPDATE public.profiles SET %I = NULL WHERE id = $1', field_name) USING target_user_id;
    END IF;
    PERFORM set_config('app.syncing_links', 'false', true);
    RETURN OLD;
  ELSE
    IF NEW.icon = 'linkedin' THEN field_name := 'linkedin';
    ELSIF NEW.icon = 'website' THEN field_name := 'website';
    END IF;
    target_user_id := NEW.user_id;
    IF field_name IS NOT NULL THEN
      new_url := CASE WHEN NEW.active THEN NEW.url ELSE NULL END;
      EXECUTE format('UPDATE public.profiles SET %I = $1 WHERE id = $2', field_name) USING new_url, target_user_id;
    END IF;
    PERFORM set_config('app.syncing_links', 'false', true);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
CREATE TRIGGER trg_sync_profile_to_links
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION sync_profile_to_links();

CREATE TRIGGER trg_sync_links_to_profile
  AFTER INSERT OR UPDATE OR DELETE ON public.links
  FOR EACH ROW EXECUTE FUNCTION sync_links_to_profile();
