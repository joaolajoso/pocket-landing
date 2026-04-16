
-- Create event announcements table
CREATE TABLE public.event_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_by UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_announcements ENABLE ROW LEVEL SECURITY;

-- Anyone can read active announcements for an event
CREATE POLICY "Anyone can view active announcements"
  ON public.event_announcements FOR SELECT
  USING (is_active = true);

-- Event creator or org admin can manage announcements
CREATE POLICY "Event organizers can insert announcements"
  ON public.event_announcements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_id AND e.created_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.events e
      JOIN public.organization_members om ON om.organization_id = e.organization_id
      WHERE e.id = event_id AND om.user_id = auth.uid() AND om.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Event organizers can update announcements"
  ON public.event_announcements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_id AND e.created_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.events e
      JOIN public.organization_members om ON om.organization_id = e.organization_id
      WHERE e.id = event_id AND om.user_id = auth.uid() AND om.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Event organizers can delete announcements"
  ON public.event_announcements FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_id AND e.created_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.events e
      JOIN public.organization_members om ON om.organization_id = e.organization_id
      WHERE e.id = event_id AND om.user_id = auth.uid() AND om.role IN ('owner', 'admin')
    )
  );

-- Index for fast lookups
CREATE INDEX idx_event_announcements_event_id ON public.event_announcements(event_id);
