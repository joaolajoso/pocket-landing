-- Add storage bucket for event images
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for event images
CREATE POLICY "Anyone can view event images"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

CREATE POLICY "Authenticated users can upload event images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their event images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'event-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their event images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-images' AND
  auth.role() = 'authenticated'
);

-- Make event_url nullable for internal events
ALTER TABLE events ALTER COLUMN event_url DROP NOT NULL;

-- Add internal_event flag to differentiate platform events from external ones
ALTER TABLE events ADD COLUMN IF NOT EXISTS internal_event boolean DEFAULT false;

-- Add event_type for categorization
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type text;

-- Create index for internal events
CREATE INDEX IF NOT EXISTS idx_events_internal ON events(internal_event) WHERE internal_event = true;