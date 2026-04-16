-- Adicionar coluna para tipo de perfil activo (NFC/QR)
ALTER TABLE profiles 
ADD COLUMN active_profile_type TEXT DEFAULT 'personal';

-- Adicionar constraint para validar valores
ALTER TABLE profiles 
ADD CONSTRAINT profiles_active_profile_type_check 
CHECK (active_profile_type IN ('personal', 'business'));

-- Índice para performance em queries
CREATE INDEX idx_profiles_active_profile_type ON profiles(active_profile_type);