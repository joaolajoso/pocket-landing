-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Organization owners and admins can update organizations" ON organizations;

-- Create new policy that includes managers
CREATE POLICY "Organization managers and admins can update organizations"
ON organizations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = organizations.id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager')
      AND status = 'active'
  )
);