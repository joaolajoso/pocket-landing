-- Policy para organizadores atualizarem participantes
CREATE POLICY "Event organizers can update participants"
ON event_participants
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = event_participants.event_id
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

-- Policy para organizadores removerem participantes
CREATE POLICY "Event organizers can delete participants"
ON event_participants
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = event_participants.event_id
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