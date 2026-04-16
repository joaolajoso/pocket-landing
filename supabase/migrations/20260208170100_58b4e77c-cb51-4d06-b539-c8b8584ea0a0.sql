-- Ensure INSERT/UPDATE policies also apply when requests run under PUBLIC role,
-- while still requiring an authenticated JWT (auth.uid() is not null).

-- Recreate INSERT policy
DROP POLICY IF EXISTS "Business owners can create events" ON public.events;

CREATE POLICY "Business owners can create events"
ON public.events
FOR INSERT
TO public
WITH CHECK (
  auth.uid() IS NOT NULL
  AND created_by = auth.uid()
  AND public.can_create_event_for_org(organization_id)
);

-- Recreate UPDATE policy (add WITH CHECK for safety)
DROP POLICY IF EXISTS "Event creators can update their events" ON public.events;

CREATE POLICY "Event creators can update their events"
ON public.events
FOR UPDATE
TO public
USING (
  auth.uid() IS NOT NULL
  AND (
    created_by = auth.uid()
    OR public.can_create_event_for_org(organization_id)
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (
    created_by = auth.uid()
    OR public.can_create_event_for_org(organization_id)
  )
);
