
-- Create event_favorites table
CREATE TABLE public.event_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id)
);

ALTER TABLE public.event_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own event favorites"
ON public.event_favorites FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own event favorites"
ON public.event_favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own event favorites"
ON public.event_favorites FOR DELETE
USING (auth.uid() = user_id);

-- Create organizer_favorites table
CREATE TABLE public.organizer_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, organization_id)
);

ALTER TABLE public.organizer_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own organizer favorites"
ON public.organizer_favorites FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own organizer favorites"
ON public.organizer_favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own organizer favorites"
ON public.organizer_favorites FOR DELETE
USING (auth.uid() = user_id);
