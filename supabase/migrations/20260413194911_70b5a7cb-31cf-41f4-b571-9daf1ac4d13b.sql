-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Business owners can create events" ON public.events;

-- Create a new policy that allows:
-- 1. Personal events (organization_id IS NULL, created_by = auth.uid())
-- 2. Organization events (organization_id IS NOT NULL, user must be org admin/owner)
CREATE POLICY "Authenticated users can create events"
ON public.events
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND created_by = auth.uid()
  AND (
    organization_id IS NULL
    OR can_create_event_for_org(organization_id)
  )
);