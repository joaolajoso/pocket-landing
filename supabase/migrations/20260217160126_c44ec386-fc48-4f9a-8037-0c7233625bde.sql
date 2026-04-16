-- Drop the old check constraint and add updated one with all permission types
ALTER TABLE public.employee_data_permissions 
DROP CONSTRAINT employee_data_permissions_permission_type_check;

ALTER TABLE public.employee_data_permissions 
ADD CONSTRAINT employee_data_permissions_permission_type_check 
CHECK (permission_type = ANY (ARRAY[
  'profile_views'::text, 
  'view_profile'::text,
  'link_clicks'::text, 
  'leads'::text, 
  'connections'::text, 
  'view_connections'::text,
  'contact_info'::text, 
  'analytics'::text, 
  'view_analytics'::text,
  'performance_metrics'::text, 
  'view_company_metrics'::text, 
  'view_employee_metrics'::text, 
  'manage_employees'::text, 
  'edit_company_website'::text, 
  'manage_departments'::text
]));