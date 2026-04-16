-- Add theme_key column
ALTER TABLE public.profile_design_settings 
ADD COLUMN IF NOT EXISTS theme_key text;

-- Backfill existing records based on background_color
UPDATE public.profile_design_settings SET theme_key = 
  CASE 
    WHEN UPPER(background_color) LIKE '%C41E5C%' OR UPPER(background_color) LIKE '%722F37%' THEN 'wine'
    WHEN UPPER(background_color) LIKE '%059669%' OR UPPER(background_color) LIKE '%2D6A4F%' OR UPPER(background_color) LIKE '%047857%' THEN 'green'
    WHEN UPPER(background_color) LIKE '%EA580C%' OR UPPER(background_color) LIKE '%E76F51%' OR UPPER(background_color) LIKE '%C2410C%' THEN 'orange'
    WHEN UPPER(background_color) LIKE '%4B5563%' OR UPPER(background_color) LIKE '%6B7280%' OR UPPER(background_color) LIKE '%374151%' THEN 'gray'
    WHEN UPPER(background_color) LIKE '%7C3AED%' OR UPPER(background_color) LIKE '%6D28D9%' THEN 'purple'
    ELSE NULL
  END
WHERE theme_key IS NULL;