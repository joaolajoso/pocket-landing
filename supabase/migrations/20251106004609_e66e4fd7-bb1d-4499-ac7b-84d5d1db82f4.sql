-- Migration: Comprehensive Audit System with Roles and GDPR Compliance
-- Part 1: Create role system

-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create SECURITY DEFINER function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. RLS Policies for user_roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Part 2: Create audit log table

-- 5. Create profile_audit_log table
CREATE TABLE public.profile_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Who and When
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    
    -- What changed
    action_type TEXT NOT NULL,
    table_name TEXT DEFAULT 'profiles',
    
    -- Changed fields
    field_changed TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    
    -- Change context
    change_reason TEXT,
    ip_address INET,
    user_agent TEXT,
    
    -- Additional metadata
    metadata JSONB
);

-- Create indexes for performance
CREATE INDEX idx_audit_user_timestamp ON public.profile_audit_log(user_id, timestamp DESC);
CREATE INDEX idx_audit_field_changed ON public.profile_audit_log(field_changed);
CREATE INDEX idx_audit_timestamp ON public.profile_audit_log(timestamp DESC);

-- Enable RLS on audit log
ALTER TABLE public.profile_audit_log ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for audit log
CREATE POLICY "Only admins can view audit logs"
ON public.profile_audit_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs"
ON public.profile_audit_log
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Audit logs are immutable"
ON public.profile_audit_log
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Only admins can delete old audit logs"
ON public.profile_audit_log
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') AND timestamp < now() - INTERVAL '2 years');

-- Part 3: Automatic trigger for profile changes

-- 7. Create trigger function to log profile changes
CREATE OR REPLACE FUNCTION public.log_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    field_name TEXT;
    old_val TEXT;
    new_val TEXT;
    sensitive_fields TEXT[] := ARRAY[
        'name', 'email', 'phone_number', 'bio', 'headline', 
        'linkedin', 'website', 'facebook', 'instagram', 'twitter',
        'share_email_publicly', 'share_phone_publicly',
        'slug', 'job_title', 'photo_url'
    ];
BEGIN
    -- For each sensitive field, check if it changed
    FOREACH field_name IN ARRAY sensitive_fields
    LOOP
        EXECUTE format('SELECT ($1).%I::TEXT', field_name) INTO old_val USING OLD;
        EXECUTE format('SELECT ($1).%I::TEXT', field_name) INTO new_val USING NEW;
        
        IF old_val IS DISTINCT FROM new_val THEN
            INSERT INTO public.profile_audit_log (
                user_id,
                action_type,
                table_name,
                field_changed,
                old_value,
                new_value,
                metadata
            ) VALUES (
                NEW.id,
                TG_OP,
                TG_TABLE_NAME,
                field_name,
                old_val,
                new_val,
                jsonb_build_object(
                    'trigger_op', TG_OP,
                    'trigger_when', TG_WHEN,
                    'trigger_level', TG_LEVEL,
                    'changed_at', now()
                )
            );
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$;

-- 8. Activate trigger on profiles table
CREATE TRIGGER profile_audit_trigger
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.log_profile_changes();

-- Part 4: Cleanup function for 2-year retention

-- 9. Create cleanup function for GDPR compliance (2 years retention)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.profile_audit_log
    WHERE timestamp < now() - INTERVAL '2 years';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;