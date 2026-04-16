-- Fix infinite recursion in organization_members RLS policies
-- Create security definer function to check organization membership

CREATE OR REPLACE FUNCTION public.is_org_member(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND status = 'active'
  );
$$;

-- Drop existing problematic policies on organizations
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON public.organizations;
DROP POLICY IF EXISTS "Organization owners and admins can update organizations" ON public.organizations;

-- Create new policies using security definer functions
CREATE POLICY "Users can view organizations they belong to"
ON public.organizations
FOR SELECT
USING (public.is_org_member(id));

CREATE POLICY "Organization owners and admins can update organizations"
ON public.organizations
FOR UPDATE
USING (public.is_organization_admin(id));

-- Drop existing problematic policies on organization_members
DROP POLICY IF EXISTS "Organization members can view other members" ON public.organization_members;
DROP POLICY IF EXISTS "Organization owners and admins can manage members" ON public.organization_members;

-- Create new policies using security definer functions
CREATE POLICY "Organization members can view other members"
ON public.organization_members
FOR SELECT
USING (public.is_org_member(organization_id) OR user_id = auth.uid());

CREATE POLICY "Organization owners and admins can manage members"
ON public.organization_members
FOR ALL
USING (public.is_organization_admin(organization_id));

-- Fix employee_data_permissions policies to avoid recursion
DROP POLICY IF EXISTS "Organization members can view permissions" ON public.employee_data_permissions;
DROP POLICY IF EXISTS "Organization admins can manage permissions" ON public.employee_data_permissions;

CREATE POLICY "Organization members can view permissions"
ON public.employee_data_permissions
FOR SELECT
USING (
  organization_member_id IN (
    SELECT id FROM public.organization_members
    WHERE public.is_org_member(organization_id)
  )
);

CREATE POLICY "Organization admins can manage permissions"
ON public.employee_data_permissions
FOR ALL
USING (
  organization_member_id IN (
    SELECT om.id FROM public.organization_members om
    WHERE public.is_organization_admin(om.organization_id)
  )
);