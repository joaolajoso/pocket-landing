
-- Add connected_organization_id to connections table
ALTER TABLE public.connections 
ADD COLUMN connected_organization_id UUID REFERENCES public.organizations(id);

-- Add unique constraint to prevent duplicate connections
CREATE UNIQUE INDEX IF NOT EXISTS idx_connections_unique_pair 
ON public.connections (user_id, connected_user_id, COALESCE(connected_organization_id, '00000000-0000-0000-0000-000000000000'));
