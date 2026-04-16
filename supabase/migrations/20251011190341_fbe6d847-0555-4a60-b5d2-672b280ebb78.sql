-- Create event_areas table (similar to departments)
CREATE TABLE public.event_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add role and area to event_participants
ALTER TABLE public.event_participants 
ADD COLUMN role TEXT NOT NULL DEFAULT 'participant',
ADD COLUMN area_id UUID REFERENCES public.event_areas(id) ON DELETE SET NULL;

-- Create event_participant_permissions table
CREATE TABLE public.event_participant_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_participant_id UUID NOT NULL REFERENCES public.event_participants(id) ON DELETE CASCADE,
  permission_type TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT false,
  granted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_participant_id, permission_type)
);

-- Create indexes
CREATE INDEX idx_event_areas_event_id ON public.event_areas(event_id);
CREATE INDEX idx_event_participants_role ON public.event_participants(role);
CREATE INDEX idx_event_participants_area_id ON public.event_participants(area_id);
CREATE INDEX idx_event_participant_permissions_participant ON public.event_participant_permissions(event_participant_id);

-- Create trigger for updated_at
CREATE TRIGGER update_event_areas_updated_at
BEFORE UPDATE ON public.event_areas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_participant_permissions_updated_at
BEFORE UPDATE ON public.event_participant_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for event_areas
ALTER TABLE public.event_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event organizers can manage areas"
ON public.event_areas
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.organization_members om ON om.organization_id = e.organization_id
    WHERE e.id = event_areas.event_id
    AND om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
    AND om.status = 'active'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.event_participants ep
    WHERE ep.event_id = event_areas.event_id
    AND ep.user_id = auth.uid()
    AND ep.role = 'organizer'
  )
);

CREATE POLICY "Event participants can view areas"
ON public.event_areas
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.event_participants
    WHERE event_id = event_areas.event_id
    AND user_id = auth.uid()
  )
);

-- RLS Policies for event_participant_permissions
ALTER TABLE public.event_participant_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event organizers can manage permissions"
ON public.event_participant_permissions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.event_participants ep
    JOIN public.events e ON e.id = ep.event_id
    WHERE ep.id = event_participant_permissions.event_participant_id
    AND (
      (e.created_by = auth.uid())
      OR
      EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = e.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
        AND om.status = 'active'
      )
      OR
      EXISTS (
        SELECT 1 FROM public.event_participants ep2
        WHERE ep2.event_id = e.id
        AND ep2.user_id = auth.uid()
        AND ep2.role = 'organizer'
      )
    )
  )
);

CREATE POLICY "Participants can view own permissions"
ON public.event_participant_permissions
FOR SELECT
USING (
  event_participant_id IN (
    SELECT id FROM public.event_participants
    WHERE user_id = auth.uid()
  )
);

-- Function to check event permissions
CREATE OR REPLACE FUNCTION public.has_event_permission(
  _event_id UUID,
  _user_id UUID,
  _permission_type TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  has_explicit_permission BOOLEAN;
BEGIN
  -- Get user's role in the event
  SELECT role INTO user_role
  FROM event_participants
  WHERE event_id = _event_id
    AND user_id = _user_id;
  
  -- If not a participant, return false
  IF user_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Organizers have all permissions
  IF user_role = 'organizer' THEN
    RETURN true;
  END IF;
  
  -- Stands can view their own metrics
  IF user_role = 'stand' THEN
    IF _permission_type IN ('profile_views', 'leads', 'connections', 'performance_metrics') THEN
      RETURN true;
    END IF;
  END IF;
  
  -- Participants can only view their own metrics
  IF user_role = 'participant' THEN
    IF _permission_type IN ('profile_views', 'leads', 'connections', 'performance_metrics') THEN
      RETURN true;
    END IF;
  END IF;
  
  RETURN false;
END;
$$;