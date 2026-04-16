
-- Add file columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS profile_file_url text,
  ADD COLUMN IF NOT EXISTS profile_file_name text;

-- Create storage bucket for profile files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile_files', 'profile_files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile files
CREATE POLICY "Users can upload their own profile files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile_files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile_files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile files"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile_files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Profile files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile_files');
