import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNetworkConnections, Connection } from '@/hooks/network/useNetworkConnections';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, UserPlus, Edit, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ContactSubmissions from './network/ContactSubmissions';
import NetworkingPreferencesTab from './network/NetworkingPreferencesTab';
import ConnectionCard from './network/ConnectionCard';
import ConnectionDetailSheet from './network/ConnectionDetailSheet';
import ConnectionFilters, { SortOption, FollowUpFilter, LinkedInFilter, EventFilterOption } from './network/ConnectionFilters';
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/translations/dashboard';
import { getTranslation } from '@/translations';

interface NetworkTabProps {
  initialSubTab?: string;
}

const NetworkTab = ({ initialSubTab }: NetworkTabProps = {}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = getTranslation(language, dashboardTranslations);
  const {
    connections,
    loading,
    error,
    updateConnection,
    removeConnection,
    refreshConnections
  } = useNetworkConnections();
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [followUpFilter, setFollowUpFilter] = useState<FollowUpFilter>('all');
  const [linkedInFilter, setLinkedInFilter] = useState<LinkedInFilter>('all');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  
  // Event filter data
  const [myEvents, setMyEvents] = useState<EventFilterOption[]>([]);
  const [eventParticipantMap, setEventParticipantMap] = useState<Map<string, Set<string>>>(new Map());
  
  // Dialog states
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [editNote, setEditNote] = useState('');
  const [editTag, setEditTag] = useState('');
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(initialSubTab || 'connections');
  const [detailConnection, setDetailConnection] = useState<Connection | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);

  // Fetch events the user participated in + their participants
  useEffect(() => {
    if (!user) return;
    const fetchEventData = async () => {
      // Get events user participated in
      const { data: participations } = await supabase
        .from('event_participants')
        .select('event_id, events!inner(id, title, event_date)')
        .eq('user_id', user.id);
      
      if (!participations || participations.length === 0) return;

      const eventOptions: EventFilterOption[] = participations.map((p: any) => ({
        id: p.events.id,
        title: p.events.title,
        event_date: p.events.event_date,
      }));
      // Sort by date desc
      eventOptions.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
      setMyEvents(eventOptions);

      // Fetch all participants for those events
      const eventIds = eventOptions.map(e => e.id);
      const { data: allParticipants } = await supabase
        .from('event_participants')
        .select('event_id, user_id')
        .in('event_id', eventIds);

      if (allParticipants) {
        const map = new Map<string, Set<string>>();
        allParticipants.forEach((p: any) => {
          if (!map.has(p.event_id)) map.set(p.event_id, new Set());
          map.get(p.event_id)!.add(p.user_id);
        });
        setEventParticipantMap(map);
      }
    };
    fetchEventData();
  }, [user?.id]);

  // Filter and sort connections
  const filteredConnections = useMemo(() => {
    const now = new Date();
    
    let result = connections.filter(connection => {
      const name = connection.profile?.name || '';
      const headline = connection.profile?.headline || '';
      const tag = connection.tag || '';
      const note = connection.note || '';
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = !searchTerm || 
        name.toLowerCase().includes(searchLower) || 
        headline.toLowerCase().includes(searchLower) || 
        tag.toLowerCase().includes(searchLower) || 
        note.toLowerCase().includes(searchLower);
      
      let matchesFollowUp = true;
      if (followUpFilter === 'has_followup') matchesFollowUp = !!connection.follow_up_date;
      else if (followUpFilter === 'no_followup') matchesFollowUp = !connection.follow_up_date;
      else if (followUpFilter === 'overdue') matchesFollowUp = !!connection.follow_up_date && new Date(connection.follow_up_date) < now;
      else if (followUpFilter === 'upcoming') matchesFollowUp = !!connection.follow_up_date && new Date(connection.follow_up_date) >= now;
      
      let matchesLinkedIn = true;
      if (linkedInFilter === 'has_linkedin') matchesLinkedIn = !!connection.profile?.linkedin;
      else if (linkedInFilter === 'no_linkedin') matchesLinkedIn = !connection.profile?.linkedin;
      
      const matchesTag = !selectedTag || connection.tag === selectedTag;

      // Event filter: check if connected user was a participant in the selected event
      let matchesEvent = true;
      if (selectedEventId) {
        const participants = eventParticipantMap.get(selectedEventId);
        matchesEvent = !!participants && participants.has(connection.connected_user_id);
      }
      
      return matchesSearch && matchesFollowUp && matchesLinkedIn && matchesTag && matchesEvent;
    });
    
    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name_asc': return (a.profile?.name || '').localeCompare(b.profile?.name || '');
        case 'name_desc': return (b.profile?.name || '').localeCompare(a.profile?.name || '');
        case 'newest':
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    
    return result;
  }, [connections, searchTerm, sortBy, followUpFilter, linkedInFilter, selectedTag, selectedEventId, eventParticipantMap]);

  const handleEditConnection = (connection: Connection) => {
    setSelectedConnection(connection);
    setEditNote(connection.note || '');
    setEditTag(connection.tag || '');
    setShowNotesDialog(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedConnection) return;
    const updates: { note?: string; tag?: string } = {};
    if (editNote !== selectedConnection.note) updates.note = editNote;
    if (editTag !== selectedConnection.tag) updates.tag = editTag;
    if (Object.keys(updates).length > 0) {
      await updateConnection(selectedConnection.id, updates);
    }
    setShowNotesDialog(false);
  };

  const handleDeleteConnection = () => {
    if (connectionToDelete) {
      setShowDeleteDialog(false);
      removeConnection(connectionToDelete);
    }
  };

  const handleRemoveConnection = (connectionId: string) => {
    setConnectionToDelete(connectionId);
    setShowDeleteDialog(true);
  };

  // Empty state for connections tab
  if (!loading && connections.length === 0 && activeTab === 'connections') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">{t.network.title}</h2>
        </div>

        <Tabs defaultValue="connections" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex gap-2 mb-4">
            {[
              { value: "connections", label: t.network.tabs.connections },
              { value: "preferences", label: t.network.tabs.matchmaking },
              { value: "contacts", label: t.network.tabs.leadCapture },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex-1 px-3 py-2 rounded-full text-xs font-medium border-2 transition-all ${
                  activeTab === tab.value
                    ? "border-pocketcv-purple bg-pocketcv-purple text-white"
                    : "border-pocketcv-purple/50 bg-transparent text-pocketcv-purple hover:border-pocketcv-purple"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <TabsContent value="connections">
            <Card className="border-dashed">
              <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center">
                <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="mb-2">{t.network.noConnections}</CardTitle>
                <CardDescription className="max-w-md">
                  {t.network.emptyMessage}
                </CardDescription>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences">
            <NetworkingPreferencesTab />
          </TabsContent>
          
          <TabsContent value="contacts">
            <ContactSubmissions />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Tabs defaultValue="connections" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex gap-2 mb-4">
          {[
            { value: "connections", label: t.network.tabs.connections },
            { value: "preferences", label: t.network.tabs.matchmaking },
            { value: "contacts", label: t.network.tabs.leadCapture },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 px-3 py-2 rounded-full text-xs font-medium border-2 transition-all ${
                activeTab === tab.value
                  ? "border-pocketcv-purple bg-pocketcv-purple text-white"
                  : "border-pocketcv-purple/50 bg-transparent text-pocketcv-purple hover:border-pocketcv-purple"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <TabsContent value="connections" forceMount={activeTab === "connections" ? true : undefined} className={activeTab !== "connections" ? "hidden" : ""}>
              <div className="space-y-4">
                {/* Search + Filters */}
                <ConnectionFilters
                  connections={connections}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  followUpFilter={followUpFilter}
                  onFollowUpFilterChange={setFollowUpFilter}
                  linkedInFilter={linkedInFilter}
                  onLinkedInFilterChange={setLinkedInFilter}
                  selectedTag={selectedTag}
                  onTagChange={setSelectedTag}
                  selectedEventId={selectedEventId}
                  onEventChange={setSelectedEventId}
                  myEvents={myEvents}
                  filteredCount={filteredConnections.length}
                  totalCount={connections.length}
                />

                {/* Loading state */}
                {loading ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex flex-col items-center p-4 rounded-2xl border border-border">
                        <Skeleton className="h-16 w-16 rounded-full mb-3" />
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-20 mb-3" />
                        <Skeleton className="h-9 w-full rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {error && (
                      <Card className="bg-destructive/10">
                        <CardContent className="pt-6">
                          <p className="text-destructive">Error loading connections: {error}</p>
                          <Button variant="outline" className="mt-2" onClick={() => refreshConnections()}>
                            Try Again
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                    {filteredConnections.length === 0 && (searchTerm || followUpFilter !== 'all' || linkedInFilter !== 'all' || selectedTag) && (
                      <Card className="border-dashed">
                        <CardContent className="pt-6 pb-6 text-center">
                          <p className="text-muted-foreground">
                            {t.network.noResults} "{searchTerm || selectedTag || followUpFilter || linkedInFilter}"
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Connection Cards Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {filteredConnections.map(connection => (
                        <ConnectionCard
                          key={connection.id}
                          connection={connection}
                          onSelect={(c) => {
                            setDetailConnection(c);
                            setShowDetailSheet(true);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="preferences" forceMount={activeTab === "preferences" ? true : undefined} className={activeTab !== "preferences" ? "hidden" : ""}>
              <NetworkingPreferencesTab />
            </TabsContent>
            
            <TabsContent value="contacts" forceMount={activeTab === "contacts" ? true : undefined} className={activeTab !== "contacts" ? "hidden" : ""}>
              <ContactSubmissions />
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      {/* Connection Detail Sheet */}
      <ConnectionDetailSheet
        connection={detailConnection}
        open={showDetailSheet}
        onOpenChange={setShowDetailSheet}
        onEdit={handleEditConnection}
        onRemove={handleRemoveConnection}
        onUpdateFollowUp={(connectionId, date) =>
          updateConnection(connectionId, { follow_up_date: date })
        }
      />

      {/* Edit Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Connection Details</DialogTitle>
            <DialogDescription>
              Add notes or tags to help remember this connection
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="connection-note">Note</Label>
              <Textarea 
                id="connection-note" 
                placeholder="Add a note about where you met or other details..." 
                value={editNote} 
                onChange={e => setEditNote(e.target.value)} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="connection-tag">Tag</Label>
              <Input 
                id="connection-tag" 
                placeholder="E.g. Conference, Client, Colleague..." 
                value={editTag} 
                onChange={e => setEditTag(e.target.value)} 
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Connection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this connection from your network?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConnection}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NetworkTab;
