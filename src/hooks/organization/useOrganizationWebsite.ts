import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { OrganizationWebsite, Service, Product, BusinessHour } from '@/types/organizationWebsite';

export type { OrganizationWebsite, Service, Product, BusinessHour };

// Helper to transform database data to typed OrganizationWebsite
const transformWebsiteData = (data: any): OrganizationWebsite => {
  return {
    ...data,
    services: (data.services as Service[]) || [],
    products: (data.products as Product[]) || [],
    business_hours: (data.business_hours as BusinessHour[]) || [],
    amenities: (data.amenities as string[]) || [],
    business_type: data.business_type || 'services',
    price_range: data.price_range || null,
    phone: data.phone || null,
    email: data.email || null,
    whatsapp: data.whatsapp || null,
    instagram: data.instagram || null,
    facebook: data.facebook || null,
    region: data.region || null,
    accent_color: data.accent_color || null,
    // Visibility flags - default to true if not set
    show_phone: data.show_phone !== false,
    show_email: data.show_email !== false,
    show_whatsapp: data.show_whatsapp !== false,
    // Payment method fields
    payment_method: data.payment_method || null,
    payment_key: data.payment_key || null,
    show_payment_method: data.show_payment_method === true,
  };
};

export const useOrganizationWebsite = (organizationId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [website, setWebsite] = useState<OrganizationWebsite | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWebsite = async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organization_websites')
        .select('*')
        .eq('organization_id', organizationId)
        .maybeSingle();

      if (error) {
        if (error.code !== 'PGRST116') { // Not found is ok
          console.error('Error fetching website:', error);
        }
        setWebsite(null);
      } else {
        setWebsite(transformWebsiteData(data));
      }
    } catch (err) {
      console.error('Error in fetchWebsite:', err);
      setWebsite(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsite();
  }, [organizationId]);

  const createWebsite = async (data: Partial<OrganizationWebsite> & { subdomain: string; company_name: string }) => {
    if (!user || !organizationId) return { success: false, error: 'Não autenticado' };

    try {
      const { data: newWebsite, error } = await supabase
        .from('organization_websites')
        .insert([{
          organization_id: organizationId,
          subdomain: data.subdomain,
          company_name: data.company_name,
          slogan: data.slogan || null,
          location: data.location || null,
          description: data.description || null,
          industry: data.industry || null,
          website_url: data.website_url || null,
          template_id: data.template_id || 'classic-linkedin',
          logo_url: data.logo_url || null,
          banner_image_url: data.banner_image_url || null,
          primary_color: data.primary_color || '#0ea5e9',
          secondary_color: data.secondary_color || '#ffffff',
          font_family: data.font_family || 'Inter, sans-serif',
          follower_count: data.follower_count || 0,
          show_team: data.show_team !== undefined ? data.show_team : true,
          show_services: data.show_services !== undefined ? data.show_services : true,
          show_testimonials: data.show_testimonials !== undefined ? data.show_testimonials : true,
          show_gallery: data.show_gallery !== undefined ? data.show_gallery : true,
          show_contact_form: data.show_contact_form !== undefined ? data.show_contact_form : true,
          meta_title: data.meta_title || null,
          meta_description: data.meta_description || null,
        }])
        .select()
        .single();

      if (error) throw error;

      setWebsite(transformWebsiteData(newWebsite));
      toast({
        title: "Website criado",
        description: "A página pública da empresa foi criada com sucesso.",
      });

      return { success: true, data: newWebsite };
    } catch (error: any) {
      console.error('Error creating website:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar website",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const updateWebsite = async (id: string, updates: Partial<OrganizationWebsite>) => {
    if (!user) return { success: false, error: 'Não autenticado' };

    try {
      const { data: updatedWebsite, error } = await supabase
        .from('organization_websites')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setWebsite(transformWebsiteData(updatedWebsite));
      toast({
        title: "Website atualizado",
        description: "As alterações foram guardadas com sucesso.",
      });

      return { success: true, data: updatedWebsite };
    } catch (error: any) {
      console.error('Error updating website:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar website",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const publishWebsite = async (id: string) => {
    return await updateWebsite(id, { is_published: true });
  };

  const unpublishWebsite = async (id: string) => {
    return await updateWebsite(id, { is_published: false });
  };

  return {
    website,
    loading,
    createWebsite,
    updateWebsite,
    publishWebsite,
    unpublishWebsite,
    refetch: fetchWebsite
  };
};
