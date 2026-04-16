-- Add new columns for business public page redesign
ALTER TABLE organization_websites ADD COLUMN IF NOT EXISTS
  business_type TEXT DEFAULT 'services' CHECK (business_type IN ('products', 'services'));

ALTER TABLE organization_websites ADD COLUMN IF NOT EXISTS
  price_range TEXT CHECK (price_range IN ('€', '€€', '€€€', '€€€€'));

ALTER TABLE organization_websites ADD COLUMN IF NOT EXISTS
  phone TEXT;

ALTER TABLE organization_websites ADD COLUMN IF NOT EXISTS
  email TEXT;

ALTER TABLE organization_websites ADD COLUMN IF NOT EXISTS
  whatsapp TEXT;

ALTER TABLE organization_websites ADD COLUMN IF NOT EXISTS
  instagram TEXT;

ALTER TABLE organization_websites ADD COLUMN IF NOT EXISTS
  facebook TEXT;

ALTER TABLE organization_websites ADD COLUMN IF NOT EXISTS
  region TEXT;

ALTER TABLE organization_websites ADD COLUMN IF NOT EXISTS
  business_hours JSONB DEFAULT '[]';

ALTER TABLE organization_websites ADD COLUMN IF NOT EXISTS
  products JSONB DEFAULT '[]';

ALTER TABLE organization_websites ADD COLUMN IF NOT EXISTS
  amenities JSONB DEFAULT '[]';