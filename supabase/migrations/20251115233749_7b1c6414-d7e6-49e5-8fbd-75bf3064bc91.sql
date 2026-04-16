-- Create event_custom_content table for customizable event pages
CREATE TABLE IF NOT EXISTS event_custom_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  section_type TEXT NOT NULL, -- 'timeline', 'map', 'info', 'sponsors'
  title TEXT,
  content JSONB, -- Flexible content structure
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_event_custom_content_event_id ON event_custom_content(event_id);
CREATE INDEX IF NOT EXISTS idx_event_custom_content_active ON event_custom_content(event_id, is_active);

-- RLS Policies
ALTER TABLE event_custom_content ENABLE ROW LEVEL SECURITY;

-- Event organizers can manage custom content
CREATE POLICY "Event organizers can manage custom content"
ON event_custom_content FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = event_custom_content.event_id
    AND (
      e.created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.organization_id = e.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
        AND om.status = 'active'
      )
      OR EXISTS (
        SELECT 1 FROM event_participants ep
        WHERE ep.event_id = e.id
        AND ep.user_id = auth.uid()
        AND ep.role = 'organizer'
      )
    )
  )
);

-- Public can view active content from accessible events
CREATE POLICY "Public can view event custom content"
ON event_custom_content FOR SELECT
USING (
  is_active = true
  AND EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = event_custom_content.event_id
    AND (
      e.access_type = 'public'
      OR check_event_access(e.id, auth.uid(), NULL)
    )
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_event_custom_content_updated_at
  BEFORE UPDATE ON event_custom_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();