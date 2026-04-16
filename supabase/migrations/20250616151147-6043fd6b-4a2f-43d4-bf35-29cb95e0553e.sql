
-- Criar tabela para controlar permissões de dados dos funcionários
CREATE TABLE public.employee_data_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_member_id UUID REFERENCES public.organization_members(id) ON DELETE CASCADE NOT NULL,
  permission_type TEXT NOT NULL CHECK (permission_type IN (
    'profile_views', 'link_clicks', 'leads', 'connections', 
    'contact_info', 'analytics', 'performance_metrics'
  )),
  granted BOOLEAN NOT NULL DEFAULT false,
  granted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_member_id, permission_type)
);

-- Criar tabela para rastrear atividade dos funcionários
CREATE TABLE public.employee_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'profile_view', 'link_click', 'lead_generated', 'connection_made', 
    'profile_update', 'link_added', 'link_removed'
  )),
  activity_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Atualizar tabela de convites para incluir mais informações
ALTER TABLE public.organization_invitations 
ADD COLUMN IF NOT EXISTS message TEXT,
ADD COLUMN IF NOT EXISTS permissions_requested TEXT[] DEFAULT ARRAY['profile_views', 'leads', 'connections', 'performance_metrics'];

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_employee_data_permissions_member_id ON public.employee_data_permissions(organization_member_id);
CREATE INDEX IF NOT EXISTS idx_employee_activity_log_org_date ON public.employee_activity_log(organization_id, created_at);
CREATE INDEX IF NOT EXISTS idx_employee_activity_log_employee_date ON public.employee_activity_log(employee_id, created_at);

-- Enable RLS
ALTER TABLE public.employee_data_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies para employee_data_permissions
CREATE POLICY "Organization members can view permissions" 
  ON public.employee_data_permissions 
  FOR SELECT 
  USING (
    organization_member_id IN (
      SELECT id FROM public.organization_members 
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "Employees can manage own permissions" 
  ON public.employee_data_permissions 
  FOR ALL 
  USING (
    organization_member_id IN (
      SELECT id FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can manage permissions" 
  ON public.employee_data_permissions 
  FOR ALL 
  USING (
    organization_member_id IN (
      SELECT om.id FROM public.organization_members om
      WHERE om.organization_id IN (
        SELECT organization_id FROM public.organization_members 
        WHERE user_id = auth.uid() 
          AND role IN ('owner', 'admin') 
          AND status = 'active'
      )
    )
  );

-- RLS Policies para employee_activity_log
CREATE POLICY "Organization members can view activity" 
  ON public.employee_activity_log 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR employee_id = auth.uid()
  );

CREATE POLICY "System can insert activity" 
  ON public.employee_activity_log 
  FOR INSERT 
  WITH CHECK (true);

-- Função para aceitar convite de organização
CREATE OR REPLACE FUNCTION public.accept_organization_invitation(
  invitation_token_param TEXT,
  permissions_granted TEXT[] DEFAULT ARRAY['profile_views', 'leads', 'connections']
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Função para obter estatísticas da organização considerando permissões
CREATE OR REPLACE FUNCTION public.get_organization_stats(org_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Trigger para atualizar updated_at nas novas tabelas
CREATE TRIGGER update_employee_data_permissions_updated_at 
  BEFORE UPDATE ON public.employee_data_permissions 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
