
-- Complete fix for infinite recursion in organization policies
-- First, disable RLS temporarily to ensure we can clean up
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on both tables
DROP POLICY IF EXISTS "Users can view organization members" ON organization_members;
DROP POLICY IF EXISTS "Users can manage organization members" ON organization_members;
DROP POLICY IF EXISTS "Organization members can view their organization" ON organization_members;
DROP POLICY IF EXISTS "Users can view their own organization membership" ON organization_members;
DROP POLICY IF EXISTS "Organization admins can manage members" ON organization_members;
DROP POLICY IF EXISTS "Members can view organization details" ON organizations;
DROP POLICY IF EXISTS "Organization owners can manage organization" ON organizations;
DROP POLICY IF EXISTS "Users can view organizations" ON organizations;

-- Create a security definer function to check user organization membership
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create a security definer function to check if user is organization admin
CREATE OR REPLACE FUNCTION public.is_organization_admin(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = org_id 
    AND user_id = auth.uid() 
    AND role IN ('admin', 'owner')
    AND status = 'active'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Re-enable RLS
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for organization_members
CREATE POLICY "Users can view their own membership" 
ON organization_members FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view organization members" 
ON organization_members FOR SELECT 
USING (public.is_organization_admin(organization_id));

CREATE POLICY "Admins can manage organization members" 
ON organization_members FOR ALL 
USING (public.is_organization_admin(organization_id));

-- Create simple policies for organizations
CREATE POLICY "Users can view their organization" 
ON organizations FOR SELECT 
USING (id = public.get_user_organization_id());

CREATE POLICY "Admins can manage their organization" 
ON organizations FOR ALL 
USING (public.is_organization_admin(id));
