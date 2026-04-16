
-- Create organizer team members table
CREATE TABLE public.organizer_team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
  permissions TEXT[] NOT NULL DEFAULT ARRAY['view_events', 'manage_participants'],
  invite_token TEXT UNIQUE,
  invited_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(owner_id, member_user_id)
);

-- Enable RLS
ALTER TABLE public.organizer_team_members ENABLE ROW LEVEL SECURITY;

-- Team owner can do everything
CREATE POLICY "Team owner full access"
ON public.organizer_team_members
FOR ALL
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Members can view their own membership
CREATE POLICY "Members can view own membership"
ON public.organizer_team_members
FOR SELECT
USING (auth.uid() = member_user_id);

-- Allow anyone to read by invite token (for accepting invites)
CREATE POLICY "Anyone can read by invite token"
ON public.organizer_team_members
FOR SELECT
USING (invite_token IS NOT NULL AND status = 'pending');

-- Trigger for updated_at
CREATE TRIGGER update_organizer_team_members_updated_at
BEFORE UPDATE ON public.organizer_team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to accept organizer team invite
CREATE OR REPLACE FUNCTION public.accept_organizer_team_invite(token_param TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invite_record RECORD;
BEGIN
  SELECT * INTO invite_record
  FROM public.organizer_team_members
  WHERE invite_token = token_param
    AND status = 'pending';

  IF invite_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invite');
  END IF;

  UPDATE public.organizer_team_members
  SET member_user_id = auth.uid(),
      status = 'active',
      invite_token = NULL,
      updated_at = now()
  WHERE id = invite_record.id;

  RETURN json_build_object('success', true);
END;
$$;
