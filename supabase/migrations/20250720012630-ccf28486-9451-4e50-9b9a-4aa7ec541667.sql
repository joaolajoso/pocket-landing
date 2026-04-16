
-- Create table to track profile slug changes
CREATE TABLE public.profile_slug_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  old_slug TEXT,
  new_slug TEXT NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  onboarding_link_id TEXT,
  reason TEXT DEFAULT 'user_update'
);

-- Add Row Level Security
ALTER TABLE public.profile_slug_history ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own slug history
CREATE POLICY "Users can view their own slug history" 
  ON public.profile_slug_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows system to insert slug history
CREATE POLICY "System can insert slug history" 
  ON public.profile_slug_history 
  FOR INSERT 
  WITH CHECK (true);

-- Create function to check slug availability
CREATE OR REPLACE FUNCTION public.is_slug_available(slug_to_check TEXT, excluding_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Create function to update onboarding records when slug changes
CREATE OR REPLACE FUNCTION public.sync_onboarding_slug(user_id_param UUID, new_slug_param TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update onboarding records that reference this user
  UPDATE public.onboarding 
  SET profile_public_link = new_slug_param
  WHERE used_by = user_id_param;
END;
$$;

-- Create trigger function to automatically log slug changes
CREATE OR REPLACE FUNCTION public.log_slug_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Create trigger on profiles table
CREATE TRIGGER profile_slug_change_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_slug_change();

-- Add index for better performance
CREATE INDEX idx_profile_slug_history_user_id ON public.profile_slug_history(user_id);
CREATE INDEX idx_profile_slug_history_changed_at ON public.profile_slug_history(changed_at);
