-- Create event_session_feedback table
CREATE TABLE public.event_session_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  session_index int NOT NULL,
  user_id uuid NOT NULL,
  rating int NOT NULL CHECK (rating >= 0 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(event_id, session_index, user_id)
);

ALTER TABLE public.event_session_feedback ENABLE ROW LEVEL SECURITY;

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback"
  ON public.event_session_feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own feedback
CREATE POLICY "Users can insert own feedback"
  ON public.event_session_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own feedback
CREATE POLICY "Users can update own feedback"
  ON public.event_session_feedback FOR UPDATE
  USING (auth.uid() = user_id);

-- Event organizers can view all feedback
CREATE POLICY "Event organizers can view feedback"
  ON public.event_session_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_session_feedback.event_id
      AND (
        e.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM organization_members om
          WHERE om.organization_id = e.organization_id
          AND om.user_id = auth.uid()
          AND om.role IN ('owner', 'admin')
          AND om.status = 'active'
        )
        OR EXISTS (
          SELECT 1 FROM event_participants ep
          WHERE ep.event_id = e.id
          AND ep.user_id = auth.uid()
          AND ep.role = 'organizer'
        )
      )
    )
  );