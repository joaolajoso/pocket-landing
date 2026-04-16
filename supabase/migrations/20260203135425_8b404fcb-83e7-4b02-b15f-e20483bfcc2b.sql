-- Adicionar campos de pagamento móvel à tabela organization_websites
ALTER TABLE organization_websites 
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('pix', 'mbway')) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_key TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS show_payment_method BOOLEAN DEFAULT false;

COMMENT ON COLUMN organization_websites.payment_method IS 'Tipo de pagamento móvel: pix (Brasil) ou mbway (Portugal)';
COMMENT ON COLUMN organization_websites.payment_key IS 'Chave de pagamento (CPF, email, telefone, etc)';
COMMENT ON COLUMN organization_websites.show_payment_method IS 'Se deve mostrar na página pública';