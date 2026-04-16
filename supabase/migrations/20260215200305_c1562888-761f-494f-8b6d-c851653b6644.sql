
CREATE TABLE public.event_landing_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE UNIQUE NOT NULL,
  logo_url text,
  event_name text,
  description text,
  payment_amount text,
  payment_deadline timestamptz,
  payment_url text,
  show_payment boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.event_landing_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event creators can manage landing config"
ON public.event_landing_config
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_landing_config.event_id
    AND events.created_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_landing_config.event_id
    AND events.created_by = auth.uid()
  )
);

-- Also allow org admins
CREATE POLICY "Org admins can manage landing config"
ON public.event_landing_config
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.organization_members om ON om.organization_id = e.organization_id
    WHERE e.id = event_landing_config.event_id
    AND om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
    AND om.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.organization_members om ON om.organization_id = e.organization_id
    WHERE e.id = event_landing_config.event_id
    AND om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
    AND om.status = 'active'
  )
);

CREATE TRIGGER update_event_landing_config_updated_at
BEFORE UPDATE ON public.event_landing_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
