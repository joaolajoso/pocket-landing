-- Create trigger function to assign stand and participant when onboarding is claimed
CREATE OR REPLACE FUNCTION public.handle_onboarding_used_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stand_id uuid;
  prof RECORD;
BEGIN
  -- Act only for event stand registrations
  IF NEW.registration_type = 'event_stand' AND NEW.event_id IS NOT NULL AND NEW.used = true AND NEW.used_by IS NOT NULL THEN

    -- Load profile details for company info and slug
    SELECT slug,
           COALESCE(name, full_name) AS company_name,
           email
      INTO prof
    FROM public.profiles
    WHERE id = NEW.used_by;

    -- Ensure onboarding has the public link synced
    IF NEW.profile_public_link IS NULL AND prof.slug IS NOT NULL THEN
      NEW.profile_public_link := prof.slug;
    END IF;

    -- Resolve stand id if missing, based on onboarding link and event
    stand_id := NEW.event_stand_id;
    IF stand_id IS NULL THEN
      SELECT id INTO stand_id
      FROM public.event_stands
      WHERE event_id = NEW.event_id
        AND onboarding_link_id = NEW.signup_link_id
      LIMIT 1;
      IF stand_id IS NOT NULL THEN
        NEW.event_stand_id := stand_id;
      END IF;
    END IF;

    -- Update the stand assignment and company info
    IF stand_id IS NOT NULL THEN
      UPDATE public.event_stands
      SET assigned_user_id = NEW.used_by,
          company_name = prof.company_name,
          company_email = prof.email,
          updated_at = now()
      WHERE id = stand_id;
    END IF;

    -- Ensure participant exists as a stand for the event (idempotent)
    IF NOT EXISTS (
      SELECT 1 FROM public.event_participants
      WHERE event_id = NEW.event_id AND user_id = NEW.used_by
    ) THEN
      INSERT INTO public.event_participants(event_id, user_id, role, status, checked_in)
      VALUES (NEW.event_id, NEW.used_by, 'stand', 'confirmed', false);
    END IF;

  END IF;

  RETURN NEW;
END;
$$;

-- Create or replace trigger to run before updates marking link as used
DROP TRIGGER IF EXISTS trg_onboarding_used_update ON public.onboarding;

CREATE TRIGGER trg_onboarding_used_update
BEFORE UPDATE ON public.onboarding
FOR EACH ROW
WHEN (NEW.used = true AND NEW.used_by IS NOT NULL)
EXECUTE FUNCTION public.handle_onboarding_used_update();

-- Backfill existing used onboarding rows to assign stands retroactively
UPDATE public.onboarding
SET used = used
WHERE used = true
  AND registration_type = 'event_stand'
  AND event_id IS NOT NULL;