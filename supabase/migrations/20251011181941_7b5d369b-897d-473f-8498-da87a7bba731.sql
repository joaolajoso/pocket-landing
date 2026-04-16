-- Sprint 1: Database Schema & Backend Logic

-- Create enum for event access type
CREATE TYPE event_access_type AS ENUM ('public', 'invite_only');

-- Create enum for event metric type
CREATE TYPE event_metric_type AS ENUM ('profile_view', 'link_click', 'lead_capture');

-- Modify events table to support custom events
ALTER TABLE public.events
ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
ADD COLUMN access_type event_access_type NOT NULL DEFAULT 'public',
ADD COLUMN invitation_code text UNIQUE,
ALTER COLUMN source DROP NOT NULL,
ALTER COLUMN organization DROP NOT NULL;

-- Create event_invitations table
CREATE TABLE public.event_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  code text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  used boolean NOT NULL DEFAULT false,
  used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone
);

-- Create event_participant_metrics table
CREATE TABLE public.event_participant_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type event_metric_type NOT NULL,
  metadata jsonb,
  captured_at timestamp with time zone NOT NULL DEFAULT now(),
  is_during_event boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create unique index to prevent duplicate metrics
CREATE UNIQUE INDEX idx_event_participant_metrics_unique 
ON public.event_participant_metrics(event_id, participant_id, metric_type, captured_at);

-- Create indexes for performance
CREATE INDEX idx_event_participant_metrics_event ON public.event_participant_metrics(event_id);
CREATE INDEX idx_event_participant_metrics_participant ON public.event_participant_metrics(participant_id);
CREATE INDEX idx_event_invitations_event ON public.event_invitations(event_id);
CREATE INDEX idx_event_invitations_code ON public.event_invitations(code);
CREATE INDEX idx_events_organization ON public.events(organization_id);
CREATE INDEX idx_events_created_by ON public.events(created_by);

-- Modify event_participants table
ALTER TABLE public.event_participants
ADD COLUMN invitation_code text,
ADD COLUMN checked_in boolean NOT NULL DEFAULT false,
ADD COLUMN checked_in_at timestamp with time zone;

-- Enable RLS on new tables
ALTER TABLE public.event_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participant_metrics ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if user can access event
CREATE OR REPLACE FUNCTION public.check_event_access(
  _event_id uuid,
  _user_id uuid,
  _invitation_code text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_access event_access_type;
  event_org_id uuid;
  is_org_admin boolean;
BEGIN
  -- Get event access type and organization
  SELECT access_type, organization_id INTO event_access, event_org_id
  FROM events WHERE id = _event_id;
  
  -- If event is public, allow access
  IF event_access = 'public' THEN
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
  
  -- For invite-only events, check invitation code
  IF _invitation_code IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM event_invitations
      WHERE event_id = _event_id
        AND code = _invitation_code
        AND (used = false OR used_by = _user_id)
        AND (expires_at IS NULL OR expires_at > now())
    );
  END IF;
  
  -- Check if user already has a valid invitation
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

-- Function to check if event is currently active
CREATE OR REPLACE FUNCTION public.is_event_active(_event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM events
    WHERE id = _event_id
      AND event_date <= now()
      AND (end_date IS NULL OR end_date >= now())
  );
$$;

-- Function to capture event metrics
CREATE OR REPLACE FUNCTION public.capture_event_metric(
  _event_id uuid,
  _participant_id uuid,
  _metric_type event_metric_type,
  _metadata jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_active boolean;
BEGIN
  -- Check if event is currently active
  is_active := is_event_active(_event_id);
  
  -- Check if participant is registered for the event
  IF NOT EXISTS (
    SELECT 1 FROM event_participants
    WHERE event_id = _event_id AND user_id = _participant_id
  ) THEN
    RETURN;
  END IF;
  
  -- Insert metric (ignore if duplicate)
  INSERT INTO event_participant_metrics (
    event_id,
    participant_id,
    metric_type,
    metadata,
    is_during_event,
    captured_at
  ) VALUES (
    _event_id,
    _participant_id,
    _metric_type,
    _metadata,
    is_active,
    now()
  )
  ON CONFLICT (event_id, participant_id, metric_type, captured_at) 
  DO NOTHING;
END;
$$;

-- RLS Policies for events (updated)
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
DROP POLICY IF EXISTS "Service role can manage events" ON public.events;

CREATE POLICY "Anyone can view public events"
ON public.events FOR SELECT
USING (access_type = 'public' OR check_event_access(id, auth.uid(), NULL));

CREATE POLICY "Business owners can create events"
ON public.events FOR INSERT
WITH CHECK (
  created_by = auth.uid() AND
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND status = 'active'
  )
);

CREATE POLICY "Event creators can update their events"
ON public.events FOR UPDATE
USING (
  created_by = auth.uid() OR
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND status = 'active'
  )
);

CREATE POLICY "Event creators can delete their events"
ON public.events FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
      AND role = 'owner'
      AND status = 'active'
  )
);

-- RLS Policies for event_invitations
CREATE POLICY "Event creators can view invitations"
ON public.event_invitations FOR SELECT
USING (
  invited_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM events
    WHERE id = event_id AND created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM events e
    JOIN organization_members om ON om.organization_id = e.organization_id
    WHERE e.id = event_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
      AND om.status = 'active'
  )
);

CREATE POLICY "Event creators can create invitations"
ON public.event_invitations FOR INSERT
WITH CHECK (
  invited_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM events
    WHERE id = event_id AND created_by = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM events e
    JOIN organization_members om ON om.organization_id = e.organization_id
    WHERE e.id = event_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
      AND om.status = 'active'
  )
);

CREATE POLICY "Event creators can update invitations"
ON public.event_invitations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE id = event_id AND created_by = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM events e
    JOIN organization_members om ON om.organization_id = e.organization_id
    WHERE e.id = event_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
      AND om.status = 'active'
  )
);

-- RLS Policies for event_participant_metrics
CREATE POLICY "Event creators can view metrics"
ON public.event_participant_metrics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE id = event_id AND created_by = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM events e
    JOIN organization_members om ON om.organization_id = e.organization_id
    WHERE e.id = event_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
      AND om.status = 'active'
  )
);

CREATE POLICY "System can insert metrics"
ON public.event_participant_metrics FOR INSERT
WITH CHECK (true);

-- Update event_participants policies
DROP POLICY IF EXISTS "Users can manage their own participation" ON public.event_participants;
DROP POLICY IF EXISTS "Users can view all participants" ON public.event_participants;

CREATE POLICY "Users can view event participants"
ON public.event_participants FOR SELECT
USING (
  auth.uid() = user_id OR
  check_event_access(event_id, auth.uid(), NULL)
);

CREATE POLICY "Users can join events they have access to"
ON public.event_participants FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  check_event_access(event_id, auth.uid(), invitation_code)
);

CREATE POLICY "Users can update their own participation"
ON public.event_participants FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can leave events"
ON public.event_participants FOR DELETE
USING (auth.uid() = user_id);