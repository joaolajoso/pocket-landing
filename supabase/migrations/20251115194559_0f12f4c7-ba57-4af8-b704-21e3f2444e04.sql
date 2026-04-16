-- Add total_stands column to events table
ALTER TABLE events 
ADD COLUMN total_stands integer DEFAULT 0;

-- Create event_stands table
CREATE TABLE event_stands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  stand_number integer NOT NULL,
  stand_name text,
  onboarding_link_id text UNIQUE NOT NULL,
  company_name text,
  company_email text,
  assigned_user_id uuid,
  qr_code_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT unique_stand_per_event UNIQUE(event_id, stand_number)
);

-- Create indexes for event_stands
CREATE INDEX idx_event_stands_event_id ON event_stands(event_id);
CREATE INDEX idx_event_stands_onboarding_link ON event_stands(onboarding_link_id);

-- Add columns to onboarding table
ALTER TABLE onboarding
ADD COLUMN event_id uuid REFERENCES events(id) ON DELETE SET NULL,
ADD COLUMN event_stand_id uuid REFERENCES event_stands(id) ON DELETE SET NULL,
ADD COLUMN registration_type text DEFAULT 'general' CHECK (registration_type IN ('general', 'event_stand', 'event_participant'));

-- Enable RLS on event_stands
ALTER TABLE event_stands ENABLE ROW LEVEL SECURITY;

-- Event organizers can view all stands
CREATE POLICY "Event organizers can view stands"
ON event_stands FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events e
    JOIN organization_members om ON om.organization_id = e.organization_id
    WHERE e.id = event_stands.event_id
    AND om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
    AND om.status = 'active'
  )
  OR
  EXISTS (
    SELECT 1 FROM event_participants ep
    WHERE ep.event_id = event_stands.event_id
    AND ep.user_id = auth.uid()
    AND ep.role = 'organizer'
  )
);

-- Event organizers can manage stands
CREATE POLICY "Event organizers can manage stands"
ON event_stands FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM events e
    JOIN organization_members om ON om.organization_id = e.organization_id
    WHERE e.id = event_stands.event_id
    AND om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
    AND om.status = 'active'
  )
  OR
  EXISTS (
    SELECT 1 FROM event_participants ep
    WHERE ep.event_id = event_stands.event_id
    AND ep.user_id = auth.uid()
    AND ep.role = 'organizer'
  )
);

-- Stand owners can view their own stand
CREATE POLICY "Stand owners can view their stand"
ON event_stands FOR SELECT
USING (assigned_user_id = auth.uid());