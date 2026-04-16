-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "System can manage newsletter subscriptions" ON public.newsletter_subscriptions;

-- Allow anyone to INSERT (subscribe to newsletter) - public signup must work
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscriptions 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Only admins can SELECT (view subscriber list)
CREATE POLICY "Admins can view newsletter subscriptions" 
ON public.newsletter_subscriptions 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can UPDATE subscriptions
CREATE POLICY "Admins can update newsletter subscriptions" 
ON public.newsletter_subscriptions 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can DELETE subscriptions
CREATE POLICY "Admins can delete newsletter subscriptions" 
ON public.newsletter_subscriptions 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));