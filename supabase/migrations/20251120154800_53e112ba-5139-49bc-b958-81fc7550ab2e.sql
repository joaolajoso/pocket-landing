-- Function to capture connection metrics for events
CREATE OR REPLACE FUNCTION capture_event_connection_metrics()
RETURNS TRIGGER AS $$
DECLARE
  active_event RECORD;
BEGIN
  -- Find active event where both users are participants
  SELECT e.id, e.title
  INTO active_event
  FROM events e
  INNER JOIN event_participants ep1 ON ep1.event_id = e.id AND ep1.user_id = NEW.user_id
  INNER JOIN event_participants ep2 ON ep2.event_id = e.id AND ep2.user_id = NEW.connected_user_id
  WHERE e.event_date <= NOW()
    AND (e.end_date IS NULL OR e.end_date >= NOW())
  LIMIT 1;
  
  IF active_event.id IS NOT NULL THEN
    -- Capture metric for the user who made the connection
    PERFORM capture_event_metric(
      active_event.id,
      NEW.user_id,
      'connection'::event_metric_type,
      jsonb_build_object(
        'connected_with', NEW.connected_user_id,
        'connection_id', NEW.id,
        'event_title', active_event.title,
        'timestamp', NOW()
      )
    );
    
    -- Capture metric for the user who received the connection
    PERFORM capture_event_metric(
      active_event.id,
      NEW.connected_user_id,
      'connection'::event_metric_type,
      jsonb_build_object(
        'connected_by', NEW.user_id,
        'connection_id', NEW.id,
        'event_title', active_event.title,
        'timestamp', NOW()
      )
    );
    
    -- Log for debugging
    RAISE NOTICE 'Captured connection metrics for event % between users % and %', 
      active_event.id, NEW.user_id, NEW.connected_user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to capture connection metrics
DROP TRIGGER IF EXISTS capture_connection_metrics ON connections;

CREATE TRIGGER capture_connection_metrics
AFTER INSERT ON connections
FOR EACH ROW
EXECUTE FUNCTION capture_event_connection_metrics();