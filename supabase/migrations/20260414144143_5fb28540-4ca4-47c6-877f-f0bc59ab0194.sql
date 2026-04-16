CREATE OR REPLACE FUNCTION public.check_event_access(
  _event_id uuid,
  _user_id uuid,
  _invitation_code text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_access event_access_type;
  event_org_id uuid;
  event_inv_code text;
  is_org_admin boolean;
BEGIN
  -- Get event access type, organization and invitation code
  SELECT access_type, organization_id, invitation_code 
  INTO event_access, event_org_id, event_inv_code
  FROM events WHERE id = _event_id;
  
  -- If event is public, allow access
  IF event_access = 'public' THEN
    RETURN true;
  END IF;
  
  -- Check if user is already a participant in this event
  IF EXISTS (
    SELECT 1 FROM event_participants
    WHERE event_id = _event_id
      AND user_id = _user_id
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if user is admin/owner of the organization that created the event
  IF event_org_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = event_org_id
        AND user_id = _user_id
        AND role IN ('owner', 'admin')
        AND status = 'active'
    ) INTO is_org_admin;
    
    IF is_org_admin THEN
      RETURN true;
    END IF;
  END IF;
  
  -- Check if user is the creator
  IF EXISTS (SELECT 1 FROM events WHERE id = _event_id AND created_by = _user_id) THEN
    RETURN true;
  END IF;
  
  -- For invite-only events, check invitation code against event's own invitation_code
  IF _invitation_code IS NOT NULL THEN
    -- First check against event's single invitation code
    IF event_inv_code IS NOT NULL AND event_inv_code = _invitation_code THEN
      RETURN true;
    END IF;
    
    -- Fallback: check against individual invitations table (legacy)
    IF EXISTS (
      SELECT 1 FROM event_invitations
      WHERE event_id = _event_id
        AND code = _invitation_code
        AND (used = false OR used_by = _user_id)
        AND (expires_at IS NULL OR expires_at > now())
    ) THEN
      RETURN true;
    END IF;
  END IF;
  
  -- Check if user already has a valid invitation by email (legacy)
  RETURN EXISTS (
    SELECT 1 FROM event_invitations ei
    JOIN profiles p ON p.email = ei.email
    WHERE ei.event_id = _event_id
      AND p.id = _user_id
      AND (ei.used = false OR ei.used_by = _user_id)
      AND (ei.expires_at IS NULL OR ei.expires_at > now())
  );
END;
$$;