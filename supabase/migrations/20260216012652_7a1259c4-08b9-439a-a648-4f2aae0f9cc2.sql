
-- Meeting requests between event participants
CREATE TABLE public.event_meeting_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Messages within a meeting request conversation
CREATE TABLE public.event_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_request_id UUID NOT NULL REFERENCES public.event_meeting_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_meeting_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for meeting requests
CREATE POLICY "Users can view their own meeting requests"
  ON public.event_meeting_requests FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create meeting requests"
  ON public.event_meeting_requests FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own meeting requests"
  ON public.event_meeting_requests FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- RLS policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.event_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.event_meeting_requests mr
      WHERE mr.id = meeting_request_id
      AND (mr.sender_id = auth.uid() OR mr.receiver_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON public.event_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.event_meeting_requests mr
      WHERE mr.id = meeting_request_id
      AND (mr.sender_id = auth.uid() OR mr.receiver_id = auth.uid())
    )
  );

CREATE POLICY "Users can mark messages as read"
  ON public.event_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.event_meeting_requests mr
      WHERE mr.id = meeting_request_id
      AND (mr.sender_id = auth.uid() OR mr.receiver_id = auth.uid())
    )
  );

-- Indexes
CREATE INDEX idx_meeting_requests_event ON public.event_meeting_requests(event_id);
CREATE INDEX idx_meeting_requests_sender ON public.event_meeting_requests(sender_id);
CREATE INDEX idx_meeting_requests_receiver ON public.event_meeting_requests(receiver_id);
CREATE INDEX idx_messages_meeting_request ON public.event_messages(meeting_request_id);

-- Trigger for updated_at
CREATE TRIGGER update_meeting_requests_updated_at
  BEFORE UPDATE ON public.event_meeting_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_meeting_requests;
