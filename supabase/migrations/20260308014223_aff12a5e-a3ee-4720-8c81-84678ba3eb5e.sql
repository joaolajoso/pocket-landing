
-- Support messages table for participant-organizer communication
CREATE TABLE public.event_support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_organizer BOOLEAN NOT NULL DEFAULT false,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_event_support_messages_event ON public.event_support_messages(event_id);
CREATE INDEX idx_event_support_messages_sender ON public.event_support_messages(event_id, sender_id);

-- Enable RLS
ALTER TABLE public.event_support_messages ENABLE ROW LEVEL SECURITY;

-- Participants can read their own support messages + organizer replies
CREATE POLICY "Participants can read own support messages"
ON public.event_support_messages FOR SELECT TO authenticated
USING (
  sender_id = auth.uid()
  OR (is_organizer = true AND EXISTS (
    SELECT 1 FROM event_participants ep WHERE ep.event_id = event_support_messages.event_id AND ep.user_id = auth.uid()
  ))
  OR EXISTS (
    SELECT 1 FROM event_participants ep WHERE ep.event_id = event_support_messages.event_id AND ep.user_id = auth.uid() AND ep.role = 'organizer'
  )
  OR EXISTS (
    SELECT 1 FROM events e WHERE e.id = event_support_messages.event_id AND e.created_by = auth.uid()
  )
);

-- Participants can send support messages
CREATE POLICY "Participants can send support messages"
ON public.event_support_messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM event_participants ep WHERE ep.event_id = event_support_messages.event_id AND ep.user_id = auth.uid()
  )
);

-- Organizers can update (mark as read)
CREATE POLICY "Organizers can update support messages"
ON public.event_support_messages FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM event_participants ep WHERE ep.event_id = event_support_messages.event_id AND ep.user_id = auth.uid() AND ep.role = 'organizer'
  )
  OR EXISTS (
    SELECT 1 FROM events e WHERE e.id = event_support_messages.event_id AND e.created_by = auth.uid()
  )
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_support_messages;
