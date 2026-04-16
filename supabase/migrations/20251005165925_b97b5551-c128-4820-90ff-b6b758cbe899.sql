-- Create storage buckets for organization images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('organization_logos', 'organization_logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('organization_banners', 'organization_banners', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- RLS policies for organization logos
CREATE POLICY "Organization admins can upload logos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'organization_logos' 
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM public.organization_websites 
    WHERE is_organization_admin(organization_id)
  )
);

CREATE POLICY "Organization admins can update logos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'organization_logos' 
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM public.organization_websites 
    WHERE is_organization_admin(organization_id)
  )
);

CREATE POLICY "Organization admins can delete logos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'organization_logos' 
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM public.organization_websites 
    WHERE is_organization_admin(organization_id)
  )
);

CREATE POLICY "Logos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'organization_logos');

-- RLS policies for organization banners
CREATE POLICY "Organization admins can upload banners"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'organization_banners' 
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM public.organization_websites 
    WHERE is_organization_admin(organization_id)
  )
);

CREATE POLICY "Organization admins can update banners"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'organization_banners' 
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM public.organization_websites 
    WHERE is_organization_admin(organization_id)
  )
);

CREATE POLICY "Organization admins can delete banners"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'organization_banners' 
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM public.organization_websites 
    WHERE is_organization_admin(organization_id)
  )
);

CREATE POLICY "Banners are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'organization_banners');