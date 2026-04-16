-- Fix remaining critical security issues

-- 1. Enable RLS on any tables that need it but don't have it
-- Check if public_profiles view needs RLS (views inherit from base tables, so this should be OK)

-- 2. Fix remaining functions that need search_path
CREATE OR REPLACE FUNCTION public.update_employee_performance_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  org_member RECORD;
BEGIN
  -- Loop through all active organization members
  FOR org_member IN 
    SELECT om.organization_id, om.user_id 
    FROM public.organization_members om 
    WHERE om.status = 'active'
  LOOP
    -- Insert or update today's metrics
    INSERT INTO public.employee_performance_metrics (
      organization_id,
      employee_id,
      metric_date,
      profile_views_count,
      link_clicks_count,
      leads_generated_count,
      connections_made_count
    )
    SELECT 
      org_member.organization_id,
      org_member.user_id,
      CURRENT_DATE,
      COALESCE(profile_views.count, 0),
      COALESCE(link_clicks.count, 0),
      COALESCE(leads.count, 0),
      COALESCE(connections.count, 0)
    FROM (
      SELECT COUNT(*) as count
      FROM public.profile_views pv
      WHERE pv.profile_id = org_member.user_id
        AND DATE(pv.timestamp) = CURRENT_DATE
    ) profile_views
    CROSS JOIN (
      SELECT COUNT(*) as count
      FROM public.profile_views pv
      WHERE pv.profile_id = org_member.user_id
        AND pv.source LIKE 'click:%'
        AND DATE(pv.timestamp) = CURRENT_DATE
    ) link_clicks
    CROSS JOIN (
      SELECT COUNT(*) as count
      FROM public.contact_submissions cs
      WHERE cs.profile_owner_id = org_member.user_id
        AND DATE(cs.created_at) = CURRENT_DATE
    ) leads
    CROSS JOIN (
      SELECT COUNT(*) as count
      FROM public.connections c
      WHERE c.user_id = org_member.user_id
        AND DATE(c.created_at) = CURRENT_DATE
    ) connections
    ON CONFLICT (organization_id, employee_id, metric_date)
    DO UPDATE SET
      profile_views_count = EXCLUDED.profile_views_count,
      link_clicks_count = EXCLUDED.link_clicks_count,
      leads_generated_count = EXCLUDED.leads_generated_count,
      connections_made_count = EXCLUDED.connections_made_count,
      updated_at = now();
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.migrate_existing_links()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  profile_record RECORD;
  default_group_id UUID;
BEGIN
  FOR profile_record IN SELECT id, linkedin, website, email FROM profiles WHERE linkedin IS NOT NULL OR website IS NOT NULL OR email IS NOT NULL LOOP
    -- Create default group for existing links
    INSERT INTO link_groups (user_id, title) 
    VALUES (profile_record.id, 'Contact Information')
    RETURNING id INTO default_group_id;
    
    -- Transfer LinkedIn link if exists
    IF profile_record.linkedin IS NOT NULL THEN
      INSERT INTO links (user_id, group_id, title, url, icon) 
      VALUES (
        profile_record.id, 
        default_group_id, 
        'LinkedIn Profile', 
        profile_record.linkedin, 
        'linkedin'
      );
    END IF;
    
    -- Transfer Website link if exists
    IF profile_record.website IS NOT NULL THEN
      INSERT INTO links (user_id, group_id, title, url, icon) 
      VALUES (
        profile_record.id, 
        default_group_id, 
        'Website', 
        profile_record.website, 
        'website'
      );
    END IF;
    
    -- Transfer Email link if exists
    IF profile_record.email IS NOT NULL THEN
      INSERT INTO links (user_id, group_id, title, url, icon) 
      VALUES (
        profile_record.id, 
        default_group_id, 
        'Email', 
        CASE 
          WHEN profile_record.email LIKE 'mailto:%' THEN profile_record.email
          ELSE 'mailto:' || profile_record.email
        END, 
        'email'
      );
    END IF;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.accept_organization_invitation(invitation_token_param text, permissions_granted text[] DEFAULT ARRAY['profile_views'::text, 'leads'::text, 'connections'::text])
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  invitation_record RECORD;
  member_id UUID;
  permission_type TEXT;
BEGIN
  -- Verificar se o convite existe e não expirou
  SELECT * INTO invitation_record
  FROM public.organization_invitations
  WHERE invitation_token = invitation_token_param
    AND expires_at > now()
    AND accepted_at IS NULL;
    
  IF invitation_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;
  
  -- Verificar se o usuário já é membro da organização
  IF EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = invitation_record.organization_id
      AND user_id = auth.uid()
      AND status = 'active'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'User already member of organization');
  END IF;
  
  -- Criar membro da organização
  INSERT INTO public.organization_members (
    organization_id,
    user_id,
    role,
    department,
    position,
    status,
    invited_by,
    joined_at
  ) VALUES (
    invitation_record.organization_id,
    auth.uid(),
    invitation_record.role,
    invitation_record.department,
    invitation_record.position,
    'active',
    invitation_record.invited_by,
    now()
  ) RETURNING id INTO member_id;
  
  -- Atualizar organização do perfil do usuário
  UPDATE public.profiles 
  SET organization_id = invitation_record.organization_id
  WHERE id = auth.uid();
  
  -- Criar permissões de dados baseadas nas permissões concedidas
  FOREACH permission_type IN ARRAY permissions_granted
  LOOP
    INSERT INTO public.employee_data_permissions (
      organization_member_id,
      permission_type,
      granted,
      granted_at
    ) VALUES (
      member_id,
      permission_type,
      true,
      now()
    );
  END LOOP;
  
  -- Marcar convite como aceito
  UPDATE public.organization_invitations
  SET accepted_at = now()
  WHERE id = invitation_record.id;
  
  RETURN json_build_object('success', true, 'member_id', member_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_organization_stats(org_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_employees', (
      SELECT COUNT(*) FROM public.organization_members 
      WHERE organization_id = org_id AND status = 'active'
    ),
    'total_views_30d', (
      SELECT COALESCE(SUM(epm.profile_views_count), 0)
      FROM public.employee_performance_metrics epm
      JOIN public.organization_members om ON epm.employee_id = om.user_id
      WHERE om.organization_id = org_id 
        AND epm.metric_date >= CURRENT_DATE - INTERVAL '30 days'
    ),
    'total_leads_30d', (
      SELECT COALESCE(SUM(epm.leads_generated_count), 0)
      FROM public.employee_performance_metrics epm
      JOIN public.organization_members om ON epm.employee_id = om.user_id
      WHERE om.organization_id = org_id 
        AND epm.metric_date >= CURRENT_DATE - INTERVAL '30 days'
    ),
    'total_connections_30d', (
      SELECT COALESCE(SUM(epm.connections_made_count), 0)
      FROM public.employee_performance_metrics epm
      JOIN public.organization_members om ON epm.employee_id = om.user_id
      WHERE om.organization_id = org_id 
        AND epm.metric_date >= CURRENT_DATE - INTERVAL '30 days'
    ),
    'active_employees_with_permissions', (
      SELECT COUNT(DISTINCT om.user_id)
      FROM public.organization_members om
      JOIN public.employee_data_permissions edp ON om.id = edp.organization_member_id
      WHERE om.organization_id = org_id 
        AND om.status = 'active'
        AND edp.granted = true
    )
  ) INTO stats;
  
  RETURN stats;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_signup_links(count_param integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..count_param LOOP
    INSERT INTO public.onboarding (signup_link_id)
    VALUES (encode(gen_random_bytes(10), 'hex'));
  END LOOP;
END;
$function$;