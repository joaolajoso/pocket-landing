
-- Fix infinite recursion in organization_members policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view organization members" ON organization_members;
DROP POLICY IF EXISTS "Users can manage organization members" ON organization_members;
DROP POLICY IF EXISTS "Organization members can view their organization" ON organization_members;

-- Create new, simpler policies without recursion
CREATE POLICY "Users can view their own organization membership" 
ON organization_members FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Organization admins can manage members" 
ON organization_members FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = organization_members.organization_id 
    AND om.user_id = auth.uid() 
    AND om.role IN ('admin', 'owner')
    AND om.status = 'active'
  )
);

-- Allow users to see organization details for organizations they belong to
CREATE POLICY "Members can view organization details" 
ON organizations FOR SELECT 
USING (
  id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);
