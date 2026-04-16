
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BusinessSignupData {
  name: string;
  email: string;
  password: string;
  companyName: string;
  companySize: string;
}

export const useBusinessSignup = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createBusinessAccount = async (businessData: BusinessSignupData) => {
    try {
      setLoading(true);

      // First, create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: businessData.email,
        password: businessData.password,
        options: {
          data: { 
            name: businessData.name,
            account_type: 'business'
          },
          emailRedirectTo: window.location.origin + '/dashboard'
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create the organization
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: businessData.companyName,
            size_category: businessData.companySize,
            created_by: authData.user.id
          })
          .select()
          .single();

        if (orgError) {
          console.error('Error creating organization:', orgError);
          // Don't throw here - user is created but organization failed
          return { success: true, organizationError: orgError.message };
        }

        if (orgData) {
          // Add user as organization owner
          const { error: memberError } = await supabase
            .from('organization_members')
            .insert({
              organization_id: orgData.id,
              user_id: authData.user.id,
              role: 'owner',
              status: 'active',
              joined_at: new Date().toISOString()
            });

          if (memberError) {
            console.error('Error adding user as organization member:', memberError);
          }

          // Update user profile with organization
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ organization_id: orgData.id })
            .eq('id', authData.user.id);

          if (profileError) {
            console.error('Error updating profile with organization:', profileError);
          }
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in business signup:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    createBusinessAccount,
    loading
  };
};
