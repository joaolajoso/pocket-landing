
-- Create helper functions to avoid RLS recursion in profile_views policies

CREATE OR REPLACE FUNCTION public.is_event_organizer_for_profile(_profile_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM event_participants ep
    JOIN events e ON e.id = ep.event_id
    WHERE ep.user_id = _profile_id
      AND (
        e.created_by = _user_id
        OR EXISTS (
          SELECT 1 FROM organization_members om
          WHERE om.organization_id = e.organization_id
            AND om.user_id = _user_id
            AND om.role IN ('owner', 'admin')
            AND om.status = 'active'
        )
        OR EXISTS (
          SELECT 1 FROM event_participants ep2
          WHERE ep2.event_id = e.id
            AND ep2.user_id = _user_id
            AND ep2.role = 'organizer'
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin_for_profile(_profile_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM organization_members om1
    JOIN organization_members om2 ON om2.organization_id = om1.organization_id
    WHERE om1.user_id = _user_id
      AND om1.status = 'active'
      AND om1.role IN ('owner', 'admin', 'manager')
      AND om2.user_id = _profile_id
      AND om2.status = 'active'
  );
$$;

-- Drop old policies
DROP POLICY IF EXISTS "Event organizers can view participant profile views" ON profile_views;
DROP POLICY IF EXISTS "Organization admins can view team profile views" ON profile_views;
DROP POLICY IF EXISTS "Users can only view their own profile views" ON profile_views;

-- Recreate with SECURITY DEFINER functions (no RLS recursion)
CREATE POLICY "Users can view own profile views"
  ON profile_views FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Event organizers can view participant views"
  ON profile_views FOR SELECT
  USING (is_event_organizer_for_profile(profile_id, auth.uid()));

CREATE POLICY "Org admins can view team views"
  ON profile_views FOR SELECT
  USING (is_org_admin_for_profile(profile_id, auth.uid()));
