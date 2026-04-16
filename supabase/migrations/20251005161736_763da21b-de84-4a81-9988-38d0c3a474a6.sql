-- Modificar função update_employee_performance_metrics para filtrar métricas por período de emprego
CREATE OR REPLACE FUNCTION public.update_employee_performance_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  org_member RECORD;
  employment_start DATE;
  employment_end DATE;
BEGIN
  -- Loop através de todos os membros ativos das organizações
  FOR org_member IN 
    SELECT om.organization_id, om.user_id, om.joined_at, om.status, om.updated_at
    FROM public.organization_members om 
    WHERE om.status = 'active' OR om.status = 'inactive'
  LOOP
    -- Determinar período de emprego
    employment_start := COALESCE(DATE(org_member.joined_at), CURRENT_DATE);
    
    -- Se o colaborador está inativo, usar updated_at como data de saída
    -- Caso contrário, usar a data atual
    IF org_member.status = 'inactive' THEN
      employment_end := DATE(org_member.updated_at);
    ELSE
      employment_end := CURRENT_DATE;
    END IF;
    
    -- Apenas processar se a data atual está dentro do período de emprego
    -- e se joined_at existe (para evitar dados inválidos)
    IF org_member.joined_at IS NOT NULL 
       AND CURRENT_DATE >= employment_start 
       AND CURRENT_DATE <= employment_end THEN
      
      -- Inserir ou atualizar métricas de hoje
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
          AND DATE(pv.timestamp) >= employment_start
          AND DATE(pv.timestamp) <= employment_end
      ) profile_views
      CROSS JOIN (
        SELECT COUNT(*) as count
        FROM public.profile_views pv
        WHERE pv.profile_id = org_member.user_id
          AND pv.source LIKE 'click:%'
          AND DATE(pv.timestamp) = CURRENT_DATE
          AND DATE(pv.timestamp) >= employment_start
          AND DATE(pv.timestamp) <= employment_end
      ) link_clicks
      CROSS JOIN (
        SELECT COUNT(*) as count
        FROM public.contact_submissions cs
        WHERE cs.profile_owner_id = org_member.user_id
          AND DATE(cs.created_at) = CURRENT_DATE
          AND DATE(cs.created_at) >= employment_start
          AND DATE(cs.created_at) <= employment_end
      ) leads
      CROSS JOIN (
        SELECT COUNT(*) as count
        FROM public.connections c
        WHERE c.user_id = org_member.user_id
          AND DATE(c.created_at) = CURRENT_DATE
          AND DATE(c.created_at) >= employment_start
          AND DATE(c.created_at) <= employment_end
      ) connections
      ON CONFLICT (organization_id, employee_id, metric_date)
      DO UPDATE SET
        profile_views_count = EXCLUDED.profile_views_count,
        link_clicks_count = EXCLUDED.link_clicks_count,
        leads_generated_count = EXCLUDED.leads_generated_count,
        connections_made_count = EXCLUDED.connections_made_count,
        updated_at = now();
    END IF;
  END LOOP;
END;
$function$;

-- Criar índice para otimizar queries com joined_at
CREATE INDEX IF NOT EXISTS idx_org_members_joined_at 
ON public.organization_members(joined_at) 
WHERE joined_at IS NOT NULL;

-- Criar índice para otimizar queries com status
CREATE INDEX IF NOT EXISTS idx_org_members_status 
ON public.organization_members(organization_id, status);

-- Função auxiliar para popular métricas históricas (últimos 30 dias)
CREATE OR REPLACE FUNCTION public.initialize_organization_metrics(org_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  org_member RECORD;
  metric_day DATE;
  employment_start DATE;
  employment_end DATE;
  days_back INTEGER := 30;
BEGIN
  -- Loop através de todos os membros da organização
  FOR org_member IN 
    SELECT om.user_id, om.joined_at, om.status, om.updated_at
    FROM public.organization_members om 
    WHERE om.organization_id = org_id
      AND (om.status = 'active' OR om.status = 'inactive')
  LOOP
    -- Determinar período de emprego
    employment_start := COALESCE(DATE(org_member.joined_at), CURRENT_DATE - days_back);
    
    IF org_member.status = 'inactive' THEN
      employment_end := DATE(org_member.updated_at);
    ELSE
      employment_end := CURRENT_DATE;
    END IF;
    
    -- Loop através dos últimos 30 dias
    FOR metric_day IN 
      SELECT generate_series(
        GREATEST(employment_start, CURRENT_DATE - days_back),
        LEAST(employment_end, CURRENT_DATE),
        '1 day'::interval
      )::DATE
    LOOP
      -- Inserir métricas para cada dia
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
        org_id,
        org_member.user_id,
        metric_day,
        COALESCE(profile_views.count, 0),
        COALESCE(link_clicks.count, 0),
        COALESCE(leads.count, 0),
        COALESCE(connections.count, 0)
      FROM (
        SELECT COUNT(*) as count
        FROM public.profile_views pv
        WHERE pv.profile_id = org_member.user_id
          AND DATE(pv.timestamp) = metric_day
      ) profile_views
      CROSS JOIN (
        SELECT COUNT(*) as count
        FROM public.profile_views pv
        WHERE pv.profile_id = org_member.user_id
          AND pv.source LIKE 'click:%'
          AND DATE(pv.timestamp) = metric_day
      ) link_clicks
      CROSS JOIN (
        SELECT COUNT(*) as count
        FROM public.contact_submissions cs
        WHERE cs.profile_owner_id = org_member.user_id
          AND DATE(cs.created_at) = metric_day
      ) leads
      CROSS JOIN (
        SELECT COUNT(*) as count
        FROM public.connections c
        WHERE c.user_id = org_member.user_id
          AND DATE(c.created_at) = metric_day
      ) connections
      ON CONFLICT (organization_id, employee_id, metric_date)
      DO NOTHING;
    END LOOP;
  END LOOP;
END;
$function$;