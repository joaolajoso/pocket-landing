
-- Create a security definer function to get invitation by token
-- This bypasses RLS so anyone with the token can view the invitation
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(token_param text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'id', inv.id,
    'organization_id', inv.organization_id,
    'role', inv.role,
    'department', inv.department,
    'position', inv.position,
    'permissions_requested', inv.permissions_requested,
    'expires_at', inv.expires_at,
    'accepted_at', inv.accepted_at,
    'organization_name', org.name,
    'organization_logo', org.logo_url
  ) INTO result
  FROM public.organization_invitations inv
  JOIN public.organizations org ON org.id = inv.organization_id
  WHERE inv.invitation_token = token_param
    AND inv.accepted_at IS NULL
    AND inv.expires_at > now();

  RETURN result;
END;
$$;
