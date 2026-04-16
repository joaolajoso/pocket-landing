-- Set default values for existing users who never configured these options
UPDATE profiles 
SET share_email_publicly = true, share_phone_publicly = true 
WHERE share_email_publicly IS NULL OR share_phone_publicly IS NULL;

-- Change column defaults for new users
ALTER TABLE profiles ALTER COLUMN share_email_publicly SET DEFAULT true;
ALTER TABLE profiles ALTER COLUMN share_phone_publicly SET DEFAULT true;