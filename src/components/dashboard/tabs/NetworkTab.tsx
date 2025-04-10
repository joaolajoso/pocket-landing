
import { useState, useEffect } from 'react';
import { useNetworkConnections, Connection } from '@/hooks/network/useNetworkConnections';
import { useNetworkPrivacy } from '@/hooks/network/useNetworkPrivacy';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, UserPlus, X, UserX, Edit, Save, Tag, Calendar, ExternalLink, RefreshCw } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { getProfileUrl } from '@/lib/supabase';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const NetworkTab = () => {
  const { connections, loading, error, updateConnection, removeConnection, refreshConnections } = useNetworkConnections();
  const { allowNetworkSaves, toggleAllowNetworkSaves, loading: privacyLoading } = useNetworkPrivacy();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [editNote, setEditNote] = useState('');
  const [editTag, setEditTag] = useState('');
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filter connections based on search term
  const filteredConnections = connections.filter(connection => {
    const name = connection.profile?.name || '';
    const headline = connection.profile?.headline || '';
    const tag = connection.tag || '';
    const note = connection.note || '';
    
    const searchLower = searchTerm.toLowerCase();
    return (
      name.toLowerCase().includes(searchLower) ||
      headline.toLowerCase().includes(searchLower) ||
      tag.toLowerCase().includes(searchLower) ||
      note.toLowerCase().includes(searchLower)
    );
  });

  const handleEditConnection = (connection: Connection) => {
    setSelectedConnection(connection);
    setEditNote(connection.note || '');
    setEditTag(connection.tag || '');
    setShowNotesDialog(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedConnection) return;
    
    const updates: { note?: string, tag?: string } = {};
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

  const handleRefreshConnections = async () => {
    setRefreshing(true);
    await refreshConnections();
    setRefreshing(false);
  };

  // Empty state
  if (!loading && connections.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">My Network</h2>
            <p className="text-muted-foreground">Manage connections from your professional network</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="network-privacy"
              checked={allowNetworkSaves}
              onCheckedChange={toggleAllowNetworkSaves}
              disabled={privacyLoading}
            />
            <Label htmlFor="network-privacy">
              {allowNetworkSaves ? 'Others can save your profile' : 'Others cannot save your profile'}
            </Label>
          </div>
        </div>

        <Card className="border-dashed">
          <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center">
            <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">No connections yet</CardTitle>
            <CardDescription className="max-w-md">
              Your network is empty. When someone saves your profile or you save theirs, they'll appear here.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">My Network</h2>
          <p className="text-muted-foreground">Manage connections from your professional network</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="network-privacy"
            checked={allowNetworkSaves}
            onCheckedChange={toggleAllowNetworkSaves}
            disabled={privacyLoading}
          />
          <Label htmlFor="network-privacy">
            {allowNetworkSaves ? 'Others can save your profile' : 'Others cannot save your profile'}
          </Label>
        </div>
      </div>

      {/* Search and Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search connections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          {searchTerm && (
            <Button variant="ghost" size="icon" onClick={() => setSearchTerm('')}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={handleRefreshConnections}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <Card className="bg-destructive/10">
              <CardContent className="pt-6">
                <p className="text-destructive">Error loading connections: {error}</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => refreshConnections()}
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {filteredConnections.length === 0 && searchTerm && (
            <Card className="border-dashed">
              <CardContent className="pt-6 pb-6 text-center">
                <p className="text-muted-foreground">No connections found matching "{searchTerm}"</p>
              </CardContent>
            </Card>
          )}

          {filteredConnections.map((connection) => (
            <Card key={connection.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={connection.profile?.photo_url || connection.profile?.avatar_url || ''} alt={connection.profile?.name || ''} />
                      <AvatarFallback>
                        {connection.profile?.name?.split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()
                          .substring(0, 2) || '??'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{connection.profile?.name || "Unknown"}</CardTitle>
                      <CardDescription className="line-clamp-1">
                        {connection.profile?.headline || connection.profile?.job_title || "No headline"}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditConnection(connection)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveConnection(connection.id)}
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                {connection.note && (
                  <p className="text-sm mb-2">{connection.note}</p>
                )}

                <div className="flex flex-wrap gap-2 mt-1">
                  {connection.tag && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {connection.tag}
                    </Badge>
                  )}
                  
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(connection.created_at), 'MMM d, yyyy')}
                  </Badge>
                </div>
              </CardContent>
              
              <CardFooter className="pt-2">
                {connection.profile?.slug && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs gap-1"
                    onClick={() => window.open(getProfileUrl(connection.profile?.slug || ''), '_blank')}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View Profile
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

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
                onChange={(e) => setEditNote(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="connection-tag">Tag</Label>
              <Input
                id="connection-tag"
                placeholder="E.g. Conference, Client, Colleague..."
                value={editTag}
                onChange={(e) => setEditTag(e.target.value)}
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
