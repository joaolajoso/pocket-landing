
-- Add payment_links JSONB column to event_landing_config for multiple payment links
-- Format: [{ "title": "Pagamento Inscrição", "url": "https://..." }, ...]
ALTER TABLE public.event_landing_config 
ADD COLUMN payment_links jsonb DEFAULT '[]'::jsonb;

-- Create event_payments table to track user payment clicks and iframe responses
CREATE TABLE public.event_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  payment_link_title text,
  payment_link_url text NOT NULL,
  response_code integer,
  status text NOT NULL DEFAULT 'clicked',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_payments ENABLE ROW LEVEL SECURITY;

-- Users can insert their own payment records
CREATE POLICY "Users can insert their own payments"
ON public.event_payments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own payments
CREATE POLICY "Users can view their own payments"
ON public.event_payments
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own payments (for response_code updates)
CREATE POLICY "Users can update their own payments"
ON public.event_payments
FOR UPDATE
USING (auth.uid() = user_id);

-- Event organizers can view all payments for their events
CREATE POLICY "Event organizers can view event payments"
ON public.event_payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = event_payments.event_id
    AND (
      e.created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.organization_id = e.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
        AND om.status = 'active'
      )
    )
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_event_payments_updated_at
BEFORE UPDATE ON public.event_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
