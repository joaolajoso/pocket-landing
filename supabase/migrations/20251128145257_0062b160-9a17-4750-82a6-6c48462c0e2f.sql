-- Update RLS policy to allow managers to manage invitations
DROP POLICY IF EXISTS "Organization owners and admins can manage invitations" ON organization_invitations;

CREATE POLICY "Organization owners, admins and managers can manage invitations"
ON organization_invitations
FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin', 'manager')
    AND status = 'active'
  )
);

-- Create function to search users by slug or name
CREATE OR REPLACE FUNCTION search_pocketcv_users(search_term text, exclude_org_id uuid DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  email text,
  avatar_url text,
  headline text,
  is_member boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.slug,
    p.email,
    p.avatar_url,
    p.headline,
    CASE 
      WHEN exclude_org_id IS NOT NULL THEN
        EXISTS (
          SELECT 1 FROM organization_members om
          WHERE om.user_id = p.id 
          AND om.organization_id = exclude_org_id 
          AND om.status = 'active'
        )
      ELSE false
    END as is_member
  FROM profiles p
  WHERE p.status = 'active'
  AND (
    p.slug ILIKE '%' || search_term || '%'
    OR p.name ILIKE '%' || search_term || '%'
  )
  AND p.email IS NOT NULL
  LIMIT 10;
END;
$$;