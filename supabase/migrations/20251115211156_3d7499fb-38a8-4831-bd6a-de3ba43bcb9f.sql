-- Drop the existing policy that prevents claiming
DROP POLICY IF EXISTS "Users can update their own links" ON public.onboarding;

-- Create new policy to allow users to claim onboarding links
CREATE POLICY "Users can claim onboarding links"
  ON public.onboarding
  FOR UPDATE
  TO authenticated
  USING (used_by = auth.uid() OR used_by IS NULL)
  WITH CHECK (used_by = auth.uid());

-- Allow updates to event_stands by the user who claimed the onboarding link
CREATE POLICY "Stand can be updated by onboarding owner"
  ON public.event_stands
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.onboarding o
      WHERE o.event_stand_id = event_stands.id
        AND o.used_by = auth.uid()
    )
  );

-- Allow users to join as stand participants
CREATE POLICY "Stand owners can join as stand"
  ON public.event_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND role = 'stand'
    AND EXISTS (
      SELECT 1
      FROM public.onboarding o
      WHERE o.event_id = event_participants.event_id
        AND o.used_by = auth.uid()
    )
  );