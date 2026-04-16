-- Create event_participants table to track who's participating in events
CREATE TABLE public.event_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'interested', -- 'interested' or 'participating'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create event_clicks table to track link clicks
CREATE TABLE public.event_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_clicks ENABLE ROW LEVEL SECURITY;

-- Policies for event_participants
CREATE POLICY "Users can view all participants"
  ON public.event_participants
  FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own participation"
  ON public.event_participants
  FOR ALL
  USING (auth.uid() = user_id);

-- Policies for event_clicks
CREATE POLICY "Users can view event clicks"
  ON public.event_clicks
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own clicks"
  ON public.event_clicks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_event_participants_event_id ON public.event_participants(event_id);
CREATE INDEX idx_event_participants_user_id ON public.event_participants(user_id);
CREATE INDEX idx_event_clicks_event_id ON public.event_clicks(event_id);
CREATE INDEX idx_event_clicks_user_id ON public.event_clicks(user_id);