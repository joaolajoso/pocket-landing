-- Revert RLS changes to restore public profile visibility

-- Drop the public_profiles view
DROP VIEW IF EXISTS public.public_profiles;

-- Drop the restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate the original public policy that allows anyone to view active profiles
CREATE POLICY "Public profile info is viewable by everyone"
ON public.profiles
FOR SELECT
USING (status = 'active');

-- Allow authenticated users to view their own complete profile (including when inactive)
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);