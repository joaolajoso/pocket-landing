-- Create organization_notifications table for internal invitation notifications
CREATE TABLE IF NOT EXISTS public.organization_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invitation_id uuid REFERENCES public.organization_invitations(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL DEFAULT 'invitation_pending',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organization_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.organization_notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.organization_notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- System can create notifications
CREATE POLICY "System can create notifications"
ON public.organization_notifications
FOR INSERT
WITH CHECK (true);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_organization_notifications_user_id 
ON public.organization_notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_organization_notifications_read 
ON public.organization_notifications(user_id, read);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_organization_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organization_notifications_updated_at
BEFORE UPDATE ON public.organization_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_organization_notifications_updated_at();