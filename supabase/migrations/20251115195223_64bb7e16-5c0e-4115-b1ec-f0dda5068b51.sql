-- Add RLS policy to allow event organizers to create onboarding records for stands
CREATE POLICY "Event organizers can create stand onboarding links"
ON onboarding FOR INSERT
WITH CHECK (
  registration_type = 'event_stand' 
  AND (
    -- Event creator can create
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = onboarding.event_id
      AND events.created_by = auth.uid()
    )
    OR
    -- Organization admins can create
    EXISTS (
      SELECT 1 FROM events e
      JOIN organization_members om ON om.organization_id = e.organization_id
      WHERE e.id = onboarding.event_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
      AND om.status = 'active'
    )
    OR
    -- Event organizers can create
    EXISTS (
      SELECT 1 FROM event_participants ep
      WHERE ep.event_id = onboarding.event_id
      AND ep.user_id = auth.uid()
      AND ep.role = 'organizer'
    )
  )
);

-- Ensure CASCADE delete for onboarding records when stands are deleted
ALTER TABLE onboarding 
DROP CONSTRAINT IF EXISTS onboarding_event_stand_id_fkey;

ALTER TABLE onboarding
ADD CONSTRAINT onboarding_event_stand_id_fkey
FOREIGN KEY (event_stand_id) 
REFERENCES event_stands(id) 
ON DELETE CASCADE;