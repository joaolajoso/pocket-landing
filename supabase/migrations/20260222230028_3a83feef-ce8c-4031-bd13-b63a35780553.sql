
-- Add file columns to contact_submissions
ALTER TABLE public.contact_submissions
ADD COLUMN file_url TEXT,
ADD COLUMN file_name TEXT;

-- Create storage bucket for lead capture file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('lead_capture_files', 'lead_capture_files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous uploads (visitors without accounts)
CREATE POLICY "Anyone can upload lead capture files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lead_capture_files');

-- Allow public read access
CREATE POLICY "Lead capture files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'lead_capture_files');

-- Allow profile owners to delete files from their submissions
CREATE POLICY "Profile owners can delete lead capture files"
ON storage.objects FOR DELETE
USING (bucket_id = 'lead_capture_files' AND auth.uid() IS NOT NULL);
