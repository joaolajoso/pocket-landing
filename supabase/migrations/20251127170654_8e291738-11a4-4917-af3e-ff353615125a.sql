-- Add banner_url column to organizations table
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS banner_url TEXT;

COMMENT ON COLUMN public.organizations.banner_url IS 'URL of the organization banner/cover image';

-- Create storage bucket for organization images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organization-images',
  'organization-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for organization images
CREATE POLICY "Organization images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'organization-images');

CREATE POLICY "Authenticated users can upload organization images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'organization-images'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their organization images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'organization-images'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their organization images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'organization-images'
  AND auth.uid() IS NOT NULL
);