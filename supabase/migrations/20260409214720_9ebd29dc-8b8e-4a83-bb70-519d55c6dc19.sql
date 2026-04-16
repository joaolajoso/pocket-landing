
-- Create organization follow-up settings table
CREATE TABLE public.organization_follow_up_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  default_follow_up_days INTEGER NOT NULL DEFAULT 7,
  email_notifications_enabled BOOLEAN NOT NULL DEFAULT false,
  webapp_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  reminder_days_before INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

-- Enable RLS
ALTER TABLE public.organization_follow_up_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Org members can view follow-up settings"
ON public.organization_follow_up_settings
FOR SELECT
TO authenticated
USING (public.is_org_member(organization_id));

CREATE POLICY "Org admins can insert follow-up settings"
ON public.organization_follow_up_settings
FOR INSERT
TO authenticated
WITH CHECK (public.is_organization_admin(organization_id));

CREATE POLICY "Org admins can update follow-up settings"
ON public.organization_follow_up_settings
FOR UPDATE
TO authenticated
USING (public.is_organization_admin(organization_id));

-- Updated_at trigger
CREATE TRIGGER update_org_follow_up_settings_updated_at
BEFORE UPDATE ON public.organization_follow_up_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
