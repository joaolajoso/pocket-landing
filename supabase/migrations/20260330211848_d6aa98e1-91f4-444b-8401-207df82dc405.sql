
-- Add confirmed_at to onboarding table for consent proof
ALTER TABLE public.onboarding
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.onboarding.confirmed_at IS 'Timestamp when user explicitly confirmed NFC card binding to their account';
