-- Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(organization_id, name)
);

-- Enable RLS on departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- RLS policies for departments
CREATE POLICY "Organization members can view departments"
  ON public.departments FOR SELECT
  USING (is_org_member(organization_id));

CREATE POLICY "Organization admins can manage departments"
  ON public.departments FOR ALL
  USING (is_organization_admin(organization_id));

-- Add department_id to organization_members
ALTER TABLE public.organization_members 
  ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_org_members_department ON public.organization_members(department_id);
CREATE INDEX IF NOT EXISTS idx_departments_org ON public.departments(organization_id);

-- Add new permission types to employee_data_permissions
-- The permission_type column already exists, we just need to document the new types:
-- 'view_company_metrics' - Can view overall company metrics
-- 'view_employee_metrics' - Can view other employees' metrics  
-- 'manage_employees' - Can add/remove employees
-- Existing: 'profile_views', 'leads', 'connections', 'performance_metrics'

-- Update trigger for departments
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();