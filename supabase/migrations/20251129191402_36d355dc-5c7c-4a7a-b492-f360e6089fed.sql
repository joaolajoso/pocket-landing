-- Add follow_up_reminder_days column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS follow_up_reminder_days INTEGER DEFAULT 5 NOT NULL;

COMMENT ON COLUMN public.profiles.follow_up_reminder_days IS 'Number of business days before follow-up reminder is triggered for new contacts';

-- Add function to calculate business days (excluding weekends)
CREATE OR REPLACE FUNCTION public.add_business_days(start_date DATE, days INTEGER)
RETURNS DATE
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  result_date DATE := start_date;
  days_added INTEGER := 0;
BEGIN
  WHILE days_added < days LOOP
    result_date := result_date + 1;
    -- Skip weekends (Saturday = 6, Sunday = 0)
    IF EXTRACT(DOW FROM result_date) NOT IN (0, 6) THEN
      days_added := days_added + 1;
    END IF;
  END LOOP;
  RETURN result_date;
END;
$$;

-- Create trigger function to auto-set follow_up_date on contact_submissions
CREATE OR REPLACE FUNCTION public.set_auto_follow_up_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reminder_days INTEGER;
BEGIN
  -- Get the profile owner's follow-up reminder days setting
  SELECT follow_up_reminder_days INTO reminder_days
  FROM public.profiles
  WHERE id = NEW.profile_owner_id;
  
  -- If not set, default to 5 days
  reminder_days := COALESCE(reminder_days, 5);
  
  -- Set follow_up_date to X business days from creation
  NEW.follow_up_date := public.add_business_days(CURRENT_DATE, reminder_days);
  
  RETURN NEW;
END;
$$;

-- Create trigger on contact_submissions
DROP TRIGGER IF EXISTS trigger_set_auto_follow_up_date ON public.contact_submissions;

CREATE TRIGGER trigger_set_auto_follow_up_date
BEFORE INSERT ON public.contact_submissions
FOR EACH ROW
EXECUTE FUNCTION public.set_auto_follow_up_date();