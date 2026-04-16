-- Reset all users to true since the previous false values were set automatically by code bug
-- Users who genuinely want to hide can toggle off in Appearance
UPDATE profiles 
SET share_email_publicly = true, share_phone_publicly = true 
WHERE share_email_publicly = false OR share_phone_publicly = false;