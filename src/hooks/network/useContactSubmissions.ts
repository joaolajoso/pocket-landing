
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  created_at: string;
  profile_owner_id: string;
  file_url?: string | null;
  file_name?: string | null;
}

export const useContactSubmissions = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSubmissions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .eq('profile_owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isDashboard = window.location.pathname.startsWith('/dashboard');
    if (!isDashboard) return;
    
    fetchSubmissions();
  }, [user?.id]);

  return {
    submissions,
    loading,
    error,
    refetch: fetchSubmissions
  };
};
