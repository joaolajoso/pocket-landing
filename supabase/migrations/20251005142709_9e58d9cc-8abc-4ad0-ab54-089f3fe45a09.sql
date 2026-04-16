-- 1) Allow invited users to view their invitations by email
DROP POLICY IF EXISTS "Invited users can view their own invitations" ON public.organization_invitations;
CREATE POLICY "Invited users can view their own invitations"
ON public.organization_invitations
FOR SELECT
USING (
  email = (SELECT email FROM public.profiles WHERE id = auth.uid())
);

-- 2) Helpful index for invitations lookup by email and validity
CREATE INDEX IF NOT EXISTS idx_org_invite_email_status_exp 
ON public.organization_invitations (email, accepted_at, expires_at);