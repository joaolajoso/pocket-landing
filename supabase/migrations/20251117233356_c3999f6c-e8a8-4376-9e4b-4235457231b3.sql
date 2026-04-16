-- Add registration_data column to event_participants
ALTER TABLE event_participants 
ADD COLUMN registration_data JSONB;

-- Create GIN index for efficient querying
CREATE INDEX idx_event_participants_registration_data 
ON event_participants USING GIN (registration_data);

-- Create function to automatically add participant tags to connections
CREATE OR REPLACE FUNCTION add_participant_tags_to_connection()
RETURNS TRIGGER AS $$
DECLARE
  participant_data JSONB;
  event_title TEXT;
  tags TEXT[];
BEGIN
  -- Check if connection was created during an event where user is a participant
  SELECT ep.registration_data, e.title
  INTO participant_data, event_title
  FROM event_participants ep
  JOIN events e ON e.id = ep.event_id
  WHERE ep.user_id = NEW.user_id
  AND e.event_date <= NOW()
  AND (e.end_date IS NULL OR e.end_date >= NOW())
  AND NEW.created_at BETWEEN e.event_date AND COALESCE(e.end_date, e.event_date + interval '1 day')
  LIMIT 1;
  
  IF participant_data IS NOT NULL THEN
    -- Extract tags from registration_data
    tags := ARRAY[]::TEXT[];
    
    IF participant_data->>'academic_degree' IS NOT NULL THEN
      tags := array_append(tags, participant_data->>'academic_degree');
    END IF;
    
    IF participant_data->'education_areas' IS NOT NULL THEN
      tags := array_cat(tags, ARRAY(SELECT jsonb_array_elements_text(participant_data->'education_areas')));
    END IF;
    
    IF participant_data->'opportunity_interests' IS NOT NULL THEN
      tags := array_cat(tags, ARRAY(SELECT jsonb_array_elements_text(participant_data->'opportunity_interests')));
    END IF;
    
    -- Update note with the tags
    IF array_length(tags, 1) > 0 THEN
      NEW.note := array_to_string(tags, ', ');
    END IF;
    
    -- Set tag to event title if not already set
    IF NEW.tag IS NULL AND event_title IS NOT NULL THEN
      NEW.tag := event_title;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on connections table
CREATE TRIGGER connection_participant_tags_trigger
BEFORE INSERT ON connections
FOR EACH ROW
EXECUTE FUNCTION add_participant_tags_to_connection();