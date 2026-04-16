import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutGrid, Target, ChevronUp, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserActiveEventParticipation, setLastFocusEvent } from '@/hooks/useUserActiveEventParticipation';
import { toast } from 'sonner';
import EventMessenger from './event-public/messenger/EventMessenger';

const GlobalEventFocusToggle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventId, isParticipant, isEventActive, loading, allActiveEvents } = useUserActiveEventParticipation();
  const [mode, setMode] = useState<'all' | 'focus'>('all');
  const [showDropup, setShowDropup] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const wasInFocusMode = useRef(false);
  const previousEventActive = useRef<boolean | null>(null);
  const dropupRef = useRef<HTMLDivElement>(null);

  // Sync selectedEventId with hook's eventId
  useEffect(() => {
    if (eventId && !selectedEventId) {
      setSelectedEventId(eventId);
    }
  }, [eventId, selectedEventId]);

  // Determine current mode based on route
  useEffect(() => {
    if (location.pathname.includes('/events/') && eventId) {
      setMode('focus');
      wasInFocusMode.current = true;
    } else {
      setMode('all');
    }
  }, [location.pathname, eventId]);

  // Handle event ending while in focus mode
  useEffect(() => {
    if (previousEventActive.current === null) {
      previousEventActive.current = isEventActive;
      return;
    }

    if (previousEventActive.current === true && isEventActive === false && wasInFocusMode.current) {
      toast.info('O evento terminou', {
        description: 'Redirecionado para o dashboard'
      });
      if (location.pathname.includes('/events/')) {
        navigate('/dashboard', { replace: true });
      }
      wasInFocusMode.current = false;
    }

    previousEventActive.current = isEventActive;
  }, [isEventActive, navigate, location.pathname]);

  // Close dropup on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropupRef.current && !dropupRef.current.contains(e.target as Node)) {
        setShowDropup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading || !isParticipant || !isEventActive || !eventId) {
    return null;
  }

  const handleToggle = (newMode: 'all' | 'focus') => {
    setMode(newMode);
    if (newMode === 'focus') {
      const targetId = selectedEventId || eventId;
      setLastFocusEvent(targetId);
      navigate(`/events/${targetId}`, { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
    setShowDropup(false);
  };

  const handleSelectEvent = (evId: string) => {
    setSelectedEventId(evId);
    setLastFocusEvent(evId);
    setShowDropup(false);
    if (mode === 'focus') {
      navigate(`/events/${evId}`, { replace: true });
    }
  };

  const hasMultipleEvents = allActiveEvents.length > 1;
  const currentEventId = selectedEventId || eventId;

  // Calculate pill position based on mode
  const getPillLeft = () => {
    if (mode === 'all') return '6px';
    return 'calc(50px)'; // After first button
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50" ref={dropupRef}>
        {/* Dropup menu */}
        {showDropup && hasMultipleEvents && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-lg overflow-hidden min-w-[200px]">
            {allActiveEvents.map((event) => (
              <button
                key={event.eventId}
                onClick={() => handleSelectEvent(event.eventId)}
                className={cn(
                  'w-full text-left px-4 py-2.5 text-sm transition-colors',
                  event.eventId === currentEventId
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground hover:bg-muted/50'
                )}
              >
                {event.title}
              </button>
            ))}
          </div>
        )}

        {/* Toggle bar */}
        <div className="flex items-center gap-2">
          {/* ALL / Focus toggle */}
          <div className="bg-background/90 backdrop-blur-md border border-border rounded-full px-1.5 py-1 shadow-lg flex gap-0.5 items-center relative">
            {/* Animated background pill */}
            <motion.div
              className="absolute top-1 bottom-1 rounded-full"
              style={{ background: 'linear-gradient(135deg, hsl(270 70% 55%), hsl(280 80% 62%))' }}
              initial={false}
              animate={{
                left: mode === 'all' ? '6px' : hasMultipleEvents ? 'calc(50% - 14px)' : 'calc(50% + 2px)',
                width: '44px',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
            <button
              onClick={() => handleToggle('all')}
              className="relative z-10 flex items-center justify-center w-[44px] h-[32px] rounded-full transition-colors duration-200"
            >
              <motion.div
                animate={{ scale: mode === 'all' ? 1 : 0.85, opacity: mode === 'all' ? 1 : 0.5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <LayoutGrid className={cn('h-[18px] w-[18px] transition-colors duration-200', mode === 'all' ? 'text-white' : 'text-muted-foreground')} />
              </motion.div>
            </button>
            <button
              onClick={() => handleToggle('focus')}
              className="relative z-10 flex items-center justify-center w-[44px] h-[32px] rounded-full transition-colors duration-200"
            >
              <motion.div
                animate={{ scale: mode === 'focus' ? 1 : 0.85, opacity: mode === 'focus' ? 1 : 0.5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Target className={cn('h-[18px] w-[18px] transition-colors duration-200', mode === 'focus' ? 'text-white' : 'text-muted-foreground')} />
              </motion.div>
            </button>

            {/* Dropup arrow for multiple events */}
            {hasMultipleEvents && (
              <button
                onClick={() => setShowDropup(!showDropup)}
                className={cn(
                  'relative z-10 flex items-center justify-center w-7 h-[32px] rounded-full transition-all',
                  showDropup
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <ChevronUp className={cn('h-4 w-4 transition-transform duration-200', showDropup && 'rotate-180')} />
              </button>
            )}
          </div>

          {/* Chat button — separate pill */}
          <motion.button
            onClick={() => setChatOpen(true)}
            className="bg-background/90 backdrop-blur-md border border-border rounded-full w-[34px] h-[34px] shadow-lg flex items-center justify-center transition-colors duration-200 hover:border-primary/50"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <MessageCircle className="h-[16px] w-[16px] text-muted-foreground" />
          </motion.button>
        </div>
      </div>

      {/* Event Messenger */}
      <EventMessenger
        eventId={currentEventId}
        open={chatOpen}
        onOpenChange={setChatOpen}
      />
    </>
  );
};

export default GlobalEventFocusToggle;
