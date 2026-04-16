-- Corrigir trigger de profiles para auditar apenas campos existentes
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
    -- APENAS campos que existem na tabela profiles
    sensitive_fields TEXT[] := ARRAY[
        'name', 'full_name', 'email', 'phone_number', 
        'bio', 'headline', 'job_title', 'slug', 
        'photo_url', 'organization_id', 'status',
        'share_email_publicly', 'share_phone_publicly'
    ];
BEGIN
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
                'profiles',
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

-- Criar trigger para auditoria de links
CREATE OR REPLACE FUNCTION public.log_link_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    link_type TEXT;
BEGIN
    -- Determinar tipo de link (facebook, instagram, linkedin, etc)
    IF TG_OP = 'INSERT' THEN
        link_type := NEW.icon;
        
        INSERT INTO public.profile_audit_log (
            user_id,
            action_type,
            table_name,
            field_changed,
            old_value,
            new_value,
            metadata
        ) VALUES (
            NEW.user_id,
            'INSERT',
            'links',
            link_type || '_link',
            NULL,
            NEW.url,
            jsonb_build_object(
                'link_id', NEW.id,
                'link_type', NEW.icon,
                'title', NEW.title,
                'group_id', NEW.group_id,
                'created_at', now()
            )
        );
        
    ELSIF TG_OP = 'UPDATE' THEN
        link_type := NEW.icon;
        
        -- Auditar mudança de URL
        IF OLD.url IS DISTINCT FROM NEW.url THEN
            INSERT INTO public.profile_audit_log (
                user_id,
                action_type,
                table_name,
                field_changed,
                old_value,
                new_value,
                metadata
            ) VALUES (
                NEW.user_id,
                'UPDATE',
                'links',
                link_type || '_url',
                OLD.url,
                NEW.url,
                jsonb_build_object(
                    'link_id', NEW.id,
                    'link_type', NEW.icon,
                    'title', NEW.title,
                    'changed_at', now()
                )
            );
        END IF;
        
        -- Auditar mudança de título
        IF OLD.title IS DISTINCT FROM NEW.title THEN
            INSERT INTO public.profile_audit_log (
                user_id,
                action_type,
                table_name,
                field_changed,
                old_value,
                new_value,
                metadata
            ) VALUES (
                NEW.user_id,
                'UPDATE',
                'links',
                link_type || '_title',
                OLD.title,
                NEW.title,
                jsonb_build_object(
                    'link_id', NEW.id,
                    'link_type', NEW.icon,
                    'changed_at', now()
                )
            );
        END IF;
        
        -- Auditar mudança de status (active)
        IF OLD.active IS DISTINCT FROM NEW.active THEN
            INSERT INTO public.profile_audit_log (
                user_id,
                action_type,
                table_name,
                field_changed,
                old_value,
                new_value,
                metadata
            ) VALUES (
                NEW.user_id,
                'UPDATE',
                'links',
                link_type || '_active_status',
                OLD.active::TEXT,
                NEW.active::TEXT,
                jsonb_build_object(
                    'link_id', NEW.id,
                    'link_type', NEW.icon,
                    'changed_at', now()
                )
            );
        END IF;
        
    ELSIF TG_OP = 'DELETE' THEN
        link_type := OLD.icon;
        
        INSERT INTO public.profile_audit_log (
            user_id,
            action_type,
            table_name,
            field_changed,
            old_value,
            new_value,
            metadata
        ) VALUES (
            OLD.user_id,
            'DELETE',
            'links',
            link_type || '_link',
            OLD.url,
            NULL,
            jsonb_build_object(
                'link_id', OLD.id,
                'link_type', OLD.icon,
                'title', OLD.title,
                'deleted_at', now()
            )
        );
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- Ativar trigger para INSERT/UPDATE em links
DROP TRIGGER IF EXISTS links_audit_trigger ON public.links;
CREATE TRIGGER links_audit_trigger
AFTER INSERT OR UPDATE ON public.links
FOR EACH ROW
EXECUTE FUNCTION public.log_link_changes();

-- Ativar trigger para DELETE em links
DROP TRIGGER IF EXISTS links_delete_audit_trigger ON public.links;
CREATE TRIGGER links_delete_audit_trigger
AFTER DELETE ON public.links
FOR EACH ROW
EXECUTE FUNCTION public.log_link_changes();