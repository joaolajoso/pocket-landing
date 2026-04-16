-- Create user_interests table to store user's selected preferences
CREATE TABLE public.user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Arrays with SELECTED options from predefined constants
  professional_roles TEXT[] DEFAULT '{}',
  industries TEXT[] DEFAULT '{}',
  networking_goals TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- One record per user
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;

-- Users can view their own interests
CREATE POLICY "Users can view their own interests"
  ON public.user_interests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own interests
CREATE POLICY "Users can create their own interests"
  ON public.user_interests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own interests
CREATE POLICY "Users can update their own interests"
  ON public.user_interests FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own interests
CREATE POLICY "Users can delete their own interests"
  ON public.user_interests FOR DELETE
  USING (auth.uid() = user_id);

-- Public can view interests from active profiles (for matchmaking)
CREATE POLICY "Public can view interests from active profiles"
  ON public.user_interests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = user_interests.user_id
    AND profiles.status = 'active'
  ));

-- Trigger to update updated_at
CREATE TRIGGER update_user_interests_updated_at
  BEFORE UPDATE ON public.user_interests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();