-- Política para admins da organização visualizarem profile_views dos seus membros
CREATE POLICY "Organization admins can view team profile views"
ON public.profile_views
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.user_id = auth.uid()
      AND om.status = 'active'
      AND om.role IN ('owner', 'admin', 'manager')
      AND EXISTS (
        SELECT 1 FROM public.organization_members om2
        WHERE om2.organization_id = om.organization_id
          AND om2.user_id = profile_views.profile_id
          AND om2.status = 'active'
      )
  )
);

-- Política para admins da organização visualizarem connections dos seus membros
CREATE POLICY "Organization admins can view team connections"
ON public.connections
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.user_id = auth.uid()
      AND om.status = 'active'
      AND om.role IN ('owner', 'admin', 'manager')
      AND EXISTS (
        SELECT 1 FROM public.organization_members om2
        WHERE om2.organization_id = om.organization_id
          AND om2.user_id = connections.user_id
          AND om2.status = 'active'
      )
  )
);

-- Política para admins da organização visualizarem contact_submissions dos seus membros
CREATE POLICY "Organization admins can view team submissions"
ON public.contact_submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.user_id = auth.uid()
      AND om.status = 'active'
      AND om.role IN ('owner', 'admin', 'manager')
      AND EXISTS (
        SELECT 1 FROM public.organization_members om2
        WHERE om2.organization_id = om.organization_id
          AND om2.user_id = contact_submissions.profile_owner_id
          AND om2.status = 'active'
      )
  )
);