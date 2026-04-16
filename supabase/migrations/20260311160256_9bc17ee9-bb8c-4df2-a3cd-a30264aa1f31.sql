CREATE POLICY "Event participants can view stands"
ON public.event_stands
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM event_participants ep
    WHERE ep.event_id = event_stands.event_id
      AND ep.user_id = auth.uid()
  )
);