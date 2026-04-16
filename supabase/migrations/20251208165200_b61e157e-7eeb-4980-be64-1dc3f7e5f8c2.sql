-- Add column to track if user wants to use the new public page design
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS use_new_public_page boolean DEFAULT false;