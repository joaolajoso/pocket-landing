import { Connection } from '@/hooks/network/useNetworkConnections';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, ArrowRight, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecentConnectionsPreviewProps {
  connections: Connection[];
  loading: boolean;
  onNavigateToNetwork: () => void;
}

const RecentConnectionsPreview = ({
  connections,
  loading,
  onNavigateToNetwork
}: RecentConnectionsPreviewProps) => {
  const recentConnections = connections.slice(0, 3);
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };
  
  if (loading) {
    return (
      <div className="mb-4 md:mb-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex items-center gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (connections.length === 0) {
    return (
      <div className="mb-4 md:mb-6">
        <h3 className="text-base font-semibold flex items-center gap-2 mb-3 px-1">
          <Users className="h-4 w-4" />
          Recent Connections
        </h3>
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
            <UserPlus className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Start networking! Save profiles to your connections.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onNavigateToNetwork}
          >
            Go to Network
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 md:mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Users className="h-4 w-4" />
          Recent Connections
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 text-xs"
          onClick={onNavigateToNetwork}
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="flex items-center justify-start gap-6">
        {recentConnections.map((connection, index) => {
          const profile = connection.profile;
          const avatarUrl = profile?.photo_url || profile?.avatar_url || '';
          const name = profile?.name || 'Unknown';
          const headline = profile?.headline || profile?.job_title || '';
          
          return (
            <motion.div 
              key={connection.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center text-center min-w-0"
            >
              <Avatar className="h-12 w-12 mb-2 ring-2 ring-background shadow-sm">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback className="text-xs">{getInitials(name)}</AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium truncate max-w-[80px]">{name.split(' ')[0]}</p>
              {headline && (
                <p className="text-xs text-muted-foreground truncate max-w-[80px]">
                  {headline.split(' ').slice(0, 2).join(' ')}
                </p>
              )}
            </motion.div>
          );
        })}
        
        {connections.length > 3 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center"
          >
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={onNavigateToNetwork}
            >
              <span className="text-sm font-medium">+{connections.length - 3}</span>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">more</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RecentConnectionsPreview;
