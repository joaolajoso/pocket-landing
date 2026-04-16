import { useEffect, useState } from 'react';
import { Users, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EventQRMetricsProps {
  userId?: string;
}

const EventQRMetrics = ({ userId }: EventQRMetricsProps) => {
  const [connections, setConnections] = useState(0);
  const [views, setViews] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const fetchMetrics = async () => {
      const [{ count: connCount }, { count: viewCount }] = await Promise.all([
        supabase
          .from('connections')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('profile_views')
          .select('*', { count: 'exact', head: true })
          .eq('profile_id', userId),
      ]);
      setConnections(connCount || 0);
      setViews(viewCount || 0);
    };

    fetchMetrics();
  }, [userId]);

  return (
    <div className="flex gap-6 justify-center">
      <div className="flex items-center gap-2 text-sm">
        <Users className="h-4 w-4 text-primary" />
        <span className="font-semibold">{connections}</span>
        <span className="text-muted-foreground">conexões</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Eye className="h-4 w-4 text-primary" />
        <span className="font-semibold">{views}</span>
        <span className="text-muted-foreground">taps</span>
      </div>
    </div>
  );
};

export default EventQRMetrics;
