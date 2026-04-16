-- Fase 1: Adicionar novos tipos de permissão
ALTER TABLE employee_data_permissions 
DROP CONSTRAINT IF EXISTS employee_data_permissions_permission_type_check;

ALTER TABLE employee_data_permissions
ADD CONSTRAINT employee_data_permissions_permission_type_check
CHECK (permission_type IN (
  'profile_views',
  'link_clicks',
  'leads',
  'connections',
  'contact_info',
  'analytics',
  'performance_metrics',
  'view_company_metrics',
  'view_employee_metrics',
  'manage_employees',
  'edit_company_website',
  'manage_departments'
));

-- Fase 2: Criar função de validação de permissões
CREATE OR REPLACE FUNCTION public.has_permission(
  user_id_param uuid,
  org_id_param uuid,
  permission_type_param text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
  has_explicit_permission boolean;
BEGIN
  -- Obter papel do utilizador
  SELECT role INTO user_role
  FROM organization_members
  WHERE user_id = user_id_param
    AND organization_id = org_id_param
    AND status = 'active';
  
  -- Se não é membro, retornar false
  IF user_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Owner tem todas as permissões
  IF user_role = 'owner' THEN
    RETURN true;
  END IF;
  
  -- Admin tem todas as permissões exceto gerir outros admins
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Manager: verificar permissões explícitas + permissões base
  IF user_role = 'manager' THEN
    IF permission_type_param IN (
      'manage_employees',
      'view_employee_metrics',
      'view_company_metrics',
      'profile_views',
      'leads',
      'connections',
      'performance_metrics'
    ) THEN
      RETURN true;
    END IF;
  END IF;
  
  -- Employee: apenas permissões explicitamente concedidas
  IF user_role = 'employee' THEN
    SELECT granted INTO has_explicit_permission
    FROM employee_data_permissions edp
    JOIN organization_members om ON om.id = edp.organization_member_id
    WHERE om.user_id = user_id_param
      AND om.organization_id = org_id_param
      AND edp.permission_type = permission_type_param;
    
    RETURN COALESCE(has_explicit_permission, false);
  END IF;
  
  RETURN false;
END;
$$;

-- Fase 3: Atualizar RLS Policies

-- Remover policies antigas que podem causar conflito
DROP POLICY IF EXISTS "Managers can manage employee permissions" ON employee_data_permissions;
DROP POLICY IF EXISTS "Managers can manage employees" ON organization_members;

-- employee_data_permissions: gestores podem ver/editar permissões de funcionários
CREATE POLICY "Managers can manage employee permissions"
ON employee_data_permissions
FOR ALL
USING (
  organization_member_id IN (
    SELECT om.id
    FROM organization_members om
    WHERE om.organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('manager', 'admin', 'owner')
        AND status = 'active'
    )
    AND om.role = 'employee'
  )
);

-- organization_members: gestores podem adicionar/remover funcionários
CREATE POLICY "Managers can manage employees"
ON organization_members
FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
      AND role IN ('manager', 'admin', 'owner')
      AND status = 'active'
  )
  AND (
    -- Gestores só podem gerir funcionários
    (role = 'employee' AND EXISTS (
      SELECT 1 FROM organization_members
      WHERE user_id = auth.uid()
        AND role = 'manager'
        AND status = 'active'
    ))
    OR 
    -- Admins podem gerir gestores e funcionários
    (role IN ('employee', 'manager') AND EXISTS (
      SELECT 1 FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'owner')
        AND status = 'active'
    ))
  )
);

-- Managers podem remover funcionários
CREATE POLICY "Managers can remove employees"
ON organization_members
FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
      AND role IN ('manager', 'admin', 'owner')
      AND status = 'active'
  )
  AND (
    (role = 'employee' AND EXISTS (
      SELECT 1 FROM organization_members
      WHERE user_id = auth.uid()
        AND role = 'manager'
        AND status = 'active'
    ))
    OR 
    (role IN ('employee', 'manager') AND EXISTS (
      SELECT 1 FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'owner')
        AND status = 'active'
    ))
  )
);