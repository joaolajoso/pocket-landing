-- Add visibility flags for contact buttons on business public pages
ALTER TABLE public.organization_websites 
ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_whatsapp BOOLEAN DEFAULT true;