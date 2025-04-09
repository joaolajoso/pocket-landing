
-- Function to count all link clicks for a user
CREATE OR REPLACE FUNCTION count_link_clicks(user_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  click_count INTEGER;
BEGIN
  -- Count all link clicks where user_id matches the parameter
  SELECT COUNT(*)
  INTO click_count
  FROM link_clicks
  WHERE user_id = user_id_param;
  
  RETURN click_count;
END;
$$;

-- Function to insert a link click
CREATE OR REPLACE FUNCTION insert_link_click(link_id_param TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the current user ID from the auth context
  current_user_id := auth.uid();
  
  -- Insert a new link click record
  INSERT INTO link_clicks (link_id, user_id)
  VALUES (link_id_param, COALESCE(current_user_id, '00000000-0000-0000-0000-000000000000'::UUID));
END;
$$;
