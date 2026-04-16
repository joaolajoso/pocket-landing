import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useOrganizationImages = () => {
  const [uploading, setUploading] = useState(false);

  const uploadLogo = async (file: File, websiteId: string): Promise<string | null> => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${websiteId}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('organization_logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('organization_logos')
        .getPublicUrl(filePath);

      await supabase
        .from('organization_websites')
        .update({ logo_url: publicUrl })
        .eq('id', websiteId);

      toast.success('Logo enviado com sucesso');
      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast.error('Erro ao enviar logo');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadBanner = async (file: File, websiteId: string): Promise<string | null> => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${websiteId}/banner.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('organization_banners')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('organization_banners')
        .getPublicUrl(filePath);

      await supabase
        .from('organization_websites')
        .update({ banner_image_url: publicUrl })
        .eq('id', websiteId);

      toast.success('Banner enviado com sucesso');
      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading banner:', error);
      toast.error('Erro ao enviar banner');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteLogo = async (websiteId: string): Promise<boolean> => {
    try {
      const filePath = `${websiteId}/logo`;
      
      await supabase.storage
        .from('organization_logos')
        .remove([filePath]);

      await supabase
        .from('organization_websites')
        .update({ logo_url: null })
        .eq('id', websiteId);

      toast.success('Logo removido');
      return true;
    } catch (error: any) {
      console.error('Error deleting logo:', error);
      toast.error('Erro ao remover logo');
      return false;
    }
  };

  const deleteBanner = async (websiteId: string): Promise<boolean> => {
    try {
      const filePath = `${websiteId}/banner`;
      
      await supabase.storage
        .from('organization_banners')
        .remove([filePath]);

      await supabase
        .from('organization_websites')
        .update({ banner_image_url: null })
        .eq('id', websiteId);

      toast.success('Banner removido');
      return true;
    } catch (error: any) {
      console.error('Error deleting banner:', error);
      toast.error('Erro ao remover banner');
      return false;
    }
  };

  return {
    uploadLogo,
    uploadBanner,
    deleteLogo,
    deleteBanner,
    uploading
  };
};
