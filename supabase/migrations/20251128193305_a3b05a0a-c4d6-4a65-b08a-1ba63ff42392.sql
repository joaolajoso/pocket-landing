-- Add separate country and city fields to events table
ALTER TABLE events 
ADD COLUMN country TEXT,
ADD COLUMN city TEXT;

-- Create index for better filtering performance
CREATE INDEX idx_events_country ON events(country);
CREATE INDEX idx_events_city ON events(city);

-- Attempt to parse existing location data into country and city
-- This is a best-effort migration for existing data
UPDATE events
SET 
  country = CASE
    -- If location has comma, last part is likely country
    WHEN location LIKE '%,%' THEN 
      TRIM(SUBSTRING(location FROM '([^,]+)$'))
    -- Single word locations - common country names
    WHEN location IN ('Portugal', 'Spain', 'France', 'Germany', 'Italy', 'UK', 'USA', 'Brazil') THEN
      location
    ELSE NULL
  END,
  city = CASE
    -- If location has comma, second to last part is likely city
    WHEN location LIKE '%,%,%' THEN
      TRIM(SPLIT_PART(location, ',', -2))
    WHEN location LIKE '%,%' AND location NOT IN ('Portugal', 'Spain', 'France', 'Germany', 'Italy', 'UK', 'USA', 'Brazil') THEN
      TRIM(SPLIT_PART(location, ',', 1))
    -- If single word and not a country, treat as city
    WHEN location NOT IN ('Portugal', 'Spain', 'France', 'Germany', 'Italy', 'UK', 'USA', 'Brazil') THEN
      location
    ELSE NULL
  END
WHERE location IS NOT NULL;