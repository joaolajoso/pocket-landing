-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  image_url TEXT,
  event_url TEXT NOT NULL UNIQUE,
  category TEXT,
  organization TEXT DEFAULT 'Portugal Tech Week',
  is_featured BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'portugaltechweek.com',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can view events"
  ON public.events
  FOR SELECT
  USING (true);

-- Only service role can insert/update/delete
CREATE POLICY "Service role can manage events"
  ON public.events
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create index for performance
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_events_featured ON public.events(is_featured) WHERE is_featured = true;

-- Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public)
VALUES ('event_images', 'event_images', true);

-- Storage policies for event images
CREATE POLICY "Public can view event images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'event_images');

CREATE POLICY "Service role can upload event images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'event_images' AND auth.role() = 'service_role');

-- Trigger to update updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();