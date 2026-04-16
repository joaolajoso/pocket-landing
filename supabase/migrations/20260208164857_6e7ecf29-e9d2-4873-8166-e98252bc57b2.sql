-- Create helper function to check if user can create events for an organization
-- Uses SECURITY DEFINER to bypass RLS on organization_members table
CREATE OR REPLACE FUNCTION public.can_create_event_for_org(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND role = ANY (ARRAY['owner', 'admin'])
      AND status = 'active'
  );
$$;

-- Drop and recreate INSERT policy using the new function
DROP POLICY IF EXISTS "Business owners can create events" ON public.events;

CREATE POLICY "Business owners can create events" 
ON public.events FOR INSERT 
TO authenticated
WITH CHECK (
  created_by = auth.uid() 
  AND can_create_event_for_org(organization_id)
);

-- Drop and recreate UPDATE policy for consistency
DROP POLICY IF EXISTS "Event creators can update their events" ON public.events;

CREATE POLICY "Event creators can update their events" 
ON public.events FOR UPDATE 
TO authenticated
USING (
  created_by = auth.uid() 
  OR can_create_event_for_org(organization_id)
);