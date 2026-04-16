-- Add services column to organization_websites table
ALTER TABLE public.organization_websites 
ADD COLUMN IF NOT EXISTS services jsonb DEFAULT '[]'::jsonb;