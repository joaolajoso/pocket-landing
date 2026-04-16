
-- Create business organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  industry TEXT,
  size_category TEXT CHECK (size_category IN ('startup', 'small', 'medium', 'large', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- Create organization members table (employees)
CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'employee')),
  department TEXT,
  position TEXT,
  hire_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Create organization invitations table
CREATE TABLE public.organization_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'employee')),
  department TEXT,
  position TEXT,
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  invitation_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, email)
);

-- Create performance metrics table for tracking employee performance
CREATE TABLE public.employee_performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  profile_views_count INTEGER DEFAULT 0,
  link_clicks_count INTEGER DEFAULT 0,
  leads_generated_count INTEGER DEFAULT 0,
  connections_made_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  engagement_score DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, employee_id, metric_date)
);

-- Create organization goals table for setting team targets
CREATE TABLE public.organization_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_type TEXT NOT NULL CHECK (target_type IN ('leads', 'views', 'connections', 'conversion_rate')),
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2) DEFAULT 0,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  assigned_to UUID REFERENCES auth.users(id), -- NULL means organization-wide goal
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add organization_id to existing profiles table to link employees to organizations
ALTER TABLE public.profiles 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Enable RLS on all new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view organizations they belong to" 
  ON public.organizations 
  FOR SELECT 
  USING (
    id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Organization owners and admins can update organizations" 
  ON public.organizations 
  FOR UPDATE 
  USING (
    id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() 
        AND role IN ('owner', 'admin') 
        AND status = 'active'
    )
  );

CREATE POLICY "Users can create organizations" 
  ON public.organizations 
  FOR INSERT 
  WITH CHECK (created_by = auth.uid());

-- RLS Policies for organization members
CREATE POLICY "Organization members can view other members" 
  ON public.organization_members 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Organization owners and admins can manage members" 
  ON public.organization_members 
  FOR ALL 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() 
        AND role IN ('owner', 'admin') 
        AND status = 'active'
    )
  );

-- RLS Policies for organization invitations
CREATE POLICY "Organization members can view invitations" 
  ON public.organization_invitations 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() 
        AND role IN ('owner', 'admin', 'manager') 
        AND status = 'active'
    )
  );

CREATE POLICY "Organization owners and admins can manage invitations" 
  ON public.organization_invitations 
  FOR ALL 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() 
        AND role IN ('owner', 'admin') 
        AND status = 'active'
    )
  );

-- RLS Policies for performance metrics
CREATE POLICY "Organization members can view performance metrics" 
  ON public.employee_performance_metrics 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR employee_id = auth.uid()
  );

CREATE POLICY "System can insert performance metrics" 
  ON public.employee_performance_metrics 
  FOR INSERT 
  WITH CHECK (true); -- This will be updated by system functions

-- RLS Policies for organization goals
CREATE POLICY "Organization members can view goals" 
  ON public.organization_goals 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Organization managers can manage goals" 
  ON public.organization_goals 
  FOR ALL 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() 
        AND role IN ('owner', 'admin', 'manager') 
        AND status = 'active'
    )
  );

-- Create function to update performance metrics
CREATE OR REPLACE FUNCTION public.update_employee_performance_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Create trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at 
  BEFORE UPDATE ON public.organizations 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_members_updated_at 
  BEFORE UPDATE ON public.organization_members 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_performance_metrics_updated_at 
  BEFORE UPDATE ON public.employee_performance_metrics 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_goals_updated_at 
  BEFORE UPDATE ON public.organization_goals 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
