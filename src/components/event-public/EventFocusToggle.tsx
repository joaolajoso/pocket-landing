import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Eye, Focus } from 'lucide-react';

interface EventFocusToggleProps {
  eventId: string;
  isParticipant: boolean;
  isEventActive: boolean;
}

const EventFocusToggle = ({ eventId, isParticipant, isEventActive }: EventFocusToggleProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<'all' | 'focus'>('all');

  // Determine current mode based on route
  useEffect(() => {
    if (location.pathname.includes('/events/')) {
      setMode('focus');
    } else {
      setMode('all');
    }
  }, [location.pathname]);

  // Only show for active events and participants
  if (!isParticipant || !isEventActive) {
    return null;
  }

  const handleToggle = (newMode: 'all' | 'focus') => {
    setMode(newMode);
    if (newMode === 'focus') {
      navigate(`/events/${eventId}`);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-background/95 backdrop-blur-md border border-border rounded-full p-1 shadow-lg flex gap-1">
        <button
          onClick={() => handleToggle('all')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
            mode === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <Eye className="h-4 w-4" />
          All
        </button>
        <button
          onClick={() => handleToggle('focus')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
            mode === 'focus'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <Focus className="h-4 w-4" />
          Focus
        </button>
      </div>
    </div>
  );
};

export default EventFocusToggle;
