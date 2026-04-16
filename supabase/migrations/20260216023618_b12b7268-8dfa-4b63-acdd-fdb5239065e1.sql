
CREATE TABLE public.event_scheduled_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_request_id UUID NOT NULL REFERENCES public.event_meeting_requests(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  scheduled_by UUID NOT NULL,
  meeting_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NULL,
  area_id UUID REFERENCES public.event_areas(id) ON DELETE SET NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'proposed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.event_scheduled_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view meetings they are part of"
ON public.event_scheduled_meetings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM event_meeting_requests emr
    WHERE emr.id = meeting_request_id
    AND (emr.sender_id = auth.uid() OR emr.receiver_id = auth.uid())
  )
);

CREATE POLICY "Users can create meetings for their accepted requests"
ON public.event_scheduled_meetings FOR INSERT
WITH CHECK (
  scheduled_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM event_meeting_requests emr
    WHERE emr.id = meeting_request_id
    AND emr.status = 'accepted'
    AND (emr.sender_id = auth.uid() OR emr.receiver_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own proposed meetings"
ON public.event_scheduled_meetings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM event_meeting_requests emr
    WHERE emr.id = meeting_request_id
    AND (emr.sender_id = auth.uid() OR emr.receiver_id = auth.uid())
  )
);
