-- Add status enum type for account status
CREATE TYPE public.account_status AS ENUM ('active', 'deactivated');

-- Add status column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN status public.account_status NOT NULL DEFAULT 'active';

-- Create function to deactivate user account
CREATE OR REPLACE FUNCTION public.deactivate_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the user's profile status to deactivated
  UPDATE public.profiles 
  SET status = 'deactivated', updated_at = now()
  WHERE id = auth.uid();
  
  -- Sign out the user immediately
  -- Note: The actual sign out will be handled in the client
END;
$$;

-- Update RLS policies to only allow active users
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id AND status = 'active');

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id AND status = 'active');

-- Allow users to deactivate their own account (special case for status update)
CREATE POLICY "Users can deactivate own account" ON public.profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND status = 'deactivated');

-- Update other table policies to check for active status
DROP POLICY IF EXISTS "Users can view their own links" ON public.links;
CREATE POLICY "Users can view their own links" ON public.links
FOR SELECT USING (
  auth.uid() = user_id AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'active')
);

DROP POLICY IF EXISTS "Users can create their own links" ON public.links;
CREATE POLICY "Users can create their own links" ON public.links
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'active')
);

DROP POLICY IF EXISTS "Users can update their own links" ON public.links;
CREATE POLICY "Users can update their own links" ON public.links
FOR UPDATE USING (
  auth.uid() = user_id AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'active')
);

DROP POLICY IF EXISTS "Users can delete their own links" ON public.links;
CREATE POLICY "Users can delete their own links" ON public.links
FOR DELETE USING (
  auth.uid() = user_id AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'active')
);

-- Update link_groups policies
DROP POLICY IF EXISTS "Users can view their own link_groups" ON public.link_groups;
CREATE POLICY "Users can view their own link_groups" ON public.link_groups
FOR SELECT USING (
  auth.uid() = user_id AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'active')
);

DROP POLICY IF EXISTS "Users can create their own link_groups" ON public.link_groups;
CREATE POLICY "Users can create their own link_groups" ON public.link_groups
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'active')
);

DROP POLICY IF EXISTS "Users can update their own link_groups" ON public.link_groups;
CREATE POLICY "Users can update their own link_groups" ON public.link_groups
FOR UPDATE USING (
  auth.uid() = user_id AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'active')
);

DROP POLICY IF EXISTS "Users can delete their own link_groups" ON public.link_groups;
CREATE POLICY "Users can delete their own link_groups" ON public.link_groups
FOR DELETE USING (
  auth.uid() = user_id AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'active')
);