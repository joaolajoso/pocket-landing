-- Fix final security issues

-- 1. Enable RLS on onboarding table (this was the missing table)
ALTER TABLE public.onboarding ENABLE ROW LEVEL SECURITY;

-- 2. Fix remaining functions that need search_path (check which ones are missing)
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.is_organization_admin(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = org_id 
    AND user_id = auth.uid() 
    AND role IN ('admin', 'owner')
    AND status = 'active'
  );
$function$;