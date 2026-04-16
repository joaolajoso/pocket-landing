-- Create function to auto-create participant permissions
CREATE OR REPLACE FUNCTION public.auto_create_participant_permissions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  permission_types text[] := ARRAY['profile_views', 'leads', 'connections', 'performance_metrics'];
  permission_type text;
BEGIN
  FOREACH permission_type IN ARRAY permission_types
  LOOP
    INSERT INTO public.event_participant_permissions (
      event_participant_id,
      permission_type,
      granted,
      granted_at
    ) VALUES (
      NEW.id,
      permission_type,
      true,
      now()
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create permissions for new participants
CREATE TRIGGER trigger_auto_create_participant_permissions
  AFTER INSERT ON public.event_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_participant_permissions();

-- Create function to auto-tag event connections
CREATE OR REPLACE FUNCTION public.auto_tag_event_connections()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  event_name text;
BEGIN
  -- Only auto-tag if tag is not already set
  IF NEW.tag IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Find active events where both users are participants
  SELECT e.title INTO event_name
  FROM public.events e
  INNER JOIN public.event_participants ep1 ON ep1.event_id = e.id AND ep1.user_id = NEW.user_id
  INNER JOIN public.event_participants ep2 ON ep2.event_id = e.id AND ep2.user_id = NEW.connected_user_id
  WHERE 
    e.event_date <= now() AND 
    (e.end_date IS NULL OR e.end_date >= now())
  ORDER BY e.event_date DESC
  LIMIT 1;
  
  -- If found an active event, add tag
  IF event_name IS NOT NULL THEN
    NEW.tag := event_name;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-tag connections from events
CREATE TRIGGER trigger_auto_tag_event_connections
  BEFORE INSERT ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_tag_event_connections();