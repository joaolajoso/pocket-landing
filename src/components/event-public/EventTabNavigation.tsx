import { useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Calendar, Users, User, Settings, BarChart3 } from 'lucide-react';
import EventHomeTab from './tabs/EventHomeTab';
import EventProgramaTab from './tabs/EventProgramaTab';
import EventNetworkingTab from './tabs/EventNetworkingTab';
import EventProfileTab from './tabs/EventProfileTab';
import EventManageTab from './tabs/EventManageTab';
import { EventLiveTab } from '@/components/dashboard/tabs/events/EventLiveTab';
import { useProfile } from '@/hooks/useProfile';
import { useNetworkingPreferences } from '@/hooks/profile/useNetworkingPreferences';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { AnimatePresence, motion } from 'framer-motion';

interface EventTabNavigationProps {
  event: any;
  isParticipant: boolean;
  isOrganizer: boolean;
  publicContent: {
    timeline: any[];
    areas: any[];
    map: any;
    customSections: any[];
  };
  participantId?: string;
}

const EventTabNavigation = ({
  event,
  isParticipant,
  isOrganizer,
  publicContent,
  participantId
}: EventTabNavigationProps) => {
  const [activeTab, setActiveTab] = useState('home');
  const { profile } = useProfile();
  const { hasPreferences } = useNetworkingPreferences();
  const isMobile = useIsMobile();

  const profileComplete = useMemo(() => {
    if (!profile) return false;
    const fields = [
      { weight: 20, filled: !!profile.name },
      { weight: 15, filled: !!profile.email },
      { weight: 20, filled: !!profile.job_title },
      { weight: 15, filled: !!profile.headline },
      { weight: 10, filled: !!profile.bio && profile.bio.length >= 20 },
      { weight: 10, filled: !!profile.linkedin },
      { weight: 5, filled: !!profile.photo_url },
      { weight: 5, filled: hasPreferences }
    ];
    const total = fields.reduce((a, f) => a + f.weight, 0);
    const completed = fields.filter(f => f.filled).reduce((a, f) => a + f.weight, 0);
    return Math.round((completed / total) * 100) === 100;
  }, [profile, hasPreferences]);

  const swipeTabs = useMemo(() => {
    const tabs = ['home', 'programa', 'networking', 'profile'];
    if (isOrganizer) tabs.push('live', 'manage');
    return tabs;
  }, [isOrganizer]);

  const swipeHandlers = useSwipeNavigation({
    tabs: swipeTabs,
    activeTab,
    onTabChange: setActiveTab,
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="space-y-4">
      {/* Sticky Tab Navigation */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-2 pt-2 -mx-4 px-4 border-b">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className={`w-full grid ${isOrganizer ? 'grid-cols-6' : 'grid-cols-4'} h-auto p-1`}>
            <TabsTrigger 
              value="home" 
              className="flex flex-col gap-1 py-2 px-1 text-xs"
              data-value="home"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </TabsTrigger>
            <TabsTrigger 
              value="programa" 
              className="flex flex-col gap-1 py-2 px-1 text-xs"
              data-value="programa"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Programa</span>
            </TabsTrigger>
            <TabsTrigger 
              value="networking" 
              className="flex flex-col gap-1 py-2 px-1 text-xs"
              data-value="networking"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Networking</span>
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="flex flex-col gap-1 py-2 px-1 text-xs"
              data-value="profile"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            {isOrganizer && (
              <TabsTrigger 
                value="live" 
                className="flex flex-col gap-1 py-2 px-1 text-xs"
                data-value="live"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Live</span>
              </TabsTrigger>
            )}
            {isOrganizer && (
              <TabsTrigger 
                value="manage" 
                className="flex flex-col gap-1 py-2 px-1 text-xs"
                data-value="manage"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Gerir</span>
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Contents with swipe */}
      <div 
        className="min-h-[60vh]"
        {...(isMobile ? swipeHandlers : {})}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {activeTab === 'home' && (
              <EventHomeTab 
                event={event} 
                publicContent={publicContent}
                participantId={participantId}
                onNavigateToProgram={() => setActiveTab('programa')}
              />
            )}
            {activeTab === 'programa' && (
              <EventProgramaTab 
                event={event} 
                publicContent={publicContent}
              />
            )}
            {activeTab === 'networking' && (
              <EventNetworkingTab 
                eventId={event.id}
                profileComplete={profileComplete}
              />
            )}
            {activeTab === 'profile' && (
              <EventProfileTab 
                onProfileComplete={() => {}}
              />
            )}
            {activeTab === 'live' && isOrganizer && (
              <EventLiveTab eventId={event.id} />
            )}
            {activeTab === 'manage' && isOrganizer && (
              <EventManageTab eventId={event.id} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EventTabNavigation;
