import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useNewConnections } from '@/hooks/network/useNewConnections';
import { useUserActiveEventParticipation, setLastFocusEvent } from '@/hooks/useUserActiveEventParticipation';
import { LayoutDashboard, Users, Calendar, Target, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import EventMessenger from '@/components/event-public/messenger/EventMessenger';

interface MobileBottomDockProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const MobileBottomDock = ({ activeTab, setActiveTab }: MobileBottomDockProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { newConnectionsCount, hasNewConnections, markNetworkAsViewed } = useNewConnections();
  const { eventId, isParticipant, isEventActive, loading: eventLoading } = useUserActiveEventParticipation();
  const [chatOpen, setChatOpen] = useState(false);

  const isOnDashboard = location.pathname === '/dashboard';
  const isOnFocusMode = location.pathname.startsWith('/events/') && location.pathname.endsWith('/app');

  useEffect(() => {
    if (activeTab === 'network') {
      markNetworkAsViewed();
    }
  }, [activeTab, markNetworkAsViewed]);

  const showFocus = !eventLoading && isParticipant && isEventActive && !!eventId;

  const handleFocusClick = () => {
    if (eventId) {
      setLastFocusEvent(eventId);
      navigate(`/events/${eventId}`, { replace: true });
    }
  };

  const handleDashboardNav = (tabId: string) => {
    if (isOnDashboard && setActiveTab) {
      setActiveTab(tabId);
    } else {
      // Navigate to dashboard and set tab via URL state
      navigate('/dashboard', { state: { tab: tabId } });
    }
  };

  const coreItems = [
    { id: 'overview', icon: LayoutDashboard },
    { id: 'network', icon: Users },
    { id: 'events', icon: Calendar },
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 safe-area-bottom">
        <nav className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-background/40 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/30">
          {coreItems.map((item) => {
            const Icon = item.icon;
            const isActive = isOnDashboard && activeTab === item.id;
            const showBadge = item.id === 'network' && hasNewConnections && activeTab !== 'network';

            return (
              <button
                key={item.id}
                onClick={() => handleDashboardNav(item.id)}
                className={cn(
                  "relative flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-primary/15 text-primary scale-110"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <Icon className="h-6 w-6" />
                {showBadge && (
                  <span className="absolute top-1.5 right-1.5 h-4 min-w-4 px-1 flex items-center justify-center bg-primary text-primary-foreground text-[9px] font-bold rounded-full">
                    {newConnectionsCount > 99 ? '99+' : newConnectionsCount}
                  </span>
                )}
                {isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-[3px] bg-primary rounded-full" />
                )}
              </button>
            );
          })}

          {/* Focus Mode button */}
          {showFocus && (
            <>
              <div className="w-px h-8 bg-white/10 mx-0.5" />
              <motion.button
                onClick={handleFocusClick}
                className={cn(
                  "relative flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-200",
                  isOnFocusMode
                    ? "bg-primary/15 text-primary scale-110"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
                whileTap={{ scale: 0.92 }}
              >
                <div className="absolute inset-2 rounded-lg bg-primary/10 animate-pulse" />
                <Target className="h-6 w-6 relative z-10 text-primary" />
                {isOnFocusMode && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-[3px] bg-primary rounded-full" />
                )}
              </motion.button>
            </>
          )}

          {/* Chat button */}
          {showFocus && (
            <motion.button
              onClick={() => setChatOpen(true)}
              className="relative flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-white/5"
              whileTap={{ scale: 0.92 }}
            >
              <MessageCircle className="h-6 w-6" />
            </motion.button>
          )}
        </nav>
      </div>

      {/* Event Messenger */}
      {showFocus && eventId && (
        <EventMessenger
          eventId={eventId}
          open={chatOpen}
          onOpenChange={setChatOpen}
        />
      )}
    </>
  );
};

export default MobileBottomDock;
